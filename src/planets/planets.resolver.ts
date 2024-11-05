import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseInterceptors } from '@nestjs/common';
import { GqlCacheInterceptor } from '../interceptors/gql-cache.interceptor'; // Adjust the import path accordingly
import { PlanetsService } from './planets.service';
import { Planet } from '../entities/planet.entity';
import { CreatePlanetInput } from './dto/create-planet.input';
import { UpdatePlanetInput } from './dto/update-planet.input';

/**
 * Resolver for handling GraphQL operations related to Planets.
 * Applies caching to improve performance for read operations.
 */
@Resolver(() => Planet)
export class PlanetsResolver {
  constructor(private readonly planetsService: PlanetsService) {}

  /**
   * Retrieves all planets.
   * Uses caching to store the response for subsequent requests.
   */
  @UseInterceptors(GqlCacheInterceptor) // Uses the custom cache interceptor
  @Query(() => [Planet], { name: 'planets' })
  findAll() {
    return this.planetsService.findAll();
  }

  /**
   * Retrieves a planet by its ID.
   * Caches the response to optimize repeated queries for the same planet.
   * @param id - The unique identifier of the planet.
   */
  @UseInterceptors(GqlCacheInterceptor)
  @Query(() => Planet, { name: 'planet' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.planetsService.findOne(id);
  }

  /**
   * Creates a new planet.
   * Mutations are not cached since they modify the data.
   * @param createPlanetInput - The data required to create a new planet.
   */
  @Mutation(() => Planet)
  createPlanet(
    @Args('createPlanetInput') createPlanetInput: CreatePlanetInput,
  ) {
    return this.planetsService.create(createPlanetInput);
  }

  /**
   * Updates an existing planet.
   * @param id - The unique identifier of the planet to update.
   * @param updatePlanetInput - The new data for the planet.
   */
  @Mutation(() => Planet)
  updatePlanet(
    @Args('id', { type: () => ID }) id: string,
    @Args('updatePlanetInput') updatePlanetInput: UpdatePlanetInput,
  ) {
    return this.planetsService.update(id, updatePlanetInput);
  }

  /**
   * Deletes a planet by its ID.
   * @param id - The unique identifier of the planet to delete.
   */
  @Mutation(() => Boolean)
  deletePlanet(@Args('id', { type: () => ID }) id: string) {
    return this.planetsService.remove(id);
  }
}
