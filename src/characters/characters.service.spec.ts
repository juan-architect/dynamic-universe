import { Test, TestingModule } from '@nestjs/testing';
import { CharactersService } from './characters.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';
import { Repository } from 'typeorm';

const mockCharacter = {
  id: 'character-uuid',
  name: 'Luke Skywalker',
  species: 'Human',
  sensitivityToForce: true,
  currentLocation: { id: 'planet-uuid' },
};

const mockPlanet = {
  id: 'planet-uuid',
  name: 'Tatooine',
};

describe('CharactersService', () => {
  let service: CharactersService;
  let charactersRepository: Repository<Character>;
  let planetsRepository: Repository<Planet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: getRepositoryToken(Character),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Planet),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
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
    it('should create a new character', async () => {
      jest
        .spyOn(planetsRepository, 'findOne')
        .mockResolvedValue(mockPlanet as any);
      jest
        .spyOn(charactersRepository, 'create')
        .mockReturnValue(mockCharacter as any);
      jest
        .spyOn(charactersRepository, 'save')
        .mockResolvedValue(mockCharacter as any);

      const result = await service.create({
        ...mockCharacter,
        currentLocationId: 'planet-uuid',
      });
      expect(result).toEqual(mockCharacter);
      expect(planetsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'planet-uuid' },
      });
      expect(charactersRepository.create).toHaveBeenCalled();
      expect(charactersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if planet not found', async () => {
      jest.spyOn(planetsRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.create({
          ...mockCharacter,
          currentLocationId: 'non-existent-planet',
        }),
      ).rejects.toThrowError(
        `Planet with ID non-existent-planet not found`,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of characters', async () => {
      jest
        .spyOn(charactersRepository, 'find')
        .mockResolvedValue([mockCharacter] as any);

      const result = await service.findAll();
      expect(result).toEqual([mockCharacter]);
      expect(charactersRepository.find).toHaveBeenCalledWith({
        relations: ['currentLocation'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a character by ID', async () => {
      jest
        .spyOn(charactersRepository, 'findOne')
        .mockResolvedValue(mockCharacter as any);

      const result = await service.findOne('character-uuid');
      expect(result).toEqual(mockCharacter);
      expect(charactersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'character-uuid' },
        relations: ['currentLocation'],
      });
    });

    it('should throw NotFoundException if character not found', async () => {
      jest.spyOn(charactersRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne('non-existent-id')).rejects.toThrowError(
        `Character with ID non-existent-id not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a character', async () => {
      const updatedCharacter = { ...mockCharacter, name: 'Updated Name' };
      jest
        .spyOn(charactersRepository, 'findOne')
        .mockResolvedValue(mockCharacter as any);
      jest
        .spyOn(charactersRepository, 'save')
        .mockResolvedValue(updatedCharacter as any);

      const result = await service.update('character-uuid', {
        name: 'Updated Name',
      });
      expect(result).toEqual(updatedCharacter);
      expect(charactersRepository.save).toHaveBeenCalledWith({
        ...mockCharacter,
        name: 'Updated Name',
      });
    });

    it('should throw NotFoundException if character not found', async () => {
      jest.spyOn(charactersRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.update('non-existent-id', { name: 'Updated Name' }),
      ).rejects.toThrowError(`Character with ID non-existent-id not found`);
    });
  });

  describe('remove', () => {
    it('should remove a character', async () => {
      jest
        .spyOn(charactersRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove('character-uuid')).resolves.toBeUndefined();
      expect(charactersRepository.delete).toHaveBeenCalledWith('character-uuid');
    });

    it('should throw NotFoundException if character not found', async () => {
      jest
        .spyOn(charactersRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove('non-existent-id')).rejects.toThrowError(
        `Character with ID non-existent-id not found`,
      );
    });
  });

  describe('relocate', () => {
    it('should relocate a character to another planet', async () => {
      jest
        .spyOn(charactersRepository, 'findOne')
        .mockResolvedValue(mockCharacter as any);
      jest
        .spyOn(planetsRepository, 'findOne')
        .mockResolvedValue(mockPlanet as any);
      jest
        .spyOn(charactersRepository, 'save')
        .mockResolvedValue(mockCharacter as any);

      const result = await service.relocate('character-uuid', 'planet-uuid');
      expect(result).toEqual(mockCharacter);
      expect(planetsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'planet-uuid' },
      });
      expect(charactersRepository.save).toHaveBeenCalledWith(mockCharacter);
    });

    it('should throw NotFoundException if character not found', async () => {
      jest.spyOn(charactersRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.relocate('non-existent-id', 'planet-uuid'),
      ).rejects.toThrowError(`Character with ID non-existent-id not found`);
    });

    it('should throw NotFoundException if planet not found', async () => {
      jest
        .spyOn(charactersRepository, 'findOne')
        .mockResolvedValue(mockCharacter as any);
      jest.spyOn(planetsRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.relocate('character-uuid', 'non-existent-planet'),
      ).rejects.toThrowError(
        `Planet with ID non-existent-planet not found`,
      );
    });
  });
});
