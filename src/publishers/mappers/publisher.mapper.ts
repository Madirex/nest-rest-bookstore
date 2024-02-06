import {Injectable} from "@nestjs/common";
import {CreatePublisherDto} from "../dto/create-publisher.dto";
import {Book} from "../../books/entities/book.entity";
import {Publisher} from "../entities/publisher.entity";
import {plainToClass} from "class-transformer";
import {UpdatePublisherDto} from "../dto/update-publisher.dto";
import {ResponsePublisherDto} from "../dto/response-publisher.dto";

@Injectable()
export class PublisherMapper {
    toEntity(createPublisherDto: CreatePublisherDto,
             books: Book[],
    ): Publisher {
        const publisherEntity = plainToClass(Publisher, createPublisherDto)
        publisherEntity.createdAt = new Date()
        publisherEntity.updatedAt = new Date()
        publisherEntity.name = createPublisherDto.name.trim()
        publisherEntity.image = createPublisherDto.image
            ? createPublisherDto.image.trim()
            : Publisher.IMAGE_DEFAULT
        publisherEntity.books = books
        publisherEntity.isActive = true
        return publisherEntity
    }

    updateToEntity(
        dto: UpdatePublisherDto,
        entity: Publisher,
        books: Book[]
    ): Publisher {
        const publisher = new Publisher()
        publisher.id = entity.id
        publisher.createdAt = entity.createdAt
        publisher.updatedAt = new Date()
        publisher.name = dto.name ? dto.name.trim() : entity.name
        publisher.image = dto.image ? dto.image.trim() : entity.image
        publisher.books = books || entity.books
        publisher.isActive = entity.isActive
        return publisher
    }

    toResponseDto(entity: Publisher): ResponsePublisherDto {
        return plainToClass(ResponsePublisherDto, entity)
    }
}