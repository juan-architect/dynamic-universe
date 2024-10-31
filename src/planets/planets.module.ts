import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanetsService } from './planets.service';
import { PlanetsController } from './planets.controller';
import { Planet } from '../entities/planet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Planet])],
  providers: [PlanetsService],
  controllers: [PlanetsController],
})
export class PlanetsModule {}
