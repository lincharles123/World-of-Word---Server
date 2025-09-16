import { Injectable } from '@nestjs/common';
import { effectMap } from './effect-map';
import { EventGlobalNotifyDto } from './dto/event-global-notify.dto';
import { PathEnum } from './enum/path.enum';
import { PlayersService } from './players/players.service';
import { OverlayService } from './overlay/overlay.service';
import { MusicsService } from './musics/musics.service';
import { EventPlayerNotifyDto } from './players/dto/event-player-notify.dto';
import { EventOverlayNotifyDto } from './overlay/dto/event-overlay-notify.dto';
import { EventMusicNotifyDto } from './musics/dto/event-music-notify.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly overlayService: OverlayService,
    private readonly musicsService: MusicsService,
  ) {}
  getPayload(word: string, username: string): Map<string, EventGlobalNotifyDto> {
    const wordLower = word.toLowerCase();
    console.log('Getting payload for word:', wordLower);
    if(!effectMap[wordLower] || effectMap[wordLower].type === 'event:platform') {
      console.log('No effect found for word:', wordLower);
      return new Map([['unknown', null]]);
    }

    const rooting = effectMap[wordLower].type;
    console.log('Rooting:', rooting);
    switch (rooting) {
      case PathEnum.PLAYER:
        const dto = new EventGlobalNotifyDto();
        dto.word = wordLower;
        dto.effect = this.playersService.getPlayerEffect(wordLower);
        const payloadPlayer: EventPlayerNotifyDto = {
          username: username,
          word: dto.word,
          effect: dto.effect,
        }
        return new Map([[rooting, payloadPlayer]]);
      case PathEnum.MUSIC:
        const musicDto = new EventGlobalNotifyDto();
        musicDto.word = wordLower;
        musicDto.effect = this.musicsService.getMusicEffect(wordLower);
        const payloadMusic: EventMusicNotifyDto = {
          username: username,
          word: musicDto.word,
          effect: musicDto.effect,
        }
        return new Map([[rooting, payloadMusic]]);
      case PathEnum.OVERLAY:
        const overlayDto = new EventGlobalNotifyDto();
        overlayDto.word = wordLower;
        overlayDto.effect = this.overlayService.getOverlayEffect(wordLower);
        const payloadOverlay: EventOverlayNotifyDto = {
          username: username,
          word: overlayDto.word,
          effect: overlayDto.effect,
        }
        return new Map([[rooting, payloadOverlay]]);
      default:
        throw new Error('Invalid rooting type');
    }
  }
}