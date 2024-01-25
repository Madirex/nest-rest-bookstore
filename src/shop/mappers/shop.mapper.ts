import { Injectable } from '@nestjs/common'
import { Shop } from '../entities/shop.entity'
import { CreateShopDto } from '../dto/create-shop.dto'
import { UpdateShopDto } from '../dto/update-shop.dto'
import { GetShopDto } from '../dto/response-shop.dto'
import { plainToClass } from 'class-transformer'
import { Book } from '../../books/entities/book.entity'
import { Client } from '../../client/entities/client.entity'

@Injectable()
export class ShopMapper {
  toEntity(createShopDto: CreateShopDto): Shop {
    const shopEntity = plainToClass(Shop, createShopDto)
    shopEntity.createdAt = new Date()
    shopEntity.updatedAt = new Date()
    return shopEntity
  }

  updateToEntity(updateShopDto: UpdateShopDto, entity: Shop): Shop {
    if (updateShopDto.name) {
      entity.name = updateShopDto.name
    }
    if (updateShopDto.address) {
      entity.address = updateShopDto.address
    }
    entity.updatedAt = new Date()
    return entity
  }

  toDto(entity: Shop): GetShopDto {
    const dto = plainToClass(GetShopDto, entity)
    return dto
  }

  mapShopListToDtoList(shops: Shop[]): GetShopDto[] {
    return shops.map((shop) => this.toDto(shop))
  }

}
