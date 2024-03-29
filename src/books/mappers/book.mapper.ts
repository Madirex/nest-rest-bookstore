import { Injectable } from '@nestjs/common'
import { Book } from '../entities/book.entity'
import { CreateBookDto } from '../dto/create-book.dto'
import { plainToClass } from 'class-transformer'
import { UpdateBookDto } from '../dto/update-book.dto'
import { ResponseBookDto } from '../dto/response-book.dto'
import { Category } from '../../categories/entities/category.entity'
import { Util } from '../../util/util'
import { Publisher } from '../../publishers/entities/publisher.entity'

/**
 * Mapper de Books
 */
@Injectable()
export class BookMapper {
  /**
   * Mapea un DTO de creación de Book a una entidad de Book
   * @param createBookDto DTO de creación de Book
   * @param category Entidad de categoría
   * @param publisher Entidad de editorial
   */
  toEntity(
    createBookDto: CreateBookDto,
    category: Category,
    publisher: Publisher,
  ): Book {
    const bookEntity = plainToClass(Book, createBookDto)
    bookEntity.createdAt = new Date()
    bookEntity.updatedAt = new Date()
    bookEntity.name = createBookDto.name.trim()
    bookEntity.image = createBookDto.image
      ? createBookDto.image.trim()
      : Book.IMAGE_DEFAULT
    bookEntity.category = category
    bookEntity.publisher = publisher
    bookEntity.isActive = true
    return bookEntity
  }

  /**
   * Mapea un DTO de actualización de Book a una entidad de Book
   * @param dto DTO de actualización de Book
   * @param entity Entidad de Book
   * @param category Entidad de categoría
   * @param publisher Entidad de editorial
   */
  mapUpdateToEntity(
    dto: UpdateBookDto,
    entity: Book,
    category: Category,
    publisher: Publisher,
  ): Book {
    const book = new Book()
    book.id = entity.id
    book.createdAt = entity.createdAt
    book.updatedAt = new Date()
    book.name = dto.name ? dto.name.trim() : entity.name
    book.price = dto.price || entity.price
    book.stock = dto.stock || entity.stock
    book.image = dto.image ? dto.image.trim() : entity.image
    book.category = category || entity.category
    book.publisher = publisher || entity.publisher
    book.isActive = entity.isActive
    return book
  }

  /**
   * Mapea una entidad de Book a un DTO de respuesta
   * @param entity Entidad de Book
   */
  mapEntityToResponseDto(entity: Book): ResponseBookDto {
    const responseBookDto = plainToClass(ResponseBookDto, entity)
    if (entity && entity.category && 'name' in entity.category) {
      responseBookDto.category = entity.category.name
    }
    if (entity && entity.publisher) {
      responseBookDto.publisherId = entity.publisher.id
    }
    Util.responseBookDtoAddPath(responseBookDto) //agregarle el path a la imagen
    return responseBookDto
  }
}
