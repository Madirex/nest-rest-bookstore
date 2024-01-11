import { Injectable } from '@nestjs/common'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { Category } from '../entities/category.entity'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { plainToClass } from 'class-transformer'
import { ResponseCategoryDto } from '../dto/response-category.dto'

/**
 * Clase que se encarga de mapear los DTO de categorías a entidades
 */
@Injectable()
export class CategoriesMapper {
  /**
   * Mapea un DTO de creación de categoría a una entidad de categoría
   * @param createCategoryDto DTO de creación de categoría
   */
  toEntity(createCategoryDto: CreateCategoryDto): Category {
    const categoryEntity = plainToClass(Category, createCategoryDto)
    categoryEntity.name = createCategoryDto.name.trim()
    return categoryEntity
  }

  /**
   * Mapea un DTO de actualización de categoría a una entidad
   * @param dto DTO de actualización de categoría
   * @param entity Entidad de categoría
   * @returns Entidad de categoría
   */
  mapUpdateToEntity(dto: UpdateCategoryDto, entity: Category): Category {
    const category = new Category()
    category.categoryType = dto.categoryType
      ? dto.categoryType
      : entity.categoryType
    category.createdAt = entity.createdAt
    category.updatedAt = new Date()
    category.name = dto.name ? dto.name.trim() : entity.name
    category.isActive = entity.isActive
    return category
  }

  /**
   * Mapea una entidad de categoría a un DTO de respuesta
   * @param entity Entidad de categoría
   */
  mapEntityToResponseDto(entity: Category): ResponseCategoryDto {
    return plainToClass(ResponseCategoryDto, entity)
  }
}
