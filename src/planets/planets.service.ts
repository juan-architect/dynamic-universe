import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Planet } from '../entities/planet.entity';
import { CreatePlanetInput } from './dto/create-planet.input';
import { UpdatePlanetInput } from './dto/update-planet.input';

@Injectable()
export class PlanetsService {
  constructor(
    @InjectRepository(Planet)
    private readonly planetsRepository: Repository<Planet>, // Injects the Planet repository
  ) {}

  /**
   * Creates a new planet in the database.
   * @param createPlanetInput - Data required to create a new planet.
   * @returns The newly created planet entity.
   */
  async create(createPlanetInput: CreatePlanetInput): Promise<Planet> {
    // Create a new Planet entity instance with the provided input data
    const planet = this.planetsRepository.create(createPlanetInput);

    // Save the new planet to the database
    return await this.planetsRepository.save(planet);
  }

  /**
   * Retrieves all planets from the database, utilizing caching for performance.
   * @returns An array of Planet entities.
   */
  async findAll(): Promise<Planet[]> {
    return await this.planetsRepository.find();
  }

  /**
   * Retrieves a single planet by its ID.
   * @param id - The UUID of the planet to retrieve.
   * @returns The Planet entity with the specified ID.
   * @throws NotFoundException if the planet does not exist.
   */
  async findOne(id: string): Promise<Planet> {
    const planet = await this.planetsRepository.findOne({ where: { id } });

    if (!planet) {
      // Throw an exception if the planet is not found
      throw new NotFoundException(`Planet with ID ${id} not found`);
    }

    return planet;
  }

  /**
   * Updates an existing planet with new data.
   * @param id - The UUID of the planet to update.
   * @param updatePlanetInput - The new data to update the planet with.
   * @returns The updated Planet entity.
   * @throws NotFoundException if the planet does not exist.
   */
  async update(
    id: string,
    updatePlanetInput: UpdatePlanetInput,
  ): Promise<Planet> {
    // Preload allows us to create a new entity with the given ID and update it with new data
    const planet = await this.planetsRepository.preload({
      id,
      ...updatePlanetInput,
    });

    if (!planet) {
      // Throw an exception if the planet is not found
      throw new NotFoundException(`Planet with ID ${id} not found`);
    }

    // Save the updated planet to the database
    return await this.planetsRepository.save(planet);
  }

  /**
   * Removes a planet from the database.
   * @param id - The UUID of the planet to remove.
   * @returns A boolean indicating the success of the operation.
   * @throws NotFoundException if the planet does not exist.
   */
  async remove(id: string): Promise<boolean> {
    // Delete the planet with the specified ID
    const result = await this.planetsRepository.delete(id);

    if (result.affected === 0) {
      // Throw an exception if the planet is not found
      throw new NotFoundException(`Planet with ID ${id} not found`);
    }

    return true;
  }
}
