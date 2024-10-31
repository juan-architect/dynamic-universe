import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Character } from '../entities/character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Planet } from '../entities/planet.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    @InjectRepository(Planet)
    private planetsRepository: Repository<Planet>,
  ) {}

  async create(createCharacterDto: CreateCharacterDto): Promise<Character> {
    const { currentLocationId, ...rest } = createCharacterDto;
    const planet = await this.planetsRepository.findOne({
      where: { id: currentLocationId },
    });

    if (!planet) {
      throw new NotFoundException(
        `Planet with ID ${currentLocationId} not found`,
      );
    }

    const character = this.charactersRepository.create({
      ...rest,
      currentLocation: planet,
    });
    return this.charactersRepository.save(character);
  }

  findAll(): Promise<Character[]> {
    return this.charactersRepository.find({ relations: ['currentLocation'] });
  }

  async findOne(id: string): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id },
      relations: ['currentLocation'],
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    return character;
  }

  async update(
    id: string,
    updateCharacterDto: UpdateCharacterDto,
  ): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id },
      relations: ['currentLocation'],
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    if (updateCharacterDto.currentLocationId) {
      const planet = await this.planetsRepository.findOne({
        where: { id: updateCharacterDto.currentLocationId },
      });
      if (!planet) {
        throw new NotFoundException(
          `Planet with ID ${updateCharacterDto.currentLocationId} not found`,
        );
      }
      character.currentLocation = planet;
    }

    Object.assign(character, updateCharacterDto);
    return this.charactersRepository.save(character);
  }

  async remove(id: string): Promise<void> {
    const result = await this.charactersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
  }

  async relocate(characterId: string, planetId: string): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id: characterId },
      relations: ['currentLocation'],
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    const planet = await this.planetsRepository.findOne({
      where: { id: planetId },
    });

    if (!planet) {
      throw new NotFoundException(`Planet with ID ${planetId} not found`);
    }

    character.currentLocation = planet;
    return this.charactersRepository.save(character);
  }
}
