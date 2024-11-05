import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { StarshipsService } from './starships.service';
import { CreateStarshipInput } from './dto/create-starship.input';
import { UpdateStarshipInput } from './dto/update-starship.input';

@Controller('starships')
export class StarshipsController {
  constructor(private readonly starshipsService: StarshipsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createStarshipDto: CreateStarshipInput) {
    return this.starshipsService.create(createStarshipDto);
  }

  @Get()
  findAll() {
    return this.starshipsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.starshipsService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id') id: string,
    @Body() updateStarshipDto: UpdateStarshipInput,
  ) {
    return this.starshipsService.update(id, updateStarshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.starshipsService.remove(id);
  }

  @Post(':id/board')
  async boardPassenger(
    @Param('id') starshipId: string,
    @Body('characterId') characterId: string,
  ) {
    return this.starshipsService.boardPassenger(starshipId, characterId);
  }

  @Post(':id/disembark')
  async disembarkPassenger(
    @Param('id') starshipId: string,
    @Body('characterId') characterId: string,
  ) {
    return this.starshipsService.disembarkPassenger(starshipId, characterId);
  }

  @Post(':id/travel')
  async travel(
    @Param('id') starshipId: string,
    @Body('planetId') planetId: string,
  ) {
    return this.starshipsService.travel(starshipId, planetId);
  }

  @Get(':id/distance')
  async calculateDistance(
    @Param('id') starshipId: string,
    @Query('planetId') planetId: string,
  ) {
    return this.starshipsService.calculateDistance(starshipId, planetId);
  }

  @Get(':id/enemies')
  async findNearbyEnemies(
    @Param('id') starshipId: string,
    @Query('rangeInKm') rangeInKm: string,
  ) {
    const range = parseFloat(rangeInKm);
    if (isNaN(range)) {
      throw new Error('Invalid range provided');
    }
    return this.starshipsService.findNearbyEnemies(starshipId, range);
  }

  @Post('spawn')
  async spawnEnemies(@Body('count') count: number) {
    if (!count || isNaN(count) || count <= 0) {
      throw new Error('Invalid count provided');
    }
    return this.starshipsService.spawnEnemies(count);
  }
}
