import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Float,
  Int,
} from '@nestjs/graphql';
import { StarshipsService } from './starships.service';
import { Starship } from '../entities/starship.entity';
import { CreateStarshipInput } from './dto/create-starship.input';
import { UpdateStarshipInput } from './dto/update-starship.input';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';

@Resolver(() => Starship)
export class StarshipsResolver {
  constructor(private readonly starshipsService: StarshipsService) {}

  /**
   * Retrieves all starships.
   * @returns An array of starship entities.
   */
  @Query(() => [Starship], { name: 'starships' })
  findAll(): Promise<Starship[]> {
    return this.starshipsService.findAll();
  }

  /**
   * Retrieves a starship by its ID.
   * @param id - The unique identifier of the starship.
   * @returns The starship entity.
   */
  @Query(() => Starship, { name: 'starship' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Starship> {
    return this.starshipsService.findOne(id);
  }

  /**
   * Creates a new starship.
   * @param createStarshipInput - The data required to create a starship.
   * @returns The created starship entity.
   */
  @Mutation(() => Starship)
  createStarship(
    @Args('createStarshipInput') createStarshipInput: CreateStarshipInput,
  ): Promise<Starship> {
    return this.starshipsService.create(createStarshipInput);
  }

  /**
   * Updates an existing starship.
   * @param id - The unique identifier of the starship to update.
   * @param updateStarshipInput - The new data for the starship.
   * @returns The updated starship entity.
   */
  @Mutation(() => Starship)
  updateStarship(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateStarshipInput') updateStarshipInput: UpdateStarshipInput,
  ): Promise<Starship> {
    return this.starshipsService.update(id, updateStarshipInput);
  }

  /**
   * Deletes a starship by its ID.
   * @param id - The unique identifier of the starship to delete.
   * @returns A boolean indicating the success of the operation.
   */
  @Mutation(() => Boolean)
  deleteStarship(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.starshipsService
      .remove(id)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Boards a passenger onto a starship.
   * @param starshipId - The ID of the starship.
   * @param characterId - The ID of the character to board.
   * @returns The updated starship entity.
   */
  @Mutation(() => Starship)
  boardPassenger(
    @Args('starshipId', { type: () => ID }) starshipId: string,
    @Args('characterId', { type: () => ID }) characterId: string,
  ): Promise<Starship> {
    return this.starshipsService.boardPassenger(starshipId, characterId);
  }

  /**
   * Disembarks a passenger from a starship.
   * @param starshipId - The ID of the starship.
   * @param characterId - The ID of the character to disembark.
   * @returns The updated starship entity.
   */
  @Mutation(() => Starship)
  disembarkPassenger(
    @Args('starshipId', { type: () => ID }) starshipId: string,
    @Args('characterId', { type: () => ID }) characterId: string,
  ): Promise<Starship> {
    return this.starshipsService.disembarkPassenger(starshipId, characterId);
  }

  /**
   * Moves a starship to a new planet (current station).
   * @param starshipId - The ID of the starship.
   * @param planetId - The ID of the planet to travel to.
   * @returns The updated starship entity.
   */
  @Mutation(() => Starship)
  travel(
    @Args('starshipId', { type: () => ID }) starshipId: string,
    @Args('planetId', { type: () => ID }) planetId: string,
  ): Promise<Starship> {
    return this.starshipsService.travel(starshipId, planetId);
  }

  /**
   * Calculates the distance between the starship's current station and a planet.
   * @param starshipId - The ID of the starship.
   * @param planetId - The ID of the planet.
   * @returns The distance in kilometers.
   */
  @Query(() => Float)
  calculateDistance(
    @Args('starshipId', { type: () => ID }) starshipId: string,
    @Args('planetId', { type: () => ID }) planetId: string,
  ): Promise<number> {
    return this.starshipsService
      .calculateDistance(starshipId, planetId)
      .then((result) => result.distanceInKm);
  }

  /**
   * Finds nearby enemy starships within a specified range from the starship's current station.
   * @param starshipId - The ID of the starship.
   * @param rangeInKm - The range in kilometers.
   * @returns An array of nearby enemy starships.
   */
  @Query(() => [Starship])
  findNearbyEnemies(
    @Args('starshipId', { type: () => ID }) starshipId: string,
    @Args('rangeInKm', { type: () => Float }) rangeInKm: number,
  ): Promise<Starship[]> {
    return this.starshipsService.findNearbyEnemies(starshipId, rangeInKm);
  }

  /**
   * Spawns a specified number of enemy starships at random planets.
   * @param count - The number of enemy starships to spawn.
   * @returns An array of the spawned enemy starships.
   */
  @Mutation(() => [Starship])
  spawnEnemies(
    @Args('count', { type: () => Int }) count: number,
  ): Promise<Starship[]> {
    return this.starshipsService.spawnEnemies(count);
  }

  /**
   * Resolves the current station (planet) of a starship.
   * @param starship - The starship entity.
   * @returns The planet where the starship is currently stationed.
   */
  @ResolveField(() => Planet, { name: 'currentStation' })
  getCurrentStation(@Parent() starship: Starship): Promise<Planet> {
    return this.starshipsService.getCurrentStation(starship);
  }

  /**
   * Resolves the passengers aboard the starship.
   * @param starship - The starship entity.
   * @returns A list of characters who are passengers.
   */
  @ResolveField(() => [Character], { name: 'passengers' })
  getPassengers(@Parent() starship: Starship): Promise<Character[]> {
    return this.starshipsService.getPassengers(starship);
  }

  /**
   * Resolves the enemies of the starship.
   * @param starship - The starship entity.
   * @returns A list of enemy starships.
   */
  @ResolveField(() => [Starship], { name: 'enemies' })
  getEnemies(@Parent() starship: Starship): Promise<Starship[]> {
    return this.starshipsService.getEnemies(starship);
  }
}
