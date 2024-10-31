import { IsString, IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  species: string;

  @IsBoolean()
  sensitivityToForce: boolean;

  @IsUUID()
  currentLocationId: string;
}
