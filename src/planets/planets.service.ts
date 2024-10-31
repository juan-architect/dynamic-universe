import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Import the Cache module
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheManagerStore } from 'cache-manager';

import { Planet } from '../entities/planet.entity';
import { CreatePlanetDto } from './dto/create-planet.dto';
import { UpdatePlanetDto } from './dto/update-planet.dto';

@Injectable()
export class PlanetsService {
  constructor(
    @InjectRepository(Planet)
    private planetsRepository: Repository<Planet>,
    @Inject(CACHE_MANAGER) private cacheManager: CacheManagerStore,
  ) {}

  async create(createPlanetDto: CreatePlanetDto): Promise<Planet> {
    const planet = this.planetsRepository.create(createPlanetDto);
    const savedPlanet = await this.planetsRepository.save(planet);
    
    // Invalidate cache
    await this.cacheManager.del('planets');
    
    return savedPlanet;
  }

  async findAll(): Promise<Planet[]> {
    const cacheKey = 'planets';
    const cachedPlanets = await this.cacheManager.get(cacheKey) as Planet[] | undefined;

    if (cachedPlanets) {
      return cachedPlanets;
    }

    const planets = await this.planetsRepository.find();
    await this.cacheManager.set(cacheKey, planets, 300);

    return planets;
  }

  async findOne(id: string): Promise<Planet> {
    const cacheKey = `planet:${id}`;
    const cachedPlanet = await this.cacheManager.get(cacheKey) as Planet | undefined;;

    if (cachedPlanet) {
      return cachedPlanet;
    }

    const planet = await this.planetsRepository.findOne({ where: { id } });
    if (!planet) {
      throw new NotFoundException(`Planet with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, planet, 300);

    return planet;
  }

  async update(id: string, updatePlanetDto: UpdatePlanetDto): Promise<Planet> {
    const planet = await this.planetsRepository.preload({
      id: id,
      ...updatePlanetDto,
    });
    if (!planet) {
      throw new NotFoundException(`Planet with ID ${id} not found`);
    }

    const updatedPlanet = await this.planetsRepository.save(planet);

    // Invalidate cache
    await this.cacheManager.del('planets');
    await this.cacheManager.del(`planet:${id}`);

    return updatedPlanet;
  }

  async remove(id: string): Promise<void> {
    const result = await this.planetsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Planet with ID ${id} not found`);
    }

    // Invalidate cache
    await this.cacheManager.del('planets');
    await this.cacheManager.del(`planet:${id}`);
  }
}
