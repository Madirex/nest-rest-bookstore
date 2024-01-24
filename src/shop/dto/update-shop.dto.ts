import { PartialType } from '@nestjs/mapped-types'
import { CreateShopDto } from './create-shop.dto'

/**
 * DTO de actualización de libro
 */
export class UpdateBookDto extends PartialType(CreateShopDto) {}
