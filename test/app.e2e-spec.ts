import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Dynamic Universe API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PlanetsController (e2e)', () => {
    let createdPlanetId: string;

    const createPlanetDto = {
      name: 'Tatooine',
      climate: 'Arid',
      terrain: 'Desert',
      population: 200000,
      currentLocation: {
        latitude: 23.4,
        longitude: 45.6,
      },
    };

    it('should create a planet', () => {
      return request(app.getHttpServer())
        .post('/planets')
        .send(createPlanetDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createPlanetDto.name);
          createdPlanetId = res.body.id;
        });
    });

    it('should get all planets', () => {
      return request(app.getHttpServer())
        .get('/planets')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get a planet by id', () => {
      return request(app.getHttpServer())
        .get(`/planets/${createdPlanetId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPlanetId);
        });
    });

    it('should update a planet', () => {
      const updatePlanetDto = {
        name: 'Tatooine Updated',
        population: 210000,
      };

      return request(app.getHttpServer())
        .put(`/planets/${createdPlanetId}`)
        .send(updatePlanetDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updatePlanetDto.name);
        });
    });

    it('should delete a planet', () => {
      return request(app.getHttpServer())
        .delete(`/planets/${createdPlanetId}`)
        .expect(200);
    });
  });

  describe('CharactersController (e2e)', () => {
    let createdCharacterId: string;
    let planetId: string;

    const createCharacterDto = {
      name: 'Luke Skywalker',
      species: 'Human',
      isForceSensitive: true,
    };

    // Create a planet first to use in character tests
    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/planets')
        .send({
          name: 'Tatooine',
          climate: 'Arid',
        });
      planetId = response.body.id;
    });

    it('should create a character', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send(createCharacterDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createCharacterDto.name);
          createdCharacterId = res.body.id;
        });
    });

    it('should get all characters', () => {
      return request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get a character by id', () => {
      return request(app.getHttpServer())
        .get(`/characters/${createdCharacterId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdCharacterId);
        });
    });

    it('should relocate a character', () => {
      return request(app.getHttpServer())
        .post(`/characters/${createdCharacterId}/relocate`)
        .send({ planetId })
        .expect(200)
        .expect((res) => {
          expect(res.body.currentLocation.id).toBe(planetId);
        });
    });
  });

  describe('StarshipsController (e2e)', () => {
    let createdStarshipId: string;
    let characterId: string;
    let planetId: string;

    const createStarshipDto = {
      name: 'Millennium Falcon',
      model: 'YT-1300',
      cargoCapacity: 100,
    };

    // Create necessary test data
    beforeAll(async () => {
      const planetResponse = await request(app.getHttpServer())
        .post('/planets')
        .send({
          name: 'Coruscant',
          climate: 'Temperate',
        });
      planetId = planetResponse.body.id;

      const characterResponse = await request(app.getHttpServer())
        .post('/characters')
        .send({
          name: 'Han Solo',
          species: 'Human',
          isForceSensitive: false,
        });
      characterId = characterResponse.body.id;
    });

    it('should create a starship', () => {
      return request(app.getHttpServer())
        .post('/starships')
        .send(createStarshipDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createStarshipDto.name);
          createdStarshipId = res.body.id;
        });
    });

    it('should board a passenger', () => {
      return request(app.getHttpServer())
        .post(`/starships/${createdStarshipId}/board`)
        .send({ characterId })
        .expect(200)
        .expect((res) => {
          expect(res.body.passengers).toContainEqual(
            expect.objectContaining({ id: characterId })
          );
        });
    });

    it('should disembark a passenger', () => {
      return request(app.getHttpServer())
        .post(`/starships/${createdStarshipId}/disembark`)
        .send({ characterId })
        .expect(200)
        .expect((res) => {
          expect(res.body.passengers).not.toContainEqual(
            expect.objectContaining({ id: characterId })
          );
        });
    });

    it('should travel to a planet', () => {
      return request(app.getHttpServer())
        .post(`/starships/${createdStarshipId}/travel`)
        .send({ planetId })
        .expect(200)
        .expect((res) => {
          expect(res.body.currentStation.id).toBe(planetId);
        });
    });

    it('should calculate distance to a planet', () => {
      return request(app.getHttpServer())
        .get(`/starships/${createdStarshipId}/distance?planetId=${planetId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('distanceInKm');
          expect(typeof res.body.distanceInKm).toBe('number');
        });
    });

    it('should find nearby enemies', () => {
      return request(app.getHttpServer())
        .get(`/starships/${createdStarshipId}/enemies?rangeInKm=1000`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should spawn enemy starships', () => {
      return request(app.getHttpServer())
        .post('/starships/spawn')
        .send({ count: 2 })
        .expect(201)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
        });
    });
  });
});