import { Test, TestingModule } from '@nestjs/testing'
import { Publisher } from '../entities/publisher.entity'
import { CreatePublisherDto } from '../dto/create-publisher.dto'
import { UpdatePublisherDto } from '../dto/update-publisher.dto'
import { PublisherMapper } from '../mappers/publisher.mapper'

describe('PublisherMapper', () => {
  let mapper: PublisherMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublisherMapper],
    }).compile()

    mapper = module.get<PublisherMapper>(PublisherMapper)
  })

  it('should be defined', () => {
    expect(mapper).toBeDefined()
  })

  describe('toDTO', () => {
    it('should map a Publisher entity to a ResponsePublisherDto', () => {
      const publisher = new Publisher()
      publisher.id = 1
      publisher.name = 'Test Publisher'
      publisher.image = 'image.jpg'
      publisher.active = true
      publisher.createdAt = new Date()
      publisher.updatedAt = new Date()

      const dto = mapper.toDTO(publisher)

      expect(dto.id).toEqual(publisher.id)
      expect(dto.name).toEqual(publisher.name)
      expect(dto.image).toEqual(publisher.image)
      expect(dto.active).toEqual(publisher.active)
    })
  })

  describe('createToEntity', () => {
    it('should map a CreatePublisherDto to a Publisher entity', () => {
      const createDto = new CreatePublisherDto()
      createDto.name = 'New Publisher'
      createDto.image = 'new-image.jpg'

      const entity = mapper.createToEntity(createDto)

      expect(entity.name).toEqual(createDto.name)
      expect(entity.image).toEqual(createDto.image)
      expect(entity.active).toBeTruthy()
    })
  })

  describe('updateToEntity', () => {
    it('should map an UpdatePublisherDto to a Publisher entity', () => {
      const updateDto = new UpdatePublisherDto()
      updateDto.name = 'Updated Publisher'
      updateDto.image = 'updated-image.jpg'

      const entity = mapper.updateToEntity(updateDto)

      expect(entity.name).toEqual(updateDto.name)
      expect(entity.image).toEqual(updateDto.image)
      expect(entity.active).toBeTruthy()
    })
  })
})
