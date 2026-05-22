import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
// import { EventEmitter2 } from '@nestjs/event-emitter'; // Tidak perlu lagi jika hanya untuk email
import { MailerService } from '@nestjs-modules/mailer'; // <-- 1. Impor MailerService
import { ConfigService } from '@nestjs/config'; // <-- 2. Impor ConfigService
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    // private readonly eventEmitter: EventEmitter2, // Tidak perlu lagi
    private readonly mailerService: MailerService, // <-- 3. Inject MailerService
    private readonly configService: ConfigService, // <-- 4. Inject ConfigService
  ) {}

  async register(registerAuthDto: RegisterAuthDto) {
    const existingUser = await this.usersService.findOneByEmail(
      registerAuthDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await this.usersService.create({
      ...registerAuthDto,
      password: hashedPassword,
      email_verification_token: verificationToken, // Simpan token di DB
    });

    // --- 5. Kirim Email Verifikasi ---
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: newUser.email,
        subject: 'Verify Your Email for Popupalerts',
        html: `
          <p>Hi ${newUser.name || 'there'},</p>
          <p>Thanks for registering! Please click the link below to verify your email:</p>
          <p><a href="${verificationLink}">Verify Email</a></p>
          <p>If you did not create an account, please ignore this email.</p>
        `,
        // Opsional: Gunakan template jika dikonfigurasi di app.module
        // template: 'verification',
        // context: { name: newUser.name, url: verificationLink },
      });
      console.log(`Verification email sent to ${newUser.email}`);
    } catch (error) {
      console.error(`Failed to send verification email to ${newUser.email}`, error);
      // Mungkin tambahkan log error ke sistem monitoring Anda
    }
    // ---------------------------------

    // Hapus data sensitif sebelum dikembalikan
    const { password, email_verification_token, ...result } = newUser;
    return result;
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.usersService.findOneByEmail(loginAuthDto.email);

    // Cek apakah email sudah diverifikasi
    if (user && !user.email_verified_at) {
        throw new ForbiddenException('Please verify your email before logging in.');
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const { password, email_verification_token, password_reset_token, password_reset_expires, ...userResult } = user; // Hapus data sensitif lain

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userResult,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findOneByToken(token);
    if (!user) {
        throw new BadRequestException('Invalid or expired verification token.');
    }
    // Tandai email sebagai terverifikasi dan hapus token
    user.email_verified_at = new Date();
    user.email_verification_token = null;
    await this.usersService.save(user);
    return { message: 'Email successfully verified.' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Jangan bocorkan info user, kirim pesan sukses palsu
      console.log(`Password reset requested for non-existent email: ${email}`);
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Buat token reset (raw & hashed)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Simpan token HASHED dan waktu kedaluwarsa di DB
    user.password_reset_token = hashedToken;
    user.password_reset_expires = new Date(Date.now() + 10 * 60 * 1000); // Valid 10 menit
    await this.usersService.save(user);

    // --- 6. Kirim Email Reset Password ---
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    // Kirim token RAW di link email
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reset Your Popupalerts Password',
        html: `
          <p>Hi ${user.name || 'there'},</p>
          <p>You requested a password reset. Click the link below to set a new password (valid for 10 minutes):</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
        // Opsional: Gunakan template
        // template: 'reset-password',
        // context: { name: user.name, url: resetLink },
      });
      console.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send password reset email to ${user.email}`, error);
       // Reset token di DB jika email gagal terkirim agar user bisa coba lagi
       user.password_reset_token = null;
       user.password_reset_expires = null;
       await this.usersService.save(user);
       // Mungkin lempar error di sini agar user tahu email gagal
       throw new Error('Could not send password reset email. Please try again.');
    }
    // -----------------------------------

    return { message: 'Password reset link sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;
    // Hash token dari email untuk dicocokkan dengan DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findOneByResetToken(hashedToken);

    // Cek validitas token
    if (!user || !user.password_reset_expires || user.password_reset_expires < new Date()) {
        throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    // Update password dan hapus token reset
    user.password = await bcrypt.hash(password, 10);
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await this.usersService.save(user);

    return { message: 'Password has been reset successfully.' };
  }
}