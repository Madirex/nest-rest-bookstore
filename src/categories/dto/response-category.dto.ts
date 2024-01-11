import { CategoryType } from '../entities/category.entity'

/**
 * DTO para recibir una categoría
 */
export class ResponseCategoryDto {
  id: number
  categoryType: CategoryType
  name: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}
