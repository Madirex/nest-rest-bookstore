import { PartialType } from '@nestjs/mapped-types'
import { CreateClientDto } from './create-client.dto'

/**
 * DTO para actualizar un cliente
 */
export class UpdateClientDto extends PartialType(CreateClientDto) {}
