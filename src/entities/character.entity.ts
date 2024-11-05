import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Planet } from './planet.entity';
import { Starship } from './starship.entity';

/**
 * Character entity representing a character in the database.
 */
@ObjectType()
@Entity()
export class Character {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The name of the character.
   */
  @Field()
  @Column()
  name: string;

  /**
   * The species of the character.
   */
  @Field({ nullable: true })
  @Column({ nullable: true })
  species?: string;

  /**
   * Indicates if the character is sensitive to the Force.
   */
  @Field()
  @Column()
  isForceSensitive: boolean;

  /**
   * The current location of the character.
   * Establishes a many-to-one relationship with the Planet entity.
   */
  @Field(() => Planet, { nullable: true })
  @ManyToOne(() => Planet, (planet) => planet.residents, { nullable: true })
  currentLocation?: Planet;

  /**
   * The home world location of the character.
   * Establishes a many-to-one relationship with the Planet entity.
   */
  @Field(() => Planet, { nullable: true })
  @ManyToOne(() => Planet, (planet) => planet.natives, { nullable: true })
  homeWorld?: Planet;

  /**
   * The starships where the character is a passenger.
   * Establishes a many-to-many relationship with the Starship entity.
   */
  @Field(() => [Starship], { nullable: true })
  @ManyToMany(() => Starship, (starship) => starship.passengers, {
    cascade: true,
  })
  @JoinTable()
  starships?: Starship[];
}
