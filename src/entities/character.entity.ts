import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Planet } from './planet.entity';

@Entity()
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  species: string;

  @Column()
  sensitivityToForce: boolean;

  @ManyToOne(() => Planet, { eager: true })
  @JoinColumn({ name: 'currentLocationId' })
  currentLocation: Planet;
}
