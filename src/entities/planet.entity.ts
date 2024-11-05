import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Character } from './character.entity';
import { Starship } from './starship.entity';
import { Coordinates } from './types/coordinates.type';

/**
 * Planet entity representing a planet in the database.
 */
@ObjectType()
@Entity()
export class Planet {
  /**
   * The unique identifier of the planet.
   */
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The name of the planet.
   */
  @Field()
  @Column()
  name: string;

  /**
   * The climate of the planet.
   */
  @Field({ nullable: true })
  @Column({ nullable: true })
  climate?: string;

  /**
   * The terrain of the planet.
   */
  @Field({ nullable: true })
  @Column({ nullable: true })
  terrain?: string;

  /**
   * The population of the planet.
   */
  @Field({ nullable: true })
  @Column('bigint', { nullable: true })
  population?: number;

  /**
   * The current location coordinates of the planet.
   * Stored as a JSON object with latitude and longitude.
   */
  @Field(() => Coordinates, { nullable: true })
  @Column('json', { nullable: true })
  currentLocation?: Coordinates;

  /**
   * The characters currently located on the planet.
   * Establishes a one-to-many relationship with the Character entity.
   */
  @Field(() => [Character], { nullable: true })
  @OneToMany(() => Character, (character) => character.currentLocation)
  residents?: Character[];

  /**
   * The characters whose homeWorld is this planet.
   * Establishes a one-to-many relationship with the Character entity.
   */
  @Field(() => [Character], { nullable: true })
  @OneToMany(() => Character, (character) => character.homeWorld)
  natives?: Character[];

  /**
   * The starships that are currently stationed on the planet.
   * Establishes a one-to-many relationship with the Starship entity.
   */
  @Field(() => [Starship], { nullable: true })
  @OneToMany(() => Starship, (starship) => starship.currentStation)
  stationedStarships?: Starship[];
}
