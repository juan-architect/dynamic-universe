import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { Character } from '../entities/character.entity';
import { Planet } from '../entities/planet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Character, Planet])],
  providers: [CharactersService],
  controllers: [CharactersController],
})
export class CharactersModule {}
