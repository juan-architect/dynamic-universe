import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Input type for relocating a character to a new current location.
 */
@InputType()
export class RelocateCharacterInput {
  /**
   * The ID of the new planet representing the character's current location.
   */
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  newLocationId: string;
}
