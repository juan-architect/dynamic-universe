import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Planet } from '../entities/planet.entity';
import { CreatePlanetDto } from './dto/create-planet.dto';
import { UpdatePlanetDto } from './dto/update-planet.dto';

@Injectable()
export class PlanetsService {
  constructor(
    @InjectRepository(Planet)
    private planetsRepository: Repository<Planet>,
  ) {}

  async create(createPlanetDto: CreatePlanetDto): Promise<Planet> {
    const planet = this.planetsRepository.create(createPlanetDto);
    return this.planetsRepository.save(planet);
  }

  findAll(): Promise<Planet[]> {
    return this.planetsRepository.find();
  }

  async findOne(id: string): Promise<Planet> {
    const planet = await this.planetsRepository.findOne({ where: { id } });
    if (!planet) {
      throw new NotFoundException(`Planet with ID ${id} not found`);
    }
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
    return this.planetsRepository.save(planet);
  }

  async remove(id: string): Promise<void> {
    const result = await this.planetsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Planet with ID ${id} not found`);
    }
  }
}
