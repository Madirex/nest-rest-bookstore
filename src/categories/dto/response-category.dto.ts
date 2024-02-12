import { CategoryType } from '../entities/category.entity'
import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO para recibir una categoría
 */
export class ResponseCategoryDto {
  @ApiProperty({
    example: 1,
    description: 'El id de la categoría',
  })
  id: number

  @ApiProperty({
    example: 'Fiction',
    description: 'El tipo de categoría',
    enum: CategoryType,
  })
  categoryType: CategoryType

  @ApiProperty({
    example: 'Ciencia Ficción',
    description: 'El nombre de la categoría',
    maxLength: 255,
  })
  name: string

  @ApiProperty({
    example: '2021-01-01T00:00:00Z',
    description: 'La fecha de creación de la categoría',
    type: Date,
  })
  createdAt: Date

  @ApiProperty({
    example: '2021-01-01T00:00:00Z',
    description: 'La fecha de actualización de la categoría',
    type: Date,
  })
  updatedAt: Date

  @ApiProperty({
    example: true,
    description: 'Si la categoría está activa',
  })
  isActive: boolean
}
