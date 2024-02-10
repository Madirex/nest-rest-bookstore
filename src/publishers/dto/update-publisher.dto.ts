import { PartialType } from '@nestjs/swagger'
import { CreatePublisherDto } from './create-publisher.dto'

/**
 * DTO para actualizar un Publisher
 */
export class UpdatePublisherDto extends PartialType(CreatePublisherDto) {}
