import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Starship } from '../entities/starship.entity';
import { Character } from '../entities/character.entity';
import { CreateStarshipDto } from './dto/create-starship.dto';
import { UpdateStarshipDto } from './dto/update-starship.dto';

@Injectable()
export class StarshipsService {
  constructor(
    @InjectRepository(Starship)
    private starshipsRepository: Repository<Starship>,
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
  ) {}

  async create(createStarshipDto: CreateStarshipDto): Promise<Starship> {
    const { passengersIds, enemiesIds, ...rest } = createStarshipDto;

    const passengers = passengersIds
      ? await this.charactersRepository.find({
          where: { id: In(passengersIds) },
        })
      : [];

    const enemies = enemiesIds
      ? await this.starshipsRepository.find({
          where: { id: In(enemiesIds) },
        })
      : [];

    const starship = this.starshipsRepository.create({
      ...rest,
      passengers,
      enemies,
    });

    return this.starshipsRepository.save(starship);
  }

  findAll(): Promise<Starship[]> {
    return this.starshipsRepository.find({
      relations: ['passengers', 'enemies'],
    });
  }

  async findOne(id: string): Promise<Starship> {
    const starship = await this.starshipsRepository.findOne({
      where: { id },
      relations: ['passengers', 'enemies'],
    });
    if (!starship) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }
    return starship;
  }

  async update(
    id: string,
    updateStarshipDto: UpdateStarshipDto,
  ): Promise<Starship> {
    const starship = await this.starshipsRepository.findOne({
      where: { id },
      relations: ['passengers', 'enemies'],
    });

    if (!starship) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }

    if (updateStarshipDto.passengersIds) {
      const passengers = await this.charactersRepository.find({
        where: { id: In(updateStarshipDto.passengersIds) },
      });
      starship.passengers = passengers;
    }

    if (updateStarshipDto.enemiesIds) {
      const enemies = await this.starshipsRepository.find({
        where: { id: In(updateStarshipDto.enemiesIds) },
      });
      starship.enemies = enemies;
    }

    Object.assign(starship, updateStarshipDto);
    return this.starshipsRepository.save(starship);
  }

  async remove(id: string): Promise<void> {
    const result = await this.starshipsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }
  }
}
