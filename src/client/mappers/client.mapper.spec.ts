import { Test, TestingModule } from '@nestjs/testing'
import { ClientMapper } from './client.mapper'
import { ResponseClientDto } from '../dto/response-client.dto'
import { Client } from '../entities/client.entity'
import { CreateClientDto } from '../dto/create-client.dto'
import { UpdateClientDto } from '../dto/update-client.dto'

describe('ClientMapper', () => {
  let provider: ClientMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientMapper],
    }).compile()

    provider = module.get<ClientMapper>(ClientMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  describe('toEntity', () => {
    it('toEntity mapper', () => {
      const dto: ResponseClientDto = new ResponseClientDto()
      dto.id = '1'
      dto.name = 'Pepe'
      dto.surname = 'ruiz'
      dto.email = 'pepe@gmail.com'
      dto.phone = '633331369'
      dto.address = {
        street: 'Calle 1',
        number: '12',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
        postalCode: '28921',
      }
      dto.image = Client.IMAGE_DEFAULT

      const entity = provider.toEntity(dto)

      expect(entity.id).toBe(dto.id)
      expect(entity.name).toBe(dto.name)
      expect(entity.surname).toBe(dto.surname)
      expect(entity.email).toBe(dto.email)
      expect(entity.phone).toBe(dto.phone)
      expect(entity.address).toBe(dto.address)
      expect(entity.image).toBe(dto.image)
    })
  })

  describe('toDTO', () => {
    it('toDTO mapper', () => {
      const entity: Client = new Client()
      entity.id = '1'
      entity.name = 'Pepe'
      entity.surname = 'ruiz'
      entity.email = 'pepe@gmail.com'
      entity.phone = '633331369'
      entity.address = {
        street: 'Calle 1',
        number: '12',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
        postalCode: '28921',
      }
      entity.image = Client.IMAGE_DEFAULT

      const dto = provider.toDTO(entity)

      expect(dto.id).toBe(entity.id)
      expect(dto.name).toBe(entity.name)
      expect(dto.surname).toBe(entity.surname)
      expect(dto.email).toBe(entity.email)
      expect(dto.phone).toBe(entity.phone)
      expect(dto.address).toBe(entity.address)
      expect(dto.image).toBe(entity.image)
    })
  })

  describe('createToEntity', () => {
    it('createToEntity mapper', () => {
      const dto: CreateClientDto = new CreateClientDto()
      dto.name = 'Pepe'
      dto.surname = 'ruiz'
      dto.email = 'pepe@gmail.com'
      dto.phone = '633331369'
      dto.address = {
        street: 'Calle 1',
        number: '12',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
        postalCode: '28921',
      }

      const entity = provider.createToEntity(dto)

      expect(entity.name).toBe(dto.name)
      expect(entity.surname).toBe(dto.surname)
      expect(entity.email).toBe(dto.email)
      expect(entity.phone).toBe(dto.phone)
      expect(entity.address).toBe(dto.address)
      expect(entity.image).toBe(Client.IMAGE_DEFAULT)
    })
  })

  describe('updateToEntity', () => {
    it('updateToEntity mapper', () => {
      const dto: UpdateClientDto = new UpdateClientDto()
      dto.name = 'Pepe'
      dto.surname = 'ruiz'
      dto.email = 'pepe@gmail.com'
      dto.phone = '633331369'
      dto.address = {
        street: 'Calle 1',
        number: '12',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
        postalCode: '28921',
      }

      const entity = provider.updateToEntity(dto)

      expect(entity.name).toBe(dto.name)
      expect(entity.surname).toBe(dto.surname)
      expect(entity.email).toBe(dto.email)
      expect(entity.phone).toBe(dto.phone)
      expect(entity.address).toBe(dto.address)
      expect(entity.image).toBe(Client.IMAGE_DEFAULT)
    })
  })
})
