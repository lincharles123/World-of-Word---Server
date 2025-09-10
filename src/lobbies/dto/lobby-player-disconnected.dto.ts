import { IsString } from 'class-validator';

export class LobbyPlayerDisconnectedDto {
  @IsString()
  username: string;

  constructor(username: string) {
    this.username = username;
  }
}