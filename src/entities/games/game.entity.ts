import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  score: number;

  @Column()
  mobilePlayerNumber: number;

  @Column()
  time: number;
}
