/**
 * @description DTO de respuesta del Book
 */
export class BookNotificationResponse {
  /**
   * @description Constructor de la clase
   * @param id identificador
   * @param name nombre
   * @param author autor
   * @param publisher editorial
   * @param category categoría
   * @param image imagen
   * @param description descripción
   * @param price precio
   * @param stock stock
   * @param createdAt fecha de creación
   * @param updatedAt fecha de actualización
   * @param isActive indica si está activo
   */
  constructor(
    public id: string,
    public name: string,
    public author: string,
    public publisher: string,
    public category: string,
    public image: string,
    public description: string,
    public price: number,
    public stock: number,
    public createdAt: string,
    public updatedAt: string,
    public isActive: boolean,
  ) {}
}
