import { Injectable } from '@nestjs/common'
import { ResponseClientDto } from '../dto/response-client.dto'
import { Client } from '../entities/client.entity'
import { CreateClientDto } from '../dto/create-client.dto'
import { UpdateClientDto } from '../dto/update-client.dto'

/**
 * Clase que se encarga de mapear los datos de los clientes
 */
@Injectable()
export class ClientMapper {
  /**
   * Mapea un DTO de respuesta a una entidad de Client
   * @param client ResponseClientDto
   * @returns Client entity
   */
  toEntity(client: ResponseClientDto): Client {
    const { id, name, surname, email, phone, address, createdAt, updatedAt } =
      client
    const clientEntity = new Client()
    clientEntity.id = id
    clientEntity.name = name
    clientEntity.surname = surname
    clientEntity.email = email
    clientEntity.phone = phone
    clientEntity.address = address
    clientEntity.image = client.image ?? Client.IMAGE_DEFAULT
    clientEntity.createdAt = createdAt
    clientEntity.updatedAt = updatedAt
    return clientEntity
  }

  /**
   * Mapea una entidad de Client a un DTO de respuesta
   * @param client
   */
  toDTO(client: Client): ResponseClientDto {
    const { id, name, surname, email, phone, address, createdAt, updatedAt } =
      client
    const clientDTO = new ResponseClientDto()
    clientDTO.id = id
    clientDTO.name = name
    clientDTO.surname = surname
    clientDTO.email = email
    clientDTO.phone = phone
    clientDTO.address = address
    clientDTO.image = client.image ?? Client.IMAGE_DEFAULT
    clientDTO.createdAt = createdAt
    clientDTO.updatedAt = updatedAt
    return clientDTO
  }

  /**
   * Mapea un DTO de creación de Client a una entidad de Client
   * @param client CreateClientDto
   * @returns Client entity
   */
  createToEntity(client: CreateClientDto): Client {
    const { name, surname, email, phone, address } = client
    const clientEntity = new Client()
    clientEntity.name = name
    clientEntity.surname = surname
    clientEntity.email = email
    clientEntity.phone = phone
    clientEntity.address = address
    clientEntity.image = client.image ?? Client.IMAGE_DEFAULT
    return clientEntity
  }

  /**
   * Mapea un DTO de actualización de Client a una entidad de Client
   * @param client UpdateClientDto
   * @returns Client entity
   */
  updateToEntity(client: UpdateClientDto): Client {
    const { name, surname, email, phone, address } = client
    const clientEntity = new Client()
    clientEntity.name = name
    clientEntity.surname = surname
    clientEntity.email = email
    clientEntity.phone = phone
    clientEntity.address = address
    clientEntity.image = client.image ?? Client.IMAGE_DEFAULT
    return clientEntity
  }
}
