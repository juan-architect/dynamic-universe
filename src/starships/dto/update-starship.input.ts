import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateStarshipInput } from './create-starship.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateStarshipInput extends PartialType(CreateStarshipInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
