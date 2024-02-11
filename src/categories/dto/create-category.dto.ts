import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { CategoryType } from '../entities/category.entity'
import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO para crear una categoría
 */
export class CreateCategoryDto {
  @ApiProperty({
    example: 'Ciencia Ficción',
    description: 'El nombre de la categoría',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe de ser un String' })
  @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
  name: string

  @ApiProperty({
    example: 'Fiction',
    description: 'El tipo de categoría',
    enum: CategoryType,
  })
  @IsNotEmpty({ message: 'El tipo de categoría no puede estar vacío' })
  @IsEnum(CategoryType, {
    message: 'El tipo de categoría debe de ser un valor válido',
  })
  categoryType: CategoryType
}
