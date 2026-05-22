import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config'; // <-- 1. Impor ConfigService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService, // <-- 2. "Suntikkan" ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // --- 3. PERBAIKAN UTAMA DI SINI ---
      // Ambil kunci rahasia dari environment variables, sama seperti AuthModule
      secretOrKey: configService.get<string>('JWT_SECRET'),
      // ---------------------------------
    });
  }

  async validate(payload: any): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    return result;
  }
}