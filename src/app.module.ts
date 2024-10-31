import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PlanetsModule } from './planets/planets.module';
import { CharactersModule } from './characters/characters.module';
import { StarshipsModule } from './starships/starships.module';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost', // or other Redis host
            port: 6379,        // or other Redis port
          },
          ttl: 300, // default Time-To-Live in seconds
        }),
      }),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    PlanetsModule, 
    CharactersModule, 
    StarshipsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
