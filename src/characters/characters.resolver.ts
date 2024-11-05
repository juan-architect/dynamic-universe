import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseInterceptors } from '@nestjs/common';
import { GqlCacheInterceptor } from '../interceptors/gql-cache.interceptor';
import { CharactersService } from './characters.service';
import { Character } from '../entities/character.entity';
import { CreateCharacterInput } from './dto/create-character.input';
import { UpdateCharacterInput } from './dto/update-character.input';
import { Planet } from '../entities/planet.entity';
import { Starship } from '../entities/starship.entity';
import { RelocateCharacterInput } from './dto/relocate-character.input';

/**
 * Resolver for handling GraphQL operations related to Characters.
 * Implements caching for improved performance on read operations.
 * Includes a 'relocate' mutation to change a character's homeworld.
 */
@Resolver(() => Character)
export class CharactersResolver {
  constructor(private readonly charactersService: CharactersService) {}

  /**
   * Retrieves all characters.
   * Caches the response to optimize subsequent requests.
   */
  @UseInterceptors(GqlCacheInterceptor)
  @Query(() => [Character], { name: 'characters' })
  findAll() {
    return this.charactersService.findAll();
  }

  /**
   * Retrieves a character by its ID.
   * Caches the result for repeated queries.
   * @param id - The unique identifier of the character.
   */
  @UseInterceptors(GqlCacheInterceptor)
  @Query(() => Character, { name: 'character' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.charactersService.findOne(id);
  }

  /**
   * Creates a new character.
   * @param createCharacterInput - The data required to create a character.
   */
  @Mutation(() => Character)
  createCharacter(
    @Args('createCharacterInput') createCharacterInput: CreateCharacterInput,
  ) {
    return this.charactersService.create(createCharacterInput);
  }

  /**
   * Updates an existing character.
   * @param id - The unique identifier of the character to update.
   * @param updateCharacterInput - The new data for the character.
   */
  @Mutation(() => Character)
  updateCharacter(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCharacterInput') updateCharacterInput: UpdateCharacterInput,
  ) {
    return this.charactersService.update(id, updateCharacterInput);
  }

  /**
   * Deletes a character by its ID.
   * @param id - The unique identifier of the character to delete.
   */
  @Mutation(() => Boolean)
  deleteCharacter(@Args('id', { type: () => ID }) id: string) {
    return this.charactersService.remove(id);
  }

  /**
   * Relocates a character to a new current location (planet).
   * @param id - The unique identifier of the character to relocate.
   * @param relocateCharacterInput - The data required for relocation.
   * @returns The updated character after relocation.
   */
  @Mutation(() => Character)
  relocateCharacter(
    @Args('id', { type: () => ID }) id: string,
    @Args('relocateCharacterInput')
    relocateCharacterInput: RelocateCharacterInput,
  ): Promise<Character> {
    return this.charactersService.relocateCharacter(id, relocateCharacterInput);
  }

  /**
   * Resolves the current location of a character.
   * @param character - The character entity.
   * @returns The planet representing the current location.
   */
  @ResolveField(() => Planet, { name: 'currentLocation' })
  getCurrentLocation(@Parent() character: Character): Promise<Planet> {
    return this.charactersService.getCurrentLocation(character);
  }

  /**
   * Resolves the starships associated with a character.
   * @param character - The character entity.
   * @returns A list of starships the character has piloted.
   */
  @ResolveField(() => [Starship], { name: 'starships' })
  getStarships(@Parent() character: Character): Promise<Starship[]> {
    return this.charactersService.getStarships(character);
  }
}
