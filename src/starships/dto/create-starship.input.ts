import { InputType, Field, ID, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CoordinatesInput } from '../../common/inputs/coordinates.input';

/**
 * Input type for creating a new Starship.
 */
@InputType()
export class CreateStarshipInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  cargoCapacity?: number;

  @Field(() => CoordinatesInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesInput)
  currentLocation?: CoordinatesInput;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  currentStationId?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  passengerIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  enemyIds?: string[];
}
