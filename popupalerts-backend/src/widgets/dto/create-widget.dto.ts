// src/widgets/dto/create-widget.dto.ts
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { WidgetType } from '../entities/widget.entity';

export class CreateWidgetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(WidgetType)
  type: WidgetType;

  @IsObject()
  settings: Record<string, any>;
}
