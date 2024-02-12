import { CategoryType } from '../../../categories/entities/category.entity'

/**
 * @description DTO de respuesta de la categoría
 */
export class CategoryNotificationResponse {
  /**
   * @description Constructor de la clase
   * @param id identificador
   * @param categoryType tipo de categoría
   * @param name nombre
   * @param createdAt fecha de creación
   * @param updatedAt fecha de actualización
   * @param isActive indica si está activo
   */
  constructor(
    public id: number,
    public categoryType: CategoryType,
    public name: string,
    public createdAt: string,
    public updatedAt: string,
    public isActive: boolean,
  ) {}
}
