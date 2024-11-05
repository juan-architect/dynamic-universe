import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CoordinatesInput } from '../../common/inputs/coordinates.input';

@InputType()
export class CreatePlanetInput {
  @Field()
  name: string;

  @Field(() => CoordinatesInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesInput)
  currentLocation?: CoordinatesInput;

  @Field({ nullable: true })
  population?: number;

  @Field({ nullable: true })
  climate?: string;

  @Field({ nullable: true })
  terrain?: string;
}
