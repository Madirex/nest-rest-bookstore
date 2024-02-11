import { Injectable } from '@nestjs/common'
import { ResponsePublisherDto } from '../dto/response-publisher.dto'
import { Publisher } from '../entities/publisher.entity'
import { CreatePublisherDto } from '../dto/create-publisher.dto'
import { UpdatePublisherDto } from '../dto/update-publisher.dto'
import {Book} from "../../books/entities/book.entity";

/**
 * Mapper de Publishers
 */
@Injectable()
export class PublisherMapper {

  /**
   * Mapea una entidad de Publisher a un DTO de respuesta
   * @param publisher Publisher
   */
  toDTO(publisher: Publisher): ResponsePublisherDto {
    const publisherDTO = new ResponsePublisherDto()
    publisherDTO.id = publisher.id
    publisherDTO.name = publisher.name
    publisher.books.forEach((book: Book) => {
      publisherDTO.books.push(book.id)
    })
    publisherDTO.image = publisher.image
    publisherDTO.active = publisher.active
    publisherDTO.createdAt = publisher.createdAt
    publisherDTO.updatedAt = publisher.updatedAt
    return publisherDTO
  }

  /**
   * Mapea un DTO de creación de Publisher a una entidad de Publisher
   * @param publisher CreatePublisherDto
   */
  createToEntity(publisher: CreatePublisherDto): Publisher {
    const publisherEntity = new Publisher()
    publisherEntity.name = publisher.name
    publisherEntity.image = publisher.image
    publisherEntity.active = true
    publisherEntity.createdAt = new Date()
    publisherEntity.updatedAt = new Date()
    return publisherEntity
  }

  /**
   * Mapea un DTO de actualización de Publisher a una entidad de Publisher
   * @param publisher UpdatePublisherDto
   */
  updateToEntity(publisher: UpdatePublisherDto): Publisher {
    const publisherEntity = new Publisher()
    publisherEntity.name = publisher.name
    publisherEntity.image = publisher.image
    publisherEntity.active = true
    publisherEntity.createdAt = new Date()
    publisherEntity.updatedAt = new Date()
    return publisherEntity
  }
}
