import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';
import { Starship } from '../entities/starship.entity';
import { CreateCharacterInput } from './dto/create-character.input';
import { UpdateCharacterInput } from './dto/update-character.input';
import { RelocateCharacterInput } from './dto/relocate-character.input';

/**
 * Service responsible for handling business logic related to Characters.
 * Includes methods for creating, retrieving, updating, and deleting characters.
 */
@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private readonly charactersRepository: Repository<Character>,
    @InjectRepository(Planet)
    private readonly planetsRepository: Repository<Planet>,
    @InjectRepository(Starship)
    private readonly starshipsRepository: Repository<Starship>,
  ) {}

  /**
   * Creates a new character.
   * @param createCharacterInput - The data required to create a character.
   * @returns The created character entity.
   */
  async create(createCharacterInput: CreateCharacterInput): Promise<Character> {
    const { currentLocationId, starshipIds, ...rest } = createCharacterInput;

    // Create a new character instance
    const character = this.charactersRepository.create(rest);

    // Associate current location if provided
    if (currentLocationId) {
      const currentLocation = await this.planetsRepository.findOne({
        where: { id: currentLocationId },
      });
      if (!currentLocation) {
        throw new NotFoundException(
          `Planet with ID ${currentLocationId} not found`,
        );
      }
      character.currentLocation = currentLocation;
    }

    // Associate starships if provided
    if (starshipIds && starshipIds.length > 0) {
      const starships = await this.starshipsRepository.find({
        where: { id: In(starshipIds) },
      });
      character.starships = starships;
    }

    // Save the character to the database
    return this.charactersRepository.save(character);
  }

  /**
   * Retrieves all characters.
   * @returns An array of character entities.
   */
  async findAll(): Promise<Character[]> {
    return this.charactersRepository.find({
      relations: ['currentLocation', 'starships'],
    });
  }

  /**
   * Retrieves a character by its ID.
   * @param id - The unique identifier of the character.
   * @returns The character entity.
   * @throws NotFoundException if the character is not found.
   */
  async findOne(id: string): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id },
      relations: ['currentLocation', 'starships'],
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    return character;
  }

  /**
   * Updates an existing character.
   * @param id - The unique identifier of the character to update.
   * @param updateCharacterInput - The new data for the character.
   * @returns The updated character entity.
   * @throws NotFoundException if the character is not found.
   */
  async update(
    id: string,
    updateCharacterInput: UpdateCharacterInput,
  ): Promise<Character> {
    const { currentLocationId, starshipIds, ...rest } = updateCharacterInput;

    // Find the character to update
    let character = await this.charactersRepository.findOne({ where: { id } });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    // Update basic fields
    character = { ...character, ...rest };

    // Update current location if provided
    if (currentLocationId !== undefined) {
      if (currentLocationId === null) {
        character.currentLocation = null;
      } else {
        const currentLocation = await this.planetsRepository.findOne({
          where: { id: currentLocationId },
        });
        if (!currentLocation) {
          throw new NotFoundException(
            `Planet with ID ${currentLocationId} not found`,
          );
        }
        character.currentLocation = currentLocation;
      }
    }

    // Update starships if provided
    if (starshipIds !== undefined) {
      if (starshipIds.length === 0) {
        character.starships = [];
      } else {
        const starships = await this.starshipsRepository.find({
          where: { id: In(starshipIds) },
        });
        character.starships = starships;
      }
    }

    // Save the updated character to the database
    return this.charactersRepository.save(character);
  }

  /**
   * Deletes a character by its ID.
   * @param id - The unique identifier of the character to delete.
   * @returns A boolean indicating the success of the operation.
   * @throws NotFoundException if the character is not found.
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.charactersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    return true;
  }

  /**
   * Retrieves the current location of a character.
   * Used by the resolver to populate the 'currentLocation' field.
   * @param character - The character entity.
   * @returns The planet entity.
   */
  async getCurrentLocation(character: Character): Promise<Planet> {
    if (character.currentLocation) {
      return character.currentLocation;
    }
    return null;
  }

  /**
   * Retrieves the starships associated with a character.
   * Used by the resolver to populate the 'starships' field.
   * @param character - The character entity.
   * @returns An array of starship entities.
   */
  async getStarships(character: Character): Promise<Starship[]> {
    if (character.starships) {
      return character.starships;
    }
    return [];
  }

  /**
   * Relocates a character to a new current location (planet).
   * @param id - The ID of the character to relocate.
   * @param relocateCharacterInput - Contains the new location ID.
   * @returns The updated character entity.
   * @throws NotFoundException if the character or new location is not found.
   */
  async relocateCharacter(
    id: string,
    relocateCharacterInput: RelocateCharacterInput,
  ): Promise<Character> {
    // Find the character to relocate
    const character = await this.charactersRepository.findOne({
      where: { id },
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    // Find the new location (planet)
    const newLocation = await this.planetsRepository.findOne({
      where: { id: relocateCharacterInput.newLocationId },
    });
    if (!newLocation) {
      throw new NotFoundException(
        `Planet with ID ${relocateCharacterInput.newLocationId} not found`,
      );
    }

    // Update the character's currentLocation
    character.currentLocation = newLocation;

    // Save and return the updated character
    return this.charactersRepository.save(character);
  }
}
