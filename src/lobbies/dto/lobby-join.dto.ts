import { IsObject, IsString } from 'class-validator';
import { AvatarDto } from 'src/events/players/dto/avatar.dto';

export class LobbyJoinDto {
  @IsString()
  token: string;

  @IsString()
  username: string;

  avatar: AvatarDto;
}
