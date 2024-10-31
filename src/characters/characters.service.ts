import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
// Import the Cache module
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheManagerStore } from 'cache-manager';

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
    @Inject(CACHE_MANAGER) private cacheManager: CacheManagerStore,
  ) { }

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
    const savedCharacter = await this.charactersRepository.save(character);

    // Invalidate cache
    await this.cacheManager.del('characters');

    return savedCharacter;
  }

  async findAll(): Promise<Character[]> {
    const cacheKey = 'characters';
    const cachedCharacters = (await this.cacheManager.get(
      cacheKey,
    )) as Character[] | undefined;

    if (cachedCharacters) {
      return cachedCharacters;
    }

    const characters = await this.charactersRepository.find({
      relations: ['currentLocation'],
    });
    await this.cacheManager.set(cacheKey, characters, 300);

    return characters;
  }

  async findOne(id: string): Promise<Character> {
    const cacheKey = `character:${id}`;
    const cachedCharacter = (await this.cacheManager.get(
      cacheKey,
    )) as Character | undefined;

    if (cachedCharacter) {
      return cachedCharacter;
    }

    const character = await this.charactersRepository.findOne({
      where: { id },
      relations: ['currentLocation'],
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, character, 300);

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
    const updatedCharacter = await this.charactersRepository.save(character);

    // Invalidate cache
    await this.cacheManager.del('characters');
    await this.cacheManager.del(`character:${id}`);

    return updatedCharacter;
  }

  async remove(id: string): Promise<void> {
    const result = await this.charactersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    // Invalidate cache
    await this.cacheManager.del('characters');
    await this.cacheManager.del(`character:${id}`);
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
