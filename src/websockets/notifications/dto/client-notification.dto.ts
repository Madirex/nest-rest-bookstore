/**
 * @description DTO para notificaciones de clientes
 */
export class ClientNotificationDto {
  /**
   * @description Constructor de la clase
   * @param id Identificador del cliente
   * @param name Nombre del cliente
   * @param surname Apellidos del cliente
   * @param email Correo electrónico del cliente
   * @param phone Teléfono del cliente
   * @param address Dirección del cliente
   * @param createdAt Fecha de creación
   * @param updatedAt Fecha de última actualización
   */
  constructor(
    public id: string,
    public name: string,
    public surname: string,
    public email: string,
    public phone: string,
    public address: string,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
