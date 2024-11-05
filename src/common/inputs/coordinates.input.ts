import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

/**
 * Input type for Coordinates.
 */
@InputType()
export class CoordinatesInput {
  @Field(() => Float)
  @IsNumber()
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  longitude: number;
}
