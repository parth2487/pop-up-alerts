// popupalerts-backend/src/admin/dto/update-user-role.dto.ts
import { IsIn, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['user', 'admin'])
  role: 'user' | 'admin';
}