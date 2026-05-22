import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: RegisterAuthDto & { password?: string; email_verification_token?: string },
  ): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email })
      .addSelect('user.password')
      .getOne();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findOneByToken(token: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email_verification_token: token });
  }

  // --- PERBAIKAN UTAMA DI SINI ---
  async findOneByResetToken(hashedToken: string): Promise<User | null> {
    // Menggunakan Query Builder untuk secara eksplisit meminta kolom yang tersembunyi
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.password_reset_token = :token', { token: hashedToken })
      .addSelect('user.password_reset_token') // Minta kolom token
      .addSelect('user.password_reset_expires') // Minta kolom tanggal kedaluwarsa
      .getOne();
  }
  // --------------------------

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}

