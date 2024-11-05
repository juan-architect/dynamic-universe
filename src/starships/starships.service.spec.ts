import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StarshipsService } from './starships.service';
import { Starship } from '../entities/starship.entity';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('StarshipsService', () => {
  let service: StarshipsService;
  let starshipsRepository: Repository<Starship>;
  let planetsRepository: Repository<Planet>;

  const mockStarship = {
    id: '1',
    name: 'Millennium Falcon',
    model: 'YT-1300',
    cargoCapacity: 100,
    currentLocation: {
      latitude: 0,
      longitude: 0,
    },
    passengers: [],
    enemies: [],
    currentStation: null,
  };

  const mockCharacter = {
    id: '1',
    name: 'Luke Skywalker',
    isForceSensitive: false,
  };

  const mockPlanet = {
    id: '1',
    name: 'Tatooine',
    currentLocation: {
      latitude: 10,
      longitude: 10,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarshipsService,
        {
          provide: getRepositoryToken(Starship),
          useValue: {
            create: jest.fn().mockReturnValue(mockStarship),
            save: jest.fn().mockResolvedValue(mockStarship),
            find: jest.fn().mockResolvedValue([mockStarship]),
            findOne: jest.fn().mockResolvedValue(mockStarship),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(Character),
          useValue: {
            find: jest.fn().mockResolvedValue([mockCharacter]),
            findOne: jest.fn().mockResolvedValue(mockCharacter),
          },
        },
        {
          provide: getRepositoryToken(Planet),
          useValue: {
            find: jest.fn().mockResolvedValue([mockPlanet]),
            findOne: jest.fn().mockResolvedValue(mockPlanet),
          },
        },
      ],
    }).compile();

    service = module.get<StarshipsService>(StarshipsService);
    starshipsRepository = module.get<Repository<Starship>>(
      getRepositoryToken(Starship),
    );
    planetsRepository = module.get<Repository<Planet>>(
      getRepositoryToken(Planet),
    );
  });

  describe('create', () => {
    it('should create a starship successfully', async () => {
      const createStarshipDto = {
        name: 'Millennium Falcon',
        model: 'YT-1300',
        cargoCapacity: 100,
        passengerIds: ['1'],
        enemyIds: ['2'],
        currentStationId: '1',
      };

      const result = await service.create(createStarshipDto);
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.create).toHaveBeenCalled();
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when currentStationId is invalid', async () => {
      jest.spyOn(planetsRepository, 'findOne').mockResolvedValue(null);

      const createStarshipDto = {
        name: 'Millennium Falcon',
        currentStationId: 'invalid-id',
      };

      await expect(service.create(createStarshipDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of starships', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockStarship]);
      expect(starshipsRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single starship', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when starship not found', async () => {
      jest.spyOn(starshipsRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a starship successfully', async () => {
      const updateStarshipDto = {
        id: '1',
        name: 'Updated Falcon',
      };

      const result = await service.update('1', updateStarshipDto);
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when starship not found', async () => {
      jest.spyOn(starshipsRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.update('999', { id: '999', name: 'Updated Falcon' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a starship successfully', async () => {
      await service.remove('1');
      expect(starshipsRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('boardPassenger', () => {
    it('should board a passenger successfully', async () => {
      const result = await service.boardPassenger('1', '1');
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when passenger already on board', async () => {
      const starshipWithPassenger = {
        ...mockStarship,
        passengers: [mockCharacter],
      };
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(starshipWithPassenger);

      await expect(service.boardPassenger('1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('disembarkPassenger', () => {
    it('should disembark a passenger successfully', async () => {
      const starshipWithPassenger = {
        ...mockStarship,
        passengers: [mockCharacter],
      };
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(starshipWithPassenger);

      const result = await service.disembarkPassenger('1', '1');
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when passenger not on board', async () => {
      await expect(service.disembarkPassenger('1', '999')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('travel', () => {
    it('should update starship location successfully', async () => {
      const result = await service.travel('1', '1');
      expect(result).toEqual(mockStarship);
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when planet not found', async () => {
      jest.spyOn(planetsRepository, 'findOne').mockResolvedValue(null);
      await expect(service.travel('1', '999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between starship and planet', async () => {
      const starshipWithLocation = {
        ...mockStarship,
        currentLocation: { latitude: 0, longitude: 0 },
        currentStation: mockPlanet,
      };
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(starshipWithLocation);

      const result = await service.calculateDistance('1', '1');
      expect(result).toHaveProperty('distanceInKm');
    });

    it('should throw BadRequestException when starship has no current station', async () => {
      const starshipWithoutStation = { ...mockStarship, currentStation: null };
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(starshipWithoutStation);

      await expect(service.calculateDistance('1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findNearbyEnemies', () => {
    it('should return nearby enemy starships', async () => {
      const starshipWithLocation = {
        ...mockStarship,
        currentLocation: { latitude: 0, longitude: 0 },
        currentStation: mockPlanet,
      };
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(starshipWithLocation);

      const result = await service.findNearbyEnemies('1', 1000);
      expect(Array.isArray(result)).toBeTruthy();
    });

    it('should throw BadRequestException when starship has no current station', async () => {
      const starshipWithoutStation = { ...mockStarship, currentStation: null };
      jest
        .spyOn(starshipsRepository, 'findOne')
        .mockResolvedValue(starshipWithoutStation);

      await expect(service.findNearbyEnemies('1', 1000)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('spawnEnemies', () => {
    it('should spawn specified number of enemy starships', async () => {
      const result = await service.spawnEnemies(2);
      expect(Array.isArray(result)).toBeTruthy();
      expect(starshipsRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when no planets available', async () => {
      jest.spyOn(planetsRepository, 'find').mockResolvedValue([]);
      await expect(service.spawnEnemies(2)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getCurrentStation', () => {
    it('should return current station if loaded', async () => {
      const starshipWithStation = {
        ...mockStarship,
        currentStation: mockPlanet,
      };
      const result = await service.getCurrentStation(starshipWithStation);
      expect(result).toEqual(mockPlanet);
    });
  });

  describe('getPassengers', () => {
    it('should return passengers if loaded', async () => {
      const starshipWithPassengers = {
        ...mockStarship,
        passengers: [mockCharacter],
      };
      const result = await service.getPassengers(starshipWithPassengers);
      expect(result).toEqual([mockCharacter]);
    });

    it('should fetch passengers if not loaded', async () => {
      const result = await service.getPassengers(mockStarship);
      expect(Array.isArray(result)).toBeTruthy();
    });
  });

  describe('getEnemies', () => {
    it('should return enemies if loaded', async () => {
      const starshipWithEnemies = {
        ...mockStarship,
        enemies: [{ ...mockStarship, id: '2' }],
      };
      const result = await service.getEnemies(starshipWithEnemies);
      expect(result).toHaveLength(1);
    });

    it('should fetch enemies if not loaded', async () => {
      const result = await service.getEnemies(mockStarship);
      expect(Array.isArray(result)).toBeTruthy();
    });
  });
});
