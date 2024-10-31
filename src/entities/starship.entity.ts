import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Character } from './character.entity';

@Entity()
export class Starship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  model: string;

  @Column('bigint')
  cargoCapacity: number;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @ManyToMany(() => Character, { eager: true })
  @JoinTable()
  passengers: Character[];

  @ManyToMany(() => Starship, { eager: true })
  @JoinTable()
  enemies: Starship[];
}
