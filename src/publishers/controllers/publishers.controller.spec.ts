import { Test, TestingModule } from '@nestjs/testing'
import { PublishersController } from './publishers.controller'
import { PublisherService } from '../services/publishers.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ResponsePublisherDto } from '../dto/response-publisher.dto'
import { Paginated } from 'nestjs-paginate'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('PublishersController', () => {
  let controller: PublishersController
  let service: PublisherService

  let mockPublisherService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateImage: jest.fn(),
    addBookToPublisher: jest.fn(),
    removeBookFromPublisher: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishersController],
      providers: [
        {
          provide: PublisherService,
          useValue: mockPublisherService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
      ],
    }).compile()

    controller = module.get<PublishersController>(PublishersController)
    service = module.get<PublisherService>(PublisherService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    const publishers: ResponsePublisherDto[] = []
    const publisherDto = new ResponsePublisherDto()

    beforeEach(() => {
      publisherDto.id = 1
      publisherDto.name = 'Test'
      publisherDto.books = []
      publisherDto.active = true
      publishers.push(publisherDto)
    })

    it('should return an array of publishers', async () => {
      const resTest = new Paginated<ResponsePublisherDto>()
      resTest.data = publishers

      const paginatedOptions = {
        page: 1,
        limit: 10,
        path: 'publisher',
      }

      jest.spyOn(service, 'findAll').mockResolvedValue(resTest)

      const result: any = await controller.findAll(paginatedOptions)

      expect(result.data[0].id).toBe(publisherDto.id)
      expect(result.data[0].name).toBe(publisherDto.name)
      expect(result.data[0].books).toBe(publisherDto.books)
      expect(result.data[0].active).toBe(publisherDto.active)
    })
  })

  describe('findOne', () => {
    const publisherDto = new ResponsePublisherDto()
    const id = 1

    beforeEach(() => {
      publisherDto.id = id
      publisherDto.name = 'Test'
      publisherDto.books = []
      publisherDto.active = true
    })

    it('should return a publisher', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(publisherDto)
      const result: any = await controller.findOne(id)

      expect(result.id).toBe(publisherDto.id)
      expect(result.name).toBe(publisherDto.name)
      expect(result.books).toBe(publisherDto.books)
      expect(result.active).toBe(publisherDto.active)
    })

    it('should return a not found exception', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    const publisherDto = new ResponsePublisherDto()
    const createPublisherDto = {
      name: 'Test',
      active: true,
    }

    beforeEach(() => {
      publisherDto.id = 1
      publisherDto.name = createPublisherDto.name
      publisherDto.books = []
      publisherDto.active = createPublisherDto.active
    })

    it('should return a publisher', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(publisherDto)
      const result: any = await controller.create(createPublisherDto)

      expect(result.id).toBe(publisherDto.id)
      expect(result.name).toBe(publisherDto.name)
      expect(result.books).toBe(publisherDto.books)
      expect(result.active).toBe(publisherDto.active)
    })

    it('should return badRequest already exist', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())

      await expect(controller.create(createPublisherDto)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('update', () => {
    const publisherDto = new ResponsePublisherDto()
    const id = 1
    const updatePublisherDto = {
      name: 'Test',
      active: true,
    }

    beforeEach(() => {
      publisherDto.id = id
      publisherDto.name = updatePublisherDto.name
      publisherDto.books = []
      publisherDto.active = updatePublisherDto.active
    })

    it('should return a publisher', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(publisherDto)
      const result: any = await controller.update(id, updatePublisherDto)

      expect(result.id).toBe(publisherDto.id)
      expect(result.name).toBe(publisherDto.name)
      expect(result.books).toBe(publisherDto.books)
      expect(result.active).toBe(publisherDto.active)
    })

    it('should return a not found exception', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())

      await expect(controller.update(id, updatePublisherDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    const id = 1

    it('should return a void', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue()
      const result: any = await controller.remove(id)

      expect(result).toBeUndefined()
    })

    it('should return a not found exception', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateImage', () => {
    const file = {
      originalname: 'file.png',
      mimetype: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    } as Express.Multer.File
    const mockReq = {} as any

    it('should throw BadRequestException for unsupported file type', async () => {
      jest
        .spyOn(service, 'updateImage')
        .mockRejectedValue(new BadRequestException())

      await expect(controller.updateImage(1, file, mockReq)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw BadRequestException for file size exceeding limit', async () => {
      jest
        .spyOn(service, 'updateImage')
        .mockRejectedValue(new BadRequestException())

      await expect(controller.updateImage(1, file, mockReq)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw BadRequestException for undefined file', async () => {
      jest
        .spyOn(service, 'updateImage')
        .mockRejectedValue(new BadRequestException())

      await expect(
        controller.updateImage(1, undefined, mockReq),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('addBookToPublisher', () => {
    const id = 1
    const bookId = 1
    const publisherDto = new ResponsePublisherDto()

    beforeEach(() => {
      publisherDto.id = id
      publisherDto.name = 'Test'
      publisherDto.books = []
      publisherDto.active = true
    })

    it('should return a publisher', async () => {
      jest.spyOn(service, 'addBookToPublisher').mockResolvedValue(publisherDto)
      const result: any = await controller.addBookToPublisher(id, bookId)

      expect(result.id).toBe(publisherDto.id)
      expect(result.name).toBe(publisherDto.name)
      expect(result.books).toBe(publisherDto.books)
      expect(result.active).toBe(publisherDto.active)
    })

    it('should return a not found exception', async () => {
      jest
        .spyOn(service, 'addBookToPublisher')
        .mockRejectedValue(new NotFoundException())

      await expect(controller.addBookToPublisher(id, bookId)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('removeBookFromPublisher', () => {
    const id = 1
    const bookId = 1
    const publisherDto = new ResponsePublisherDto()

    beforeEach(() => {
      publisherDto.id = id
      publisherDto.name = 'Test'
      publisherDto.books = []
      publisherDto.active = true
    })

    it('should return a publisher', async () => {
      jest
        .spyOn(service, 'removeBookFromPublisher')
        .mockResolvedValue(publisherDto)
      const result: any = await controller.removeBookFromPublisher(id, bookId)

      expect(result.id).toBe(publisherDto.id)
      expect(result.name).toBe(publisherDto.name)
      expect(result.books).toBe(publisherDto.books)
      expect(result.active).toBe(publisherDto.active)
    })

    it('should return a not found exception', async () => {
      jest
        .spyOn(service, 'removeBookFromPublisher')
        .mockRejectedValue(new NotFoundException())

      await expect(
        controller.removeBookFromPublisher(id, bookId),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
