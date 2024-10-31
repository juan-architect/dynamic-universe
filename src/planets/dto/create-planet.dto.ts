import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePlanetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  population: number;

  @IsString()
  climate: string;

  @IsString()
  terrain: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
