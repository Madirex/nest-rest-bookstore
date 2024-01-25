import { PartialType } from '@nestjs/mapped-types'
import { CreateShopDto } from './create-shop.dto'

/**
 * DTO de actualización de shop
 */
export class UpdateShopDto extends PartialType(CreateShopDto) {}
