import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateCharacterInput } from './create-character.input';
import { IsUUID } from 'class-validator';

/**
 * Input type for updating an existing Character.
 * Inherits from CreateCharacterInput and makes fields optional.
 */
@InputType()
export class UpdateCharacterInput extends PartialType(CreateCharacterInput) {
  /**
   * The unique identifier of the character to update.
   */
  @Field(() => ID)
  @IsUUID()
  id: string;
}
