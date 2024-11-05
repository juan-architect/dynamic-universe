import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Character } from './character.entity';
import { Planet } from './planet.entity';
import { Coordinates } from './types/coordinates.type';

/**
 * Starship entity representing a starship in the database.
 */
@ObjectType()
@Entity()
export class Starship {
  /**
   * The unique identifier of the starship.
   */
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The name of the starship.
   */
  @Field()
  @Column()
  name: string;

  /**
   * The model of the starship.
   */
  @Field({ nullable: true })
  @Column({ nullable: true })
  model?: string;

  /**
   * The cargo capacity of the starship.
   */
  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  cargoCapacity?: number;

  /**
   * The current location coordinates of the starship.
   * Stored as a JSON object with latitude and longitude.
   */
  @Field(() => Coordinates, { nullable: true })
  @Column('json', { nullable: true })
  currentLocation?: Coordinates;

  /**
   * The current station of the starship.
   * Establishes a many-to-one relationship with the Planet entity.
   */
  @Field(() => Planet, { nullable: true })
  @ManyToOne(() => Planet, (planet) => planet.stationedStarships, {
    nullable: true,
  })
  currentStation?: Planet;

  /**
   * The passengers aboard the starship.
   * Establishes a many-to-many relationship with the Character entity.
   */
  @Field(() => [Character], { nullable: true })
  @ManyToMany(() => Character, (character) => character.starships, {
    cascade: true,
  })
  @JoinTable()
  passengers?: Character[];

  /**
   * The enemies of the starship.
   * Establishes a many-to-many self-referential relationship with other Starships.
   */
  @Field(() => [Starship], { nullable: true })
  @ManyToMany(() => Starship, (starship) => starship.enemyOf, { cascade: true })
  @JoinTable()
  enemies?: Starship[];

  /**
   * Inverse side of the enemies' relationship.
   */
  @ManyToMany(() => Starship, (starship) => starship.enemies)
  enemyOf?: Starship[];
}
