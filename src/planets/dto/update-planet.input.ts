import { InputType, PartialType } from '@nestjs/graphql';
import { CreatePlanetInput } from './create-planet.input';

@InputType()
export class UpdatePlanetInput extends PartialType(CreatePlanetInput) {
  // Inherits all fields from CreatePlanetInput, making them optional
}