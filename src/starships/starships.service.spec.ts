import { Test, TestingModule } from '@nestjs/testing';
import { StarshipsService } from './starships.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Starship } from '../entities/starship.entity';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';
import { Repository, In, Not } from 'typeorm';

const mockStarship = {
  id: 'starship-uuid',
  name: 'Millennium Falcon',
  model: 'YT-1300 light freighter',
  cargoCapacity: 100000,
  latitude: 34.0522,
  longitude: -118.2437,
  passengers: [],
  enemies: [],
};

const mockCharacter = {
  id: 'character-uuid',
  name: 'Han Solo',
};

const mockPlanet = {
  id: 'planet-uuid',
  name: 'Tatooine',
  latitude: 34.0522,
  longitude: -118.2437,
};

describe('StarshipsService', () => {
  let service: StarshipsService;
  let starshipsRepository: Repository<Starship>;
  let charactersRepository: Repository<Character>;
  let planetsRepository: Repository<Planet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarshipsService,
        {
          provide: getRepositoryToken(Starship),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Character),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Planet),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StarshipsService>(StarshipsService);
    starshipsRepository = module.get<Repository<Starship>>(
      getRepositoryToken(Starship),
    );
    charactersRepository = module.get<Repository<Character>>(
      getRepositoryToken(Character),
    );
    planetsRepository = module.get<Repository<Planet>>(
      getRepositoryToken(Planet),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new starship', async () => {
      jest
        .spyOn(charactersRepository, 'find')
        .mockResolvedValue([mockCharacter] as any);
      jest
        .spyOn(starshipsRepository, 'find')
        .mockResolvedValue([mockStarship] as any);
      jest
        .spyOn(starshipsRepository, 'create')
        .mockReturnValue(mockStarship as any);
      jest
        .spyOn(starshipsRepository, 'save')
        .mockResolvedValue(mockStarship as any);

      const result = await service.create({
        ...mockStarship,
        passengersIds: ['character-uuid'],
        enemiesIds: ['starship-uuid'],
      });
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.create).toHaveBeenCalled();
      expect(starshipsRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of starships', async () => {
      jest
        .spyOn(starshipsRepository, 'find')
        .mockResolvedValue([mockStarship] as any);

      const result = await service.findAll();
      expect(result).toEqual([mockStarship]);
      expect(starshipsRepository.find).toHaveBeenCalledWith({
        relations: ['passengers', 'enemies'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a starship by ID', async () => {
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(mockStarship as any);

      const result = await service.findOne('starship-uuid');
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'starship-uuid' },
        relations: ['passengers', 'enemies'],
      });
    });

    it('should throw NotFoundException if starship not found', async () => {
      jest.spyOn(starshipsRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne('non-existent-id')).rejects.toThrowError(
        `Starship with ID non-existent-id not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a starship', async () => {
      const updatedStarship = { ...mockStarship, name: 'Updated Name' };
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(mockStarship as any);
      jest
        .spyOn(starshipsRepository, 'save')
        .mockResolvedValue(updatedStarship as any);

      const result = await service.update('starship-uuid', {
        name: 'Updated Name',
      });
      expect(result).toEqual(updatedStarship);
      expect(starshipsRepository.save).toHaveBeenCalledWith({
        ...mockStarship,
        name: 'Updated Name',
      });
    });

    it('should throw NotFoundException if starship not found', async () => {
      jest.spyOn(starshipsRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.update('non-existent-id', { name: 'Updated Name' }),
      ).rejects.toThrowError(`Starship with ID non-existent-id not found`);
    });
  });

  describe('remove', () => {
    it('should remove a starship', async () => {
      jest
        .spyOn(starshipsRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove('starship-uuid')).resolves.toBeUndefined();
      expect(starshipsRepository.delete).toHaveBeenCalledWith('starship-uuid');
    });

    it('should throw NotFoundException if starship not found', async () => {
      jest
        .spyOn(starshipsRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove('non-existent-id')).rejects.toThrowError(
        `Starship with ID non-existent-id not found`,
      );
    });
  });

  describe('boardPassenger', () => {
    it('should board a passenger onto the starship', async () => {
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue({
          ...mockStarship,
          passengers: [],
        } as any);
      jest
        .spyOn(charactersRepository, 'findOne')
        .mockResolvedValue(mockCharacter as any);
      jest
        .spyOn(starshipsRepository, 'save')
        .mockResolvedValue(mockStarship as any);

      const result = await service.boardPassenger(
        'starship-uuid',
        'character-uuid',
      );
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    describe('boardPassenger', () => {
      it('should throw error if passenger already on board', async () => {
        jest
          .spyOn(starshipsRepository, 'findOne')
          .mockResolvedValue({
            ...mockStarship,
            passengers: [mockCharacter],
          } as any);
        jest
          .spyOn(charactersRepository, 'findOne')
          .mockResolvedValue(mockCharacter as any);
  
        await expect(
          service.boardPassenger('starship-uuid', 'character-uuid'),
        ).rejects.toThrowError(
          `Character with ID character-uuid is already on board`,
        );
      });
    });
  });

  describe('disembarkPassenger', () => {
    it('should disembark a passenger from the starship', async () => {
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue({
          ...mockStarship,
          passengers: [mockCharacter],
        } as any);
      jest
        .spyOn(starshipsRepository, 'save')
        .mockResolvedValue(mockStarship as any);

      const result = await service.disembarkPassenger(
        'starship-uuid',
        'character-uuid',
      );
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    it('should throw error if passenger not on board', async () => {
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue({
          ...mockStarship,
          passengers: [],
        } as any);

      await expect(
        service.disembarkPassenger('starship-uuid', 'character-uuid'),
      ).rejects.toThrowError(
        `Character with ID character-uuid is not on board`,
      );
    });
  });

  describe('travel', () => {
    it('should move the starship to the planet location', async () => {
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(mockStarship as any);
      jest
        .spyOn(planetsRepository, 'findOne')
        .mockResolvedValue(mockPlanet as any);
      jest
        .spyOn(starshipsRepository, 'save')
        .mockResolvedValue(mockStarship as any);

      const result = await service.travel('starship-uuid', 'planet-uuid');
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if starship not found', async () => {
      jest.spyOn(starshipsRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.travel('non-existent-id', 'planet-uuid'),
      ).rejects.toThrowError(`Starship with ID non-existent-id not found`);
    });

    it('should throw NotFoundException if planet not found', async () => {
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(mockStarship as any);
      jest.spyOn(planetsRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.travel('starship-uuid', 'non-existent-planet'),
      ).rejects.toThrowError(
        `Planet with ID non-existent-planet not found`,
      );
    });
  });

  describe('calculateDistance', () => {
    it('should calculate the distance between starship and planet', async () => {
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(mockStarship as any);
      jest
        .spyOn(planetsRepository, 'findOne')
        .mockResolvedValue(mockPlanet as any);

      const result = await service.calculateDistance(
        'starship-uuid',
        'planet-uuid',
      );
      expect(result).toHaveProperty('distanceInKm');
    });
  });

  describe('findNearbyEnemies', () => {
    it('should find nearby enemy starships within range', async () => {
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(mockStarship as any);
      jest
        .spyOn(starshipsRepository, 'find')
        .mockResolvedValue([mockStarship] as any);

      const result = await service.findNearbyEnemies('starship-uuid', 1000);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('spawnEnemies', () => {
    it('should spawn random enemy starships', async () => {
      jest
        .spyOn(starshipsRepository, 'create')
        .mockImplementation((entity) => {
          return entity as Starship;
        });
      jest
        .spyOn(starshipsRepository, 'save')
        .mockImplementation(async (entity) => {
          return {
            ...entity,
            id: `starship-${Math.random()}`,
          } as Starship;
        });
  
      const result = await service.spawnEnemies(3);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(3);
      result.forEach((starship) => {
        expect(starship).toHaveProperty('id');
        expect(starship.id).toContain('starship-');
      });
    });
  });
});
