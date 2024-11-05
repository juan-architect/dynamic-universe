import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PlanetsService } from './planets.service';
import { Planet } from '../entities/planet.entity';
import { CreatePlanetInput } from './dto/create-planet.input';
import { UpdatePlanetInput } from './dto/update-planet.input';

describe('PlanetsService', () => {
  let service: PlanetsService;
  let repository: Repository<Planet>;

  const mockPlanet: Planet = {
    id: '1',
    name: 'Tatooine',
    climate: 'Arid',
    terrain: 'Desert',
    population: 200000,
    currentLocation: {
      latitude: 23.4,
      longitude: 45.6,
    },
    residents: [],
    natives: [],
    stationedStarships: [],
  };

  const mockCreatePlanetInput: CreatePlanetInput = {
    name: 'Tatooine',
    climate: 'Arid',
    terrain: 'Desert',
    population: 200000,
    currentLocation: {
      latitude: 23.4,
      longitude: 45.6,
    },
  };

  const mockUpdatePlanetInput: UpdatePlanetInput = {
    name: 'Updated Tatooine',
    climate: 'Very Arid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanetsService,
        {
          provide: getRepositoryToken(Planet),
          useValue: {
            create: jest.fn().mockReturnValue(mockPlanet),
            save: jest.fn().mockResolvedValue(mockPlanet),
            find: jest.fn().mockResolvedValue([mockPlanet]),
            findOne: jest.fn().mockResolvedValue(mockPlanet),
            preload: jest
              .fn()
              .mockResolvedValue({ ...mockPlanet, ...mockUpdatePlanetInput }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<PlanetsService>(PlanetsService);
    repository = module.get<Repository<Planet>>(getRepositoryToken(Planet));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a planet', async () => {
      const result = await service.create(mockCreatePlanetInput);

      expect(repository.create).toHaveBeenCalledWith(mockCreatePlanetInput);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPlanet);
    });

    it('should create a planet with minimal data', async () => {
      const minimalInput = { name: 'Minimal Planet' };
      const minimalPlanet = { id: '2', ...minimalInput };

      jest.spyOn(repository, 'create').mockReturnValue(minimalPlanet);
      jest.spyOn(repository, 'save').mockResolvedValue(minimalPlanet);

      const result = await service.create(minimalInput);

      expect(repository.create).toHaveBeenCalledWith(minimalInput);
      expect(result).toEqual(minimalPlanet);
    });
  });

  describe('findAll', () => {
    it('should return an array of planets', async () => {
      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockPlanet]);
    });

    it('should return empty array when no planets exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a planet when it exists', async () => {
      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockPlanet);
    });

    it('should throw NotFoundException when planet does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '999' } });
    });
  });

  describe('update', () => {
    it('should successfully update a planet', async () => {
      const updatedPlanet = { ...mockPlanet, ...mockUpdatePlanetInput };
      jest.spyOn(repository, 'save').mockResolvedValue(updatedPlanet);

      const result = await service.update('1', mockUpdatePlanetInput);

      expect(repository.preload).toHaveBeenCalledWith({
        id: '1',
        ...mockUpdatePlanetInput,
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedPlanet);
    });

    it('should throw NotFoundException when updating non-existent planet', async () => {
      jest.spyOn(repository, 'preload').mockResolvedValue(null);

      await expect(
        service.update('999', mockUpdatePlanetInput),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update partial planet data', async () => {
      const partialUpdate = { name: 'New Name' };
      const updatedPlanet = { ...mockPlanet, ...partialUpdate };

      jest.spyOn(repository, 'preload').mockResolvedValue(updatedPlanet);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedPlanet);

      const result = await service.update('1', partialUpdate);

      expect(repository.preload).toHaveBeenCalledWith({
        id: '1',
        ...partialUpdate,
      });
      expect(result.name).toBe('New Name');
      expect(result.climate).toBe(mockPlanet.climate);
    });
  });

  describe('remove', () => {
    it('should successfully remove a planet', async () => {
      const result = await service.remove('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });
  });
});
