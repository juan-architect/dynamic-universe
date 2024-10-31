import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanetsModule } from './planets/planets.module';
import { CharactersModule } from './characters/characters.module';
import { StarshipsModule } from './starships/starships.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(), 
    PlanetsModule, 
    CharactersModule, 
    StarshipsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
