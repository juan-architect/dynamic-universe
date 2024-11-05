import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';
import { Starship } from '../entities/starship.entity';

describe('CharactersService', () => {
  let service: CharactersService;
  let characterRepository: Repository<Character>;
  let planetRepository: Repository<Planet>;
  let starshipRepository: Repository<Starship>;

  const mockPlanet: Planet = {
    id: '1',
    name: 'Tatooine',
    climate: 'Arid',
    terrain: 'Desert',
    population: 200000,
  };

  const mockStarship: Starship = {
    id: '1',
    name: 'X-Wing',
    model: 'T-65',
    cargoCapacity: 100,
  };

  const mockCharacter: Character = {
    id: '1',
    name: 'Luke Skywalker',
    species: 'Human',
    isForceSensitive: true,
    currentLocation: mockPlanet,
    starships: [mockStarship],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: getRepositoryToken(Character),
          useValue: {
            create: jest.fn().mockReturnValue(mockCharacter),
            save: jest.fn().mockResolvedValue(mockCharacter),
            find: jest.fn().mockResolvedValue([mockCharacter]),
            findOne: jest.fn().mockResolvedValue(mockCharacter),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(Planet),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockPlanet),
          },
        },
        {
          provide: getRepositoryToken(Starship),
          useValue: {
            find: jest.fn().mockResolvedValue([mockStarship]),
          },
        },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    characterRepository = module.get<Repository<Character>>(
      getRepositoryToken(Character),
    );
    planetRepository = module.get<Repository<Planet>>(
      getRepositoryToken(Planet),
    );
    starshipRepository = module.get<Repository<Starship>>(
      getRepositoryToken(Starship),
    );
  });

  describe('create', () => {
    it('should create a character successfully', async () => {
      const createCharacterInput = {
        name: 'Luke Skywalker',
        species: 'Human',
        isForceSensitive: true,
        currentLocationId: '1',
        starshipIds: ['1'],
      };

      const result = await service.create(createCharacterInput);

      expect(planetRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(starshipRepository.find).toHaveBeenCalledWith({
        where: { id: In(['1']) },
      });
      expect(characterRepository.create).toHaveBeenCalled();
      expect(characterRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCharacter);
    });

    it('should throw NotFoundException when planet not found', async () => {
      jest.spyOn(planetRepository, 'findOne').mockResolvedValue(null);

      const createCharacterInput = {
        name: 'Luke Skywalker',
        isForceSensitive: true,
        currentLocationId: 'invalid-id',
      };

      await expect(service.create(createCharacterInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create a character without optional fields', async () => {
      const createCharacterInput = {
        name: 'Luke Skywalker',
        isForceSensitive: true,
      };

      const result = await service.create(createCharacterInput);

      expect(characterRepository.create).toHaveBeenCalled();
      expect(characterRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCharacter);
    });
  });

  describe('findAll', () => {
    it('should return an array of characters', async () => {
      const result = await service.findAll();

      expect(characterRepository.find).toHaveBeenCalledWith({
        relations: ['currentLocation', 'starships'],
      });
      expect(result).toEqual([mockCharacter]);
    });

    it('should return empty array when no characters exist', async () => {
      jest.spyOn(characterRepository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single character', async () => {
      const result = await service.findOne('1');

      expect(characterRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['currentLocation', 'starships'],
      });
      expect(result).toEqual(mockCharacter);
    });

    it('should throw NotFoundException when character not found', async () => {
      jest.spyOn(characterRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a character successfully', async () => {
      const updateCharacterInput = {
        id: '1',
        name: 'Luke Skywalker Updated',
        currentLocationId: '1',
        starshipIds: ['1'],
      };

      const result = await service.update('1', updateCharacterInput);

      expect(characterRepository.findOne).toHaveBeenCalled();
      expect(planetRepository.findOne).toHaveBeenCalled();
      expect(starshipRepository.find).toHaveBeenCalled();
      expect(characterRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCharacter);
    });

    it('should throw NotFoundException when character not found', async () => {
      jest.spyOn(characterRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update('999', { id: '999', name: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update character with null location', async () => {
      const updateCharacterInput = {
        id: '1',
        currentLocationId: null,
      };

      const result = await service.update('1', updateCharacterInput);

      expect(characterRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCharacter);
    });
  });

  describe('remove', () => {
    it('should remove a character successfully', async () => {
      const result = await service.remove('1');

      expect(characterRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });
  });

  describe('getCurrentLocation', () => {
    it('should return the current location if it exists', async () => {
      const result = await service.getCurrentLocation(mockCharacter);
      expect(result).toEqual(mockPlanet);
    });

    it('should return null if no current location', async () => {
      const characterWithoutLocation = {
        ...mockCharacter,
        currentLocation: null,
      };
      const result = await service.getCurrentLocation(characterWithoutLocation);
      expect(result).toBeNull();
    });
  });

  describe('getStarships', () => {
    it('should return starships if they exist', async () => {
      const result = await service.getStarships(mockCharacter);
      expect(result).toEqual([mockStarship]);
    });

    it('should return empty array if no starships', async () => {
      const characterWithoutStarships = { ...mockCharacter, starships: null };
      const result = await service.getStarships(characterWithoutStarships);
      expect(result).toEqual([]);
    });
  });

  describe('relocateCharacter', () => {
    it('should relocate a character successfully', async () => {
      const relocateCharacterInput = {
        newLocationId: '2',
      };

      const result = await service.relocateCharacter(
        '1',
        relocateCharacterInput,
      );

      expect(characterRepository.findOne).toHaveBeenCalled();
      expect(planetRepository.findOne).toHaveBeenCalled();
      expect(characterRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCharacter);
    });

    it('should throw NotFoundException when character not found', async () => {
      jest.spyOn(characterRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.relocateCharacter('999', { newLocationId: '1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when new location not found', async () => {
      jest.spyOn(planetRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.relocateCharacter('1', { newLocationId: 'invalid-id' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
