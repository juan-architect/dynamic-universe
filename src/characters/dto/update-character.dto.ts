import { PartialType } from '@nestjs/mapped-types';
import { CreateCharacterDto } from './create-character.dto';
import { IsUUID, IsOptional } from 'class-validator';

export class UpdateCharacterDto extends PartialType(CreateCharacterDto) {
  @IsOptional()
  @IsUUID()
  currentLocationId?: string;
}
