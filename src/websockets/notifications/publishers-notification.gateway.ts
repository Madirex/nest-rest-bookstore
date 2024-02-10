import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import * as process from 'process'
import { WsNotification } from './notification.model'
import { ResponsePublisherDto } from '../../publishers/dto/response-publisher.dto'

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/Publishers`

/**
 * Gateway de notificaciones de Publishers
 */
@WebSocketGateway({
  namespace: ENDPOINT,
})
export class PublishersNotificationsGateway {
  @WebSocketServer()
  private server: Server

  private readonly logger = new Logger(PublishersNotificationsGateway.name)

  /**
   * Constructor
   */
  constructor() {
    this.logger.log(
      `PublishersNotificationsGateway is listening on ${ENDPOINT}`,
    )
  }

  /**
   * @description Envía una notificación a los publishers conectados
   * @param notification Notificación a enviar
   */
  sendMessage(notification: WsNotification<ResponsePublisherDto>) {
    this.server.emit('publisher-updates', notification)
  }

  /**
   * @description Maneja la conexión de un publisher
   * @param publisher publisher conectado
   * @private Método privado
   */
  private handleConnection(publisher: Socket) {
    this.logger.debug('publisher conectado:', publisher.id)
    this.server.emit(
      'connection',
      'Publishers Notifications WS: Conexión establecida',
    )
  }

  /**
   * @description Maneja la desconexión de un publisher
   * @param publisher publisher desconectado
   * @private Método privado
   */
  private handleDisconnect(publisher: Socket) {
    this.logger.debug('publisher desconectado:', publisher.id)
  }
}
