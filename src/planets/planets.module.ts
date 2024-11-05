import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanetsService } from './planets.service';
import { Planet } from '../entities/planet.entity';
import { PlanetsResolver } from './planets.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Planet])],
  providers: [PlanetsService, PlanetsResolver],
  controllers: [], // We dont need controllers since we are using GraphQL
})
export class PlanetsModule {}
