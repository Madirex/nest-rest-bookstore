/**
 * Modelo de notificaciones
 * @description Modelo de notificaciones
 */
export class WsNotification<T> {
  /**
   * @description Constructor de la clase
   * @param entity entidad
   * @param type tipo
   * @param data datos
   * @param createdAt fecha de creación
   */
  constructor(
    public entity: string,
    public type: NotificationType,
    public data: T,
    public createdAt: Date,
  ) {}
}

/**
 * Enumeración tipos de notificaciones
 * @description Enumeración de los tipos de notificaciones
 */
export enum NotificationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
