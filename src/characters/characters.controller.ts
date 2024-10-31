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
  } from '@nestjs/common';
  import { CharactersService } from './characters.service';
  import { CreateCharacterDto } from './dto/create-character.dto';
  import { UpdateCharacterDto } from './dto/update-character.dto';
  
  @Controller('characters')
  export class CharactersController {
    constructor(private readonly charactersService: CharactersService) {}
  
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    create(@Body() createCharacterDto: CreateCharacterDto) {
      return this.charactersService.create(createCharacterDto);
    }
  
    @Get()
    findAll() {
      return this.charactersService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.charactersService.findOne(id);
    }
  
    @Put(':id')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    update(
      @Param('id') id: string,
      @Body() updateCharacterDto: UpdateCharacterDto,
    ) {
      return this.charactersService.update(id, updateCharacterDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.charactersService.remove(id);
    }
  }
  