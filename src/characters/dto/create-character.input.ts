import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsString,
  IsArray,
  IsBoolean,
} from 'class-validator';

/**
 * Input type for creating a new Character.
 */
@InputType()
export class CreateCharacterInput {
  /**
   * The name of the character.
   */
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * The species of the character.
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  species?: string;

  /**
   * Indicates if the character is sensitive to the Force.
   */
  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isForceSensitive: boolean;

  /**
   * The ID of the planet representing the character's current location.
   */
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  currentLocationId?: string;

  /**
   * A list of IDs representing the starships the character has piloted.
   */
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  starshipIds?: string[];
}
