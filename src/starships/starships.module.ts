import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StarshipsService } from './starships.service';
import { StarshipsController } from './starships.controller';
import { Starship } from '../entities/starship.entity';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';
import { StarshipsResolver } from './starships.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Starship, Character, Planet])],
  providers: [StarshipsService, StarshipsResolver],
  controllers: [StarshipsController],
})
export class StarshipsModule {}
