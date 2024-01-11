import { PartialType } from '@nestjs/mapped-types'
import { CreateBookDto } from './create-book.dto'

/**
 * DTO de actualización de libro
 */
export class UpdateBookDto extends PartialType(CreateBookDto) {}
