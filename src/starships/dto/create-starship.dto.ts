import {
    IsString,
    IsNumber,
    IsArray,
    IsUUID,
    IsOptional,
    IsNotEmpty,
  } from 'class-validator';
  
  export class CreateStarshipDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()
    model: string;
  
    @IsNumber()
    cargoCapacity: number;
  
    @IsNumber()
    latitude: number;
  
    @IsNumber()
    longitude: number;
  
    @IsArray()
    @IsUUID('all', { each: true })
    @IsOptional()
    passengersIds?: string[];
  
    @IsArray()
    @IsUUID('all', { each: true })
    @IsOptional()
    enemiesIds?: string[];
  }
  