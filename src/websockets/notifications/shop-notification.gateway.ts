import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import * as process from 'process'
import { ResponseShopDto } from '../../shop/dto/response-shop.dto'
import { WsNotification } from './notification.model'

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/shops`

/**
 * Gateway de notificaciones de Shops
 */
@WebSocketGateway({
  namespace: ENDPOINT,
})
export class ShopsNotificationsGateway {
  @WebSocketServer()
  private server: Server

  private readonly logger = new Logger(ShopsNotificationsGateway.name)

  /**
   * Constructor
   */
  constructor() {
    this.logger.log(`ShopsNotificationsGateway is listening on ${ENDPOINT}`)
  }

  /**
   * @description Envía una notificación a los clientes conectados
   * @param notification Notificación a enviar
   */
  sendMessage(notification: WsNotification<ResponseShopDto>) {
    this.server.emit('shop-updates', notification)
  }

  /**
   * @description Maneja la conexión de un cliente
   * @param client Cliente conectado
   * @private Método privado
   */
  private handleConnection(client: Socket) {
    this.logger.debug('Cliente conectado:', client.id)
    this.server.emit(
      'connection',
      'Shops Notifications WS: Conexión establecida',
    )
  }

  /**
   * @description Maneja la desconexión de un cliente
   * @param client Cliente desconectado
   * @private Método privado
   */
  private handleDisconnect(client: Socket) {
    this.logger.debug('Cliente desconectado:', client.id)
  }
}
