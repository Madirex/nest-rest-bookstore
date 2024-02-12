import { PartialType } from '@nestjs/mapped-types'
import { CreateCategoryDto } from './create-category.dto'

/**
 * DTO para actualizar una categoría
 * @extends PartialType
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
