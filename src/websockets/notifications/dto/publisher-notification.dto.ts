/**
 * @description DTO de respuesta del Publisher
 */
export class PublisherNotificationResponse {
  /**
   * @description Constructor de la clase
   * @param id identificador
   * @param name nombre
   * @param image imagen
   * @param createdAt fecha de creación
   * @param updatedAt fecha de actualización
   * @param isActive indica si está activo
   */
  constructor(
    public id: string,
    public name: string,
    public image: string,
    public createdAt: string,
    public updatedAt: string,
    public isActive: boolean,
  ) {}
}
