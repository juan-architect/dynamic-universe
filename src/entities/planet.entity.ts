import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Planet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('bigint')
  population: number;

  @Column()
  climate: string;

  @Column()
  terrain: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;
}
