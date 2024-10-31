import { Test, TestingModule } from '@nestjs/testing';
import { PlanetsService } from './planets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Planet } from '../entities/planet.entity';
import { Repository } from 'typeorm';

const mockPlanet = {
  id: 'planet-uuid',
  name: 'Tatooine',
  population: 200000,
  climate: 'Arid',
  terrain: 'Desert',
  latitude: 34.0522,
  longitude: -118.2437,
};

describe('PlanetsService', () => {
  let service: PlanetsService;
  let repository: Repository<Planet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanetsService,
        {
          provide: getRepositoryToken(Planet),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PlanetsService>(PlanetsService);
    repository = module.get<Repository<Planet>>(getRepositoryToken(Planet));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new planet', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockPlanet as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockPlanet as any);

      const result = await service.create(mockPlanet);
      expect(result).toEqual(mockPlanet);
      expect(repository.create).toHaveBeenCalledWith(mockPlanet);
      expect(repository.save).toHaveBeenCalledWith(mockPlanet);
    });
  });

  describe('findAll', () => {
    it('should return an array of planets', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockPlanet]);

      const result = await service.findAll();
      expect(result).toEqual([mockPlanet]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a planet by ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPlanet as any);

      const result = await service.findOne('planet-uuid');
      expect(result).toEqual(mockPlanet);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'planet-uuid' },
      });
    });

    it('should throw NotFoundException if planet not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne('non-existent-id')).rejects.toThrowError(
        `Planet with ID non-existent-id not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a planet', async () => {
      const updatedPlanet = { ...mockPlanet, name: 'Updated Name' };
      jest.spyOn(repository, 'preload').mockResolvedValue(updatedPlanet as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedPlanet as any);

      const result = await service.update('planet-uuid', {
        name: 'Updated Name',
      });
      expect(result).toEqual(updatedPlanet);
      expect(repository.save).toHaveBeenCalledWith(updatedPlanet);
    });

    it('should throw NotFoundException if planet not found', async () => {
      jest.spyOn(repository, 'preload').mockResolvedValue(undefined);

      await expect(
        service.update('non-existent-id', { name: 'Updated Name' }),
      ).rejects.toThrowError(`Planet with ID non-existent-id not found`);
    });
  });

  describe('remove', () => {
    it('should remove a planet', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove('planet-uuid')).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith('planet-uuid');
    });

    it('should throw NotFoundException if planet not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove('non-existent-id')).rejects.toThrowError(
        `Planet with ID non-existent-id not found`,
      );
    });
  });
});
