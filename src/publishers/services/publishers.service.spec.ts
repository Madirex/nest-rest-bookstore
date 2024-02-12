import { Test, TestingModule } from '@nestjs/testing'
import { PublisherService } from './publishers.service'
import { Repository } from 'typeorm'
import { Publisher } from '../entities/publisher.entity'
import { Book } from '../../books/entities/book.entity'
import { StorageService } from '../../storage/storage.service'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { getRepositoryToken } from '@nestjs/typeorm'
import { PublisherMapper } from '../mappers/publisher.mapper'
import { PublishersNotificationsGateway } from '../../websockets/notifications/publishers-notification.gateway'
import { Cache } from 'cache-manager'
import { ResponsePublisherDto } from '../dto/response-publisher.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('PublisherService', () => {
  let service: PublisherService
  let publisherRepository: Repository<Publisher>
  let bookRepository: Repository<Book>
  let publishersNotificationsGateway: PublishersNotificationsGateway
  let storageService: StorageService
  let cacheManager: Cache

  const publisherMapperMock = {
    toDTO: jest.fn(),
    createToEntity: jest.fn(),
    updateToEntity: jest.fn(),
  }
  const publishersNotificationsGatewayMock = {
    sendMessage: jest.fn(),
  }
  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithoutUrl: jest.fn(),
  }
  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(() => []),
    },
  }
  const paginateOptions = {
    page: 1,
    limit: 10,
    path: 'publishers',
  }
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([]),
  }
  const updatePublisherDto = { name: 'Updated Publisher' }
  const existingPublisherId = 1
  const mockPublisher = {
    id: existingPublisherId,
    name: 'Test Publisher',
    books: new Set<Book>(),
  }
  const responsePublisherDto = new ResponsePublisherDto()
  const mockFile = {
    filename: 'test.jpg',
  } as Express.Multer.File
  const mockBook = new Book()
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        PublisherService,
        {
          provide: getRepositoryToken(Publisher),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Book),
          useClass: Repository,
        },
        {
          provide: PublisherMapper,
          useValue: publisherMapperMock,
        },
        {
          provide: PublishersNotificationsGateway,
          useValue: publishersNotificationsGatewayMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile()

    service = module.get<PublisherService>(PublisherService)
    publisherRepository = module.get<Repository<Publisher>>(
      getRepositoryToken(Publisher),
    )
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book))
    storageService = module.get<StorageService>(StorageService)
    publishersNotificationsGateway = module.get<PublishersNotificationsGateway>(
      PublishersNotificationsGateway,
    )
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('debería devolver un array de Publishers', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest
        .spyOn(publisherRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest
        .spyOn(publisherMapperMock, 'toDTO')
        .mockReturnValue(new ResponsePublisherDto())
      const res: any = await service.findAll(paginateOptions)
      expect(res.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(res.meta.currentPage).toEqual(paginateOptions.page)
    })
  })
  describe('findOne', () => {
    it('debería devolver un Publisher específico por ID', async () => {
      const mockPublisher = { id: 1, name: 'Test Publisher' }
      const responsePublisherDto = new ResponsePublisherDto()

      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockResolvedValue(mockPublisher as any)
      jest
        .spyOn(publisherMapperMock, 'toDTO')
        .mockReturnValue(responsePublisherDto)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined)

      const result = await service.findOne(1)
      expect(result).toEqual(responsePublisherDto)
      expect(publisherMapperMock.toDTO).toHaveBeenCalledWith(mockPublisher)
    })

    it('debería lanzar una NotFoundException si el Publisher no existe', async () => {
      jest.spyOn(publisherRepository, 'findOneBy').mockResolvedValue(null)

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })
  describe('findByName', () => {
    it('debería devolver un Publisher específico por nombre', async () => {
      const mockPublisher = { id: 1, name: 'Test Publisher' }
      const responsePublisherDto = new ResponsePublisherDto()

      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockResolvedValue(mockPublisher as any)
      jest
        .spyOn(publisherMapperMock, 'toDTO')
        .mockReturnValue(responsePublisherDto)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined)

      const result = await service.findByName('Test Publisher')
      expect(result).toEqual(responsePublisherDto)
      expect(publisherMapperMock.toDTO).toHaveBeenCalledWith(mockPublisher)
    })

    it('debería lanzar una NotFoundException si el Publisher no existe', async () => {
      jest.spyOn(publisherRepository, 'findOneBy').mockResolvedValue(null)

      await expect(service.findByName('Test Publisher')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('create', () => {
    it('debería crear un Publisher', async () => {
      const createPublisherDto = { name: 'New Publisher' }
      const mockPublisher = { id: 1, ...createPublisherDto }
      const responsePublisherDto = new ResponsePublisherDto()
      jest.spyOn(publisherRepository, 'findOneBy').mockResolvedValue(null)
      jest
        .spyOn(publisherMapperMock, 'createToEntity')
        .mockReturnValue(mockPublisher)
      jest
        .spyOn(publisherRepository, 'save')
        .mockResolvedValue(mockPublisher as any)
      jest
        .spyOn(publisherMapperMock, 'toDTO')
        .mockReturnValue(responsePublisherDto)
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined)

      const result = await service.create(createPublisherDto)
      expect(result).toEqual(responsePublisherDto)
    })
    it('debería lanzar un error si el Publisher ya existe', async () => {
      const createPublisherDto = { name: 'New Publisher' }
      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockResolvedValue(createPublisherDto as any)

      await expect(service.create(createPublisherDto)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
  describe('update', () => {
    describe('update', () => {
      it('debería actualizar un Publisher', async () => {
        jest.spyOn(publisherRepository, 'findOneBy').mockResolvedValueOnce(null)
        jest
          .spyOn(publisherRepository, 'findOneBy')
          .mockResolvedValueOnce(mockPublisher as any)
        jest
          .spyOn(publisherMapperMock, 'updateToEntity')
          .mockReturnValue(mockPublisher)
        jest
          .spyOn(publisherRepository, 'save')
          .mockResolvedValue(mockPublisher as any)
        jest
          .spyOn(publisherMapperMock, 'toDTO')
          .mockReturnValue(responsePublisherDto)
        const result = await service.update(
          existingPublisherId,
          updatePublisherDto,
        )
        expect(result).toEqual(responsePublisherDto)
      })
    })

    it('debería lanzar un error si el Publisher no existe', async () => {
      const updatePublisherDto = { name: 'Updated Publisher' }
      jest.spyOn(publisherRepository, 'findOneBy').mockResolvedValue(null)

      await expect(service.update(1, updatePublisherDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('remove', () => {
    it('debería eliminar un publisher ', async () => {
      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockReturnValue(mockPublisher as any)
      const ejec = jest
        .spyOn(publisherRepository, 'delete')
        .mockReturnValue(null)
      await service.remove(existingPublisherId)
      expect(ejec).toHaveBeenCalledTimes(1)
    })
  })
  describe('updateImage', () => {
    it('debería actulizar la imagen de un publisher', async () => {
      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockResolvedValue(mockPublisher as any)
      jest
        .spyOn(publisherRepository, 'save')
        .mockResolvedValue(mockPublisher as any)
      jest.spyOn(publisherMapperMock, 'toDTO').mockReturnValue(mockPublisher)
      const result = await service.updateImage(
        existingPublisherId,
        mockFile,
        mockPublisher as any,
      )
      expect(result).toEqual(mockPublisher)
    })
    it('debería lanzar un error si el Publisher no existe', async () => {
      jest.spyOn(publisherRepository, 'findOneBy').mockResolvedValue(null)
      await expect(
        service.updateImage(
          existingPublisherId,
          mockFile,
          mockPublisher as any,
        ),
      ).rejects.toThrowError(NotFoundException)
    })
  })
  describe('addBookToPublisher', () => {
    it('debería agregar un libro a un publisher', async () => {
      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockResolvedValue(mockPublisher as any)
      jest.spyOn(bookRepository, 'findOneBy').mockResolvedValue(mockBook as any)
      jest
        .spyOn(publisherRepository, 'save')
        .mockResolvedValue(mockPublisher as any)
      jest.spyOn(publisherMapperMock, 'toDTO').mockReturnValue(mockPublisher)

      const result = await service.addBookToPublisher(
        mockPublisher.id,
        mockBook.id,
      )
      expect(result).toEqual(mockPublisher)
    })
    it('debería lanzar el error NotFoundException', async () => {
      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockResolvedValue(mockPublisher as any)
      jest.spyOn(bookRepository, 'findOneBy').mockResolvedValue(null)

      await expect(
        service.addBookToPublisher(mockPublisher.id, mockBook.id),
      ).rejects.toThrowError(NotFoundException)
    })
  })
  describe('removeBookFromPublisher', () => {
    it('debería eliminar un libro de un publisher', async () => {
      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockResolvedValue(mockPublisher as any)
      jest.spyOn(bookRepository, 'findOneBy').mockResolvedValue(mockBook as any)
      jest
        .spyOn(publisherRepository, 'save')
        .mockResolvedValue(mockPublisher as any)
      jest.spyOn(publisherMapperMock, 'toDTO').mockReturnValue(mockPublisher)

      const result = await service.removeBookFromPublisher(
        mockPublisher.id,
        mockBook.id,
      )
      expect(result).toEqual(mockPublisher)
    })

    it('should throw NotFoundException when publisher is not found', async () => {
      jest.spyOn(publisherRepository, 'findOneBy').mockResolvedValue(null)

      await expect(
        service.removeBookFromPublisher(mockPublisher.id, mockBook.id),
      ).rejects.toThrowError(NotFoundException)
    })

    it('should throw NotFoundException when book is not found', async () => {
      const mockPublisherId = 1
      const mockBookId = 2
      const mockPublisher = {
        id: mockPublisherId,
        name: 'Test Publisher',
        books: new Set<Book>(),
      }

      jest
        .spyOn(publisherRepository, 'findOneBy')
        .mockResolvedValue(mockPublisher as any)
      jest.spyOn(bookRepository, 'findOneBy').mockResolvedValue(null)

      await expect(
        service.removeBookFromPublisher(mockPublisherId, mockBookId),
      ).rejects.toThrowError(NotFoundException)
    })
  })
})
