import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { CategoryType } from '../entities/category.entity'

/**
 * DTO para crear una categoría
 */
export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe de ser un String' })
  @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
  name: string

  @IsNotEmpty({ message: 'El tipo de categoría no puede estar vacío' })
  @IsEnum(CategoryType, {
    message: 'El tipo de categoría debe de ser un valor válido',
  })
  categoryType: CategoryType
}
