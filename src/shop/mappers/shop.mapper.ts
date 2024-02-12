import { Injectable } from '@nestjs/common'
import { Shop } from '../entities/shop.entity'
import { CreateShopDto } from '../dto/create-shop.dto'
import { plainToClass } from 'class-transformer'
import { UpdateShopDto } from '../dto/update-shop.dto'
import { ResponseShopDto } from '../dto/response-shop.dto'
import { Book } from '../../books/entities/book.entity'
import { Client } from '../../client/entities/client.entity'

/**
 * Mapper de Shops
 */
@Injectable()
export class ShopMapper {
  /**
   * Mapea un DTO de creación de Shop a una entidad de Shop
   * @param createShopDto DTO de creación de Shop
   * @param books Lista de entidades Book relacionadas
   * @param clients Lista de entidades Client relacionadas
   * @returns Entidad Shop
   */
  toEntity(
    createShopDto: CreateShopDto,
    books: Book[],
    clients: Client[],
  ): Shop {
    const shopEntity = plainToClass(Shop, createShopDto)
    shopEntity.createdAt = new Date()
    shopEntity.updatedAt = new Date()
    shopEntity.name = createShopDto.name.trim()
    shopEntity.address = createShopDto.address
    shopEntity.books = books
    shopEntity.clients = clients
    return shopEntity
  }

  /**
   * Mapea un DTO de actualización de Shop a una entidad de Shop
   * @param dto DTO de actualización de Shop
   * @param entity Entidad de Shop existente
   * @param books Libros relacionados
   * @param clients Clientes relacionados
   * @returns Entidad Shop actualizada
   */
  mapUpdateToEntity(
    dto: UpdateShopDto,
    entity: Shop,
    books: Book[],
    clients: Client[],
  ): Shop {
    const shop = new Shop()
    shop.id = entity.id
    shop.createdAt = entity.createdAt
    shop.updatedAt = new Date()
    shop.name = dto.name ? dto.name.trim() : entity.name
    shop.address = dto.address ? dto.address : entity.address
    shop.books = books || entity.books
    shop.clients = clients || entity.clients
    return shop
  }

  /**
   * Mapea una entidad de Shop a un DTO de respuesta
   * @param entity Entidad de Shop
   * @returns DTO de respuesta para Shop
   */
  mapEntityToResponseDto(entity: Shop): ResponseShopDto {
    const responseShopDto = plainToClass(ResponseShopDto, entity)
    if (entity.books) {
      responseShopDto.booksId = entity.books.map((book) => book.id)
    }
    if (entity.clients) {
      responseShopDto.clientsId = entity.clients.map((client) => client.id)
    }
    responseShopDto.address = entity.address
    return responseShopDto
  }
}
