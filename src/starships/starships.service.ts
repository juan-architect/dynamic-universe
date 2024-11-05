import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { Starship } from '../entities/starship.entity';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';
import { CreateStarshipInput } from './dto/create-starship.input';
import { UpdateStarshipInput } from './dto/update-starship.input';

@Injectable()
export class StarshipsService {
  constructor(
    @InjectRepository(Starship)
    private starshipsRepository: Repository<Starship>,
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    @InjectRepository(Planet)
    private planetsRepository: Repository<Planet>,
  ) {}

  /**
   * Creates a new starship.
   * @param createStarshipDto - The data required to create a starship.
   * @returns The created starship entity.
   */
  async create(createStarshipDto: CreateStarshipInput): Promise<Starship> {
    const { currentStationId, passengerIds, enemyIds, ...rest } =
      createStarshipDto;

    const passengers = passengerIds
      ? await this.charactersRepository.find({
          where: { id: In(passengerIds) },
        })
      : [];

    const enemies = enemyIds
      ? await this.starshipsRepository.find({
          where: { id: In(enemyIds) },
        })
      : [];

    let currentStation: Planet = null;
    if (currentStationId) {
      currentStation = await this.planetsRepository.findOne({
        where: { id: currentStationId },
      });
      if (!currentStation) {
        throw new NotFoundException(
          `Planet with ID ${currentStationId} not found`,
        );
      }
    }

    const starship = this.starshipsRepository.create({
      ...rest,
      passengers,
      enemies,
      currentStation,
    });

    return await this.starshipsRepository.save(starship);
  }

  /**
   * Retrieves all starships.
   * @returns An array of starship entities.
   */
  async findAll(): Promise<Starship[]> {
    return await this.starshipsRepository.find({
      relations: ['passengers', 'enemies', 'currentStation'],
    });
  }

  /**
   * Retrieves a starship by its ID.
   * @param id - The unique identifier of the starship.
   * @returns The starship entity.
   * @throws NotFoundException if the starship is not found.
   */
  async findOne(id: string): Promise<Starship> {
    const starship = await this.starshipsRepository.findOne({
      where: { id },
      relations: ['passengers', 'enemies', 'currentStation'],
    });
    if (!starship) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }

    return starship;
  }

  /**
   * Updates an existing starship.
   * @param id - The unique identifier of the starship to update.
   * @param updateStarshipDto - The new data for the starship.
   * @returns The updated starship entity.
   * @throws NotFoundException if the starship is not found.
   */
  async update(
    id: string,
    updateStarshipDto: UpdateStarshipInput,
  ): Promise<Starship> {
    const starship = await this.starshipsRepository.findOne({
      where: { id },
      relations: ['passengers', 'enemies', 'currentStation'],
    });

    if (!starship) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }

    const { currentStationId, passengerIds, enemyIds, ...rest } =
      updateStarshipDto;

    // Update basic fields
    Object.assign(starship, rest);

    // Update current station if provided
    if (currentStationId !== undefined) {
      if (currentStationId === null) {
        starship.currentStation = null;
      } else {
        const currentStation = await this.planetsRepository.findOne({
          where: { id: currentStationId },
        });
        if (!currentStation) {
          throw new NotFoundException(
            `Planet with ID ${currentStationId} not found`,
          );
        }
        starship.currentStation = currentStation;
      }
    }

    // Update passengers if provided
    if (passengerIds !== undefined) {
      starship.passengers = await this.charactersRepository.find({
        where: { id: In(passengerIds) },
      });
    }

    // Update enemies if provided
    if (enemyIds !== undefined) {
      starship.enemies = await this.starshipsRepository.find({
        where: { id: In(enemyIds) },
      });
    }

    return await this.starshipsRepository.save(starship);
  }

  /**
   * Deletes a starship by its ID.
   * @param id - The unique identifier of the starship to delete.
   * @throws NotFoundException if the starship is not found.
   */
  async remove(id: string): Promise<void> {
    const result = await this.starshipsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }
  }

  /**
   * Boards a passenger onto a starship.
   * @param starshipId - The ID of the starship.
   * @param characterId - The ID of the character to board.
   * @returns The updated starship entity.
   * @throws NotFoundException if the starship or character is not found.
   * @throws BadRequestException if the character is already on board.
   */
  async boardPassenger(
    starshipId: string,
    characterId: string,
  ): Promise<Starship> {
    const starship = await this.starshipsRepository.findOne({
      where: { id: starshipId },
      relations: ['passengers'],
    });

    if (!starship) {
      throw new NotFoundException(`Starship with ID ${starshipId} not found`);
    }

    const character = await this.charactersRepository.findOne({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    // Check if character is already on board
    if (starship.passengers.some((passenger) => passenger.id === characterId)) {
      throw new BadRequestException(
        `Character with ID ${characterId} is already on board`,
      );
    }

    starship.passengers.push(character);
    return this.starshipsRepository.save(starship);
  }

  /**
   * Disembarks a passenger from a starship.
   * @param starshipId - The ID of the starship.
   * @param characterId - The ID of the character to disembark.
   * @returns The updated starship entity.
   * @throws NotFoundException if the starship or character is not found.
   * @throws BadRequestException if the character is not on board.
   */
  async disembarkPassenger(
    starshipId: string,
    characterId: string,
  ): Promise<Starship> {
    const starship = await this.starshipsRepository.findOne({
      where: { id: starshipId },
      relations: ['passengers'],
    });

    if (!starship) {
      throw new NotFoundException(`Starship with ID ${starshipId} not found`);
    }

    const passengerIndex = starship.passengers.findIndex(
      (passenger) => passenger.id === characterId,
    );

    if (passengerIndex === -1) {
      throw new BadRequestException(
        `Character with ID ${characterId} is not on board`,
      );
    }

    starship.passengers.splice(passengerIndex, 1);
    return this.starshipsRepository.save(starship);
  }

  /**
   * Moves a starship to a new planet (current station).
   * @param starshipId - The ID of the starship.
   * @param planetId - The ID of the planet to travel to.
   * @returns The updated starship entity.
   * @throws NotFoundException if the starship or planet is not found.
   */
  async travel(starshipId: string, planetId: string): Promise<Starship> {
    const starship = await this.starshipsRepository.findOne({
      where: { id: starshipId },
      relations: ['currentStation'],
    });

    if (!starship) {
      throw new NotFoundException(`Starship with ID ${starshipId} not found`);
    }

    const planet = await this.planetsRepository.findOne({
      where: { id: planetId },
    });

    if (!planet) {
      throw new NotFoundException(`Planet with ID ${planetId} not found`);
    }

    // Update the starship's current station
    starship.currentStation = planet;

    return this.starshipsRepository.save(starship);
  }

  /**
   * Calculates the distance between the starship's current station and a planet.
   * @param starshipId - The ID of the starship.
   * @param planetId - The ID of the planet.
   * @returns The distance in kilometers.
   * @throws NotFoundException if the starship or planet is not found.
   * @throws BadRequestException if the starship does not have a current station.
   */
  async calculateDistance(
    starshipId: string,
    planetId: string,
  ): Promise<{ distanceInKm: number }> {
    const starship = await this.starshipsRepository.findOne({
      where: { id: starshipId },
      relations: ['currentStation'],
    });

    if (!starship) {
      throw new NotFoundException(`Starship with ID ${starshipId} not found`);
    }

    if (!starship.currentStation) {
      throw new BadRequestException(
        `Starship with ID ${starshipId} does not have a current station`,
      );
    }

    const planet = await this.planetsRepository.findOne({
      where: { id: planetId },
    });

    if (!planet) {
      throw new NotFoundException(`Planet with ID ${planetId} not found`);
    }

    // Assuming planets have coordinates: latitude and longitude
    const distanceInKm = this.getDistanceFromLatLonInKm(
      starship.currentLocation.latitude,
      starship.currentLocation.longitude,
      planet.currentLocation.latitude,
      planet.currentLocation.longitude,
    );

    return { distanceInKm };
  }

  private getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Finds nearby enemy starships within a specified range from the starship's current station.
   * @param starshipId - The ID of the starship.
   * @param rangeInKm - The range in kilometers.
   * @returns An array of nearby enemy starships.
   * @throws NotFoundException if the starship is not found.
   * @throws BadRequestException if the starship does not have a current station.
   */
  async findNearbyEnemies(
    starshipId: string,
    rangeInKm: number,
  ): Promise<Starship[]> {
    const starship = await this.starshipsRepository.findOne({
      where: { id: starshipId },
      relations: ['currentStation'],
    });

    if (!starship) {
      throw new NotFoundException(`Starship with ID ${starshipId} not found`);
    }

    if (!starship.currentStation) {
      throw new BadRequestException(
        `Starship with ID ${starshipId} does not have a current station`,
      );
    }

    const allEnemyStarships = await this.starshipsRepository.find({
      where: { id: Not(starshipId) },
      relations: ['currentStation'],
    });

    const nearbyEnemies = allEnemyStarships.filter((enemyStarship) => {
      if (!enemyStarship.currentStation) {
        return false;
      }
      const distance = this.getDistanceFromLatLonInKm(
        starship.currentLocation.latitude,
        starship.currentLocation.longitude,
        enemyStarship.currentLocation.latitude,
        enemyStarship.currentLocation.longitude,
      );
      return distance <= rangeInKm;
    });

    return nearbyEnemies;
  }

  /**
   * Spawns a specified number of enemy starships at random planets.
   * @param count - The number of enemy starships to spawn.
   * @returns An array of the spawned enemy starships.
   */
  async spawnEnemies(count: number): Promise<Starship[]> {
    const newStarships: Starship[] = [];
    const planets = await this.planetsRepository.find();

    if (planets.length === 0) {
      throw new BadRequestException(
        'No planets available to spawn enemy starships.',
      );
    }

    for (let i = 0; i < count; i++) {
      const randomPlanet = planets[Math.floor(Math.random() * planets.length)];

      const starship = this.starshipsRepository.create({
        name: `Enemy Ship ${Date.now()}-${i}`,
        model: 'Fighter',
        cargoCapacity: Math.floor(Math.random() * 1000),
        currentStation: randomPlanet,
        passengers: [],
        enemies: [],
      });

      const savedStarship = await this.starshipsRepository.save(starship);
      newStarships.push(savedStarship);
    }

    return newStarships;
  }

  /**
   * Retrieves the current station (planet) of a starship.
   * @param starship - The starship entity.
   * @returns The planet where the starship is currently stationed.
   */
  async getCurrentStation(starship: Starship): Promise<Planet> {
    if (starship.currentStation) {
      // If the currentStation is already loaded, return it
      return starship.currentStation;
    } else {
      // Otherwise, fetch it from the database
      const starshipWithStation = await this.starshipsRepository.findOne({
        where: { id: starship.id },
        relations: ['currentStation'],
      });
      return starshipWithStation?.currentStation || null;
    }
  }

  /**
   * Retrieves the passengers aboard a starship.
   * @param starship - The starship entity.
   * @returns An array of character entities who are passengers.
   */
  async getPassengers(starship: Starship): Promise<Character[]> {
    if (starship.passengers && starship.passengers.length > 0) {
      // If passengers are already loaded, return them
      return starship.passengers;
    } else {
      // Otherwise, fetch them from the database
      const starshipWithPassengers = await this.starshipsRepository.findOne({
        where: { id: starship.id },
        relations: ['passengers'],
      });
      return starshipWithPassengers?.passengers || [];
    }
  }

  /**
   * Retrieves the enemies of a starship.
   * @param starship - The starship entity.
   * @returns An array of enemy starship entities.
   */
  async getEnemies(starship: Starship): Promise<Starship[]> {
    if (starship.enemies && starship.enemies.length > 0) {
      // If enemies are already loaded, return them
      return starship.enemies;
    } else {
      // Otherwise, fetch them from the database
      const starshipWithEnemies = await this.starshipsRepository.findOne({
        where: { id: starship.id },
        relations: ['enemies'],
      });
      return starshipWithEnemies?.enemies || [];
    }
  }
}
