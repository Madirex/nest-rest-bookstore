/**
 * @description DTO de respuesta para notificaciones de Shop
 */
export class ShopNotificationResponse {
  /**
   * @description Constructor de la clase
   * @param id Identificador de la tienda
   * @param name Nombre de la tienda
   * @param address Dirección de la tienda
   * @param booksId Identificadores de los libros asociados a la tienda
   * @param clientsId Identificadores de los clientes asociados a la tienda
   * @param createdAt Fecha de creación de la tienda
   * @param updatedAt Fecha de última actualización de la tienda
   */
  constructor(
    public id: string,
    public name: string,
    public address: string,
    public booksId: number[],
    public clientsId: string[],
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
