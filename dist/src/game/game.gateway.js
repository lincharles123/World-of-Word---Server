"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GameGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const game_service_1 = require("./game.service");
let GameGateway = GameGateway_1 = class GameGateway {
    gameService;
    logger = new common_1.Logger(GameGateway_1.name);
    io;
    constructor(gameService) {
        this.gameService = gameService;
    }
    ;
    handleConnection(client, ...args) {
        this.gameService.addClient(client);
        this.logger.log(`Client id: ${client.id} connected`);
        console.log('connected');
    }
    handleDisconnect(client) {
        this.gameService.removeClient(client);
        this.logger.log(`Client id:${client.id} disconnected`);
    }
    handleAction(client, data) {
        this.logger.log(`Instruction received from client id: ${client.id}`);
        this.logger.debug(`Payload: ${data}`);
        return {
            event: "",
            data: "",
        };
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "io", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("instruction"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleAction", null);
exports.GameGateway = GameGateway = GameGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map