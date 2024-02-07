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
   * @description Envía una notificación a los tiendas conectados
   * @param notification Notificación a enviar
   */
  sendMessage(notification: WsNotification<ResponseShopDto>) {
    this.server.emit('shop-updates', notification)
  }

  /**
   * @description Maneja la conexión de un tienda
   * @param shop tienda conectado
   * @private Método privado
   */
  private handleConnection(shop: Socket) {
    this.logger.debug('tienda conectado:', shop.id)
    this.server.emit(
      'connection',
      'Shops Notifications WS: Conexión establecida',
    )
  }

  /**
   * @description Maneja la desconexión de un tienda
   * @param shop tienda desconectado
   * @private Método privado
   */
  private handleDisconnect(shop: Socket) {
    this.logger.debug('shop desconectado:', shop.id)
  }
}
