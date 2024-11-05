import { Field, Float, ObjectType } from '@nestjs/graphql';

/**
 * Coordinates type representing latitude and longitude.
 */
@ObjectType()
export class Coordinates {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}
