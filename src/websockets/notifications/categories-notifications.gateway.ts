import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import * as process from 'process'
import { ResponseCategoryDto } from '../../categories/dto/response-category.dto'
import { WsNotification } from './notification.model'

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/categories`

/**
 * Gateway de notificaciones de Categories
 */
@WebSocketGateway({
  namespace: ENDPOINT,
})
export class CategoriesNotificationsGateway {
  @WebSocketServer()
  private server: Server

  private readonly logger = new Logger(CategoriesNotificationsGateway.name)

  /**
   * Constructor
   */
  constructor() {
    this.logger.log(
      `CategoriesNotificationsGateway is listening on ${ENDPOINT}`,
    )
  }

  /**
   * @description Maneja la conexión de un cliente
   * @param notification Notificación a enviar
   */
  sendMessage(notification: WsNotification<ResponseCategoryDto>) {
    this.server.emit('updates', notification)
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
      'Updates Notifications WS: Conexión establecida',
    )
  }

  /**
   * @description Maneja la desconexión de un cliente
   * @param client Cliente desconectado
   * @private Método privado
   */
  private handleDisconnect(client: Socket) {
    console.log('Cliente desconectado:', client.id)
    this.logger.debug('Cliente desconectado:', client.id)
  }
}
