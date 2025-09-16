import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'games' })
export class Game extends Model<Game> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ allowNull: false })
  roomId: string;

  @Column({ allowNull: false })
  username: string;

  @Column({ allowNull: false, type: DataType.INTEGER })
  score: number;

  @Column({ allowNull: false, type: DataType.DATE })
  startDate: Date;

  @Column({ allowNull: false, type: DataType.DATE })
  endDate: Date;
}