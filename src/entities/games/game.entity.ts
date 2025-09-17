import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({type: 'int'})
  score: number;

  @Column()
  mobilePlayerNumber: number;

  @Column({ type: 'datetime'})
  dateStart: Date;

  @Column({ type: 'datetime'})
  dateEnd: Date;
}
