import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
// Import the Cache module
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheManagerStore } from 'cache-manager';

import { Starship } from '../entities/starship.entity';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';
import { CreateStarshipDto } from './dto/create-starship.dto';
import { UpdateStarshipDto } from './dto/update-starship.dto';

@Injectable()
export class StarshipsService {
  constructor(
    @InjectRepository(Starship)
    private starshipsRepository: Repository<Starship>,
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    @InjectRepository(Planet)
    private planetsRepository: Repository<Planet>,
    @Inject(CACHE_MANAGER) private cacheManager: CacheManagerStore,
  ) { }

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

    const savedStarship = await this.starshipsRepository.save(starship);

    // Invalidate cache
    await this.cacheManager.del('starships');

    return savedStarship;
  }

  async findAll(): Promise<Starship[]> {
    const cacheKey = 'starships';
    const cachedStarships = (await this.cacheManager.get(
      cacheKey,
    )) as Starship[] | undefined;

    if (cachedStarships) {
      return cachedStarships;
    }

    const starships = await this.starshipsRepository.find({
      relations: ['passengers', 'enemies'],
    });
    await this.cacheManager.set(cacheKey, starships, 300);

    return starships;
  }

  async findOne(id: string): Promise<Starship> {
    const cacheKey = `starship:${id}`;
    const cachedStarship = (await this.cacheManager.get(
      cacheKey,
    )) as Starship | undefined;

    if (cachedStarship) {
      return cachedStarship;
    }

    const starship = await this.starshipsRepository.findOne({
      where: { id },
      relations: ['passengers', 'enemies'],
    });
    if (!starship) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, starship, 300);

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
    const updatedStarship = await this.starshipsRepository.save(starship);

    // Invalidate cache
    await this.cacheManager.del('starships');
    await this.cacheManager.del(`starship:${id}`);

    return updatedStarship;
  }

  async remove(id: string): Promise<void> {
    const result = await this.starshipsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Starship with ID ${id} not found`);
    }

    // Invalidate cache
    await this.cacheManager.del('starships');
    await this.cacheManager.del(`starship:${id}`);
  }

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
      throw new Error(`Character with ID ${characterId} is already on board`);
    }

    starship.passengers.push(character);
    return this.starshipsRepository.save(starship);
  }

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
      throw new Error(`Character with ID ${characterId} is not on board`);
    }

    starship.passengers.splice(passengerIndex, 1);
    return this.starshipsRepository.save(starship);
  }

  async travel(starshipId: string, planetId: string): Promise<Starship> {
    const starship = await this.starshipsRepository.findOne({
      where: { id: starshipId },
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

    // Update the starship's current location to the planet's coordinates
    starship.latitude = planet.latitude;
    starship.longitude = planet.longitude;

    return this.starshipsRepository.save(starship);
  }

  async calculateDistance(
    starshipId: string,
    planetId: string,
  ): Promise<{ distanceInKm: number }> {
    const starship = await this.starshipsRepository.findOne({
      where: { id: starshipId },
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

    const distanceInKm = this.getDistanceFromLatLonInKm(
      starship.latitude,
      starship.longitude,
      planet.latitude,
      planet.longitude,
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

  async findNearbyEnemies(
    starshipId: string,
    rangeInKm: number,
  ): Promise<Starship[]> {
    const starship = await this.starshipsRepository.findOne({
      where: { id: starshipId },
    });

    if (!starship) {
      throw new NotFoundException(`Starship with ID ${starshipId} not found`);
    }

    const allEnemyStarships = await this.starshipsRepository.find({
      where: { id: Not(starshipId) },
    });

    const nearbyEnemies = allEnemyStarships.filter((enemyStarship) => {
      const distance = this.getDistanceFromLatLonInKm(
        starship.latitude,
        starship.longitude,
        enemyStarship.latitude,
        enemyStarship.longitude,
      );
      return distance <= rangeInKm;
    });

    return nearbyEnemies;
  }

  async spawnEnemies(count: number): Promise<Starship[]> {
    const newStarships: Starship[] = [];

    for (let i = 0; i < count; i++) {
      const starship = this.starshipsRepository.create({
        name: `Enemy Ship ${Date.now()}-${i}`,
        model: 'Fighter',
        cargoCapacity: Math.floor(Math.random() * 1000),
        latitude: this.getRandomCoordinate(-90, 90),
        longitude: this.getRandomCoordinate(-180, 180),
        passengers: [],
        enemies: [],
      });

      const savedStarship = await this.starshipsRepository.save(starship);
      newStarships.push(savedStarship);
    }

    return newStarships;
  }

  private getRandomCoordinate(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
