import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StarshipsService } from './starships.service';
import { StarshipsController } from './starships.controller';
import { Starship } from '../entities/starship.entity';
import { Character } from '../entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Starship, Character])],
  providers: [StarshipsService],
  controllers: [StarshipsController],
})
export class StarshipsModule {}