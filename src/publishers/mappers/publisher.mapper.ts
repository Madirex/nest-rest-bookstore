import { Injectable } from '@nestjs/common'
import { ResponsePublisherDto } from '../dto/response-publisher.dto'
import { Publisher } from '../entities/publisher.entity'
import { CreatePublisherDto } from '../dto/create-publisher.dto'
import { UpdatePublisherDto } from '../dto/update-publisher.dto'

/**
 * Mapper de Publishers
 */
@Injectable()
export class PublisherMapper {
  /**
   * Mapea un DTO de respuesta a una entidad de Publisher
   * @param publisher ResponsePublisherDto
   */
  toEntity(publisher: ResponsePublisherDto): Publisher {
    const publisherEntity = new Publisher()
    publisherEntity.id = publisher.id
    publisherEntity.name = publisher.name
    publisherEntity.books = publisher.books
    publisherEntity.image = publisher.image
    publisherEntity.active = publisher.active
    publisherEntity.createdAt = publisher.createdAt
    publisherEntity.updatedAt = publisher.updatedAt
    return publisherEntity
  }

  /**
   * Mapea una entidad de Publisher a un DTO de respuesta
   * @param publisher Publisher
   */
  toDTO(publisher: Publisher): ResponsePublisherDto {
    const publisherDTO = new ResponsePublisherDto()
    publisherDTO.id = publisher.id
    publisherDTO.name = publisher.name
    publisherDTO.books = publisher.books
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
