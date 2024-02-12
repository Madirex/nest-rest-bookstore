import { Test, TestingModule } from '@nestjs/testing'
import { BooksService } from './books.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Book } from '../entities/book.entity'
import {
  Category,
  CategoryType,
} from '../../categories/entities/category.entity'
import { Repository } from 'typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateBookDto } from '../dto/create-book.dto'
import { v4 as uuidv4 } from 'uuid'
import { BookMapper } from '../mappers/book.mapper'
import { UpdateBookDto } from '../dto/update-book.dto'
import { StorageService } from '../../storage/storage.service'
import { BooksNotificationsGateway } from '../../websockets/notifications/books-notifications.gateway'
import { ResponseBookDto } from '../dto/response-book.dto'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Publisher } from '../../publishers/entities/publisher.entity'

describe('BooksService', () => {
  let service: BooksService
  let bookRepository: Repository<Book>
  let categoryRepository: Repository<Category>
  let publisherRepository: Repository<Publisher>
  let storageService: StorageService
  let booksNotificationsGateway: BooksNotificationsGateway
  let cacheManager: Cache

  const bookMapperMock = {
    toEntity: jest.fn(),
    mapUpdateToEntity: jest.fn(),
    mapEntityToResponseDto: jest.fn(),
  }

  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithoutUrl: jest.fn(),
  }

  const booksNotificationsGatewayMock = {
    sendMessage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(() => []),
    },
  }

  const id = 2

  const mockBook: Book = {
    id: id,
    name: 'Book Ejemplo',
    author: 'Autor Ejemplo',
    publisher: {
      id: 1,
      name: 'Publisher',
      createdAt: new Date(),
      updatedAt: new Date(),
      books: null,
      image: 'publisher-image.jpg',
      active: true,
    },
    category: {
      id: 1,
      name: 'test',
      categoryType: CategoryType.OTHER,
      createdAt: new Date('2023-01-01T12:00:00Z'),
      updatedAt: new Date('2023-01-01T12:00:00Z'),
      isActive: true,
      books: [],
    },
    image: 'empty.png',
    description: 'Descripción Ejemplo',
    price: 19.99,
    stock: 10,
    createdAt: new Date('2023-01-01T12:00:00Z'),
    updatedAt: new Date('2023-01-02T14:30:00Z'),
    isActive: true,
    shop: null,
  }

  const createBookDto: CreateBookDto = {
    name: 'Book Ejemplo',
    author: 'Autor Ejemplo',
    publisherId: 1,
    category: 'test',
    image: 'empty.png',
    description: 'Descripción Ejemplo',
    price: 19.99,
    stock: 10,
  }

  const responseBookDto: ResponseBookDto = {
    id: id,
    name: 'Book Ejemplo',
    author: 'Autor Ejemplo',
    publisherId: 1,
    category: 'test',
    image: 'empty.png',
    description: 'Descripción Ejemplo',
    price: 19.99,
    stock: 10,
    createdAt: new Date('2023-01-01T12:00:00Z'),
    updatedAt: new Date('2023-01-02T14:30:00Z'),
    isActive: true,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Publisher),
          useClass: Repository,
        },
        {
          provide: BookMapper,
          useValue: bookMapperMock,
        },
        {
          provide: BooksNotificationsGateway,
          useValue: booksNotificationsGatewayMock,
        },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<BooksService>(BooksService)
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book))
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    publisherRepository = module.get<Repository<Publisher>>(
      getRepositoryToken(Publisher),
    )
    storageService = module.get<StorageService>(StorageService)
    booksNotificationsGateway = module.get<BooksNotificationsGateway>(
      BooksNotificationsGateway,
    )
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('debería estar definido', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('debería devolver un array de Books', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'books',
      }

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([]),
      }

      jest
        .spyOn(bookRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      jest
        .spyOn(bookMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(new ResponseBookDto())

      // Act
      const res: any = await service.findAll(paginateOptions)

      // Assert
      expect(res.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(res.meta.currentPage).toEqual(paginateOptions.page)
      expect(res.links.current).toEqual(
        `books?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=name:ASC`,
      )
    })

    /*it('debería retornar el resultado caché', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'books',
      }

      const testBooks = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'books?page=1&limit=10&sortBy=name:ASC',
        },
      } as Paginated<Book>

      jest.spyOn(cacheManager, 'get').mockResolvedValue(testBooks)

      const result = await service.findAll(paginateOptions)

      expect(cacheManager.get).toHaveBeenCalledWith(
        `all_books_page_${hash(JSON.stringify(paginateOptions))}`,
      )
      expect(result).toEqual(testBooks)
    })*/
  })

  describe('findOne', () => {
    it('debería devolver un Book por ID', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(service, 'findOne').mockResolvedValue(responseBookDto)
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(mockBook)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      const res = await service.findOne(id)
      expect(res).toEqual(responseBookDto)
    })

    it('debería lanzar NotFoundException si no se encuentra el Book con el ID', async () => {
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(null)
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })

    it('debería lanzar BadRequestException si el ID no es válido', async () => {
      await expect(service.findOne(null)).rejects.toThrow(BadRequestException)
    })
  })

  describe('create', () => {
    it('debería crear un nuevo Book', async () => {
      jest.spyOn(service, 'getByName').mockResolvedValue(null)
      jest.spyOn(service, 'getCategoryByName').mockResolvedValue(null)
      jest
        .spyOn(service, 'getPublisherByName')
        .mockResolvedValue(new Publisher())
      jest.spyOn(bookMapperMock, 'toEntity').mockReturnValue(mockBook)
      jest
        .spyOn(bookMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(responseBookDto)
      jest.spyOn(bookRepository, 'save').mockResolvedValue(mockBook)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      const res = await service.create(createBookDto)
      expect(res).toEqual(responseBookDto)
      expect(service.getByName).toHaveBeenCalled()
      expect(service.getCategoryByName).toHaveBeenCalled()
      expect(bookMapperMock.toEntity).toHaveBeenCalledWith(
        createBookDto,
        null,
        new Publisher(),
      )
      expect(bookRepository.save).toHaveBeenCalledWith({ ...mockBook })
    })

    it('debería lanzar BadRequestException si el Book con el mismo nombre ya existe', async () => {
      jest.spyOn(service, 'getByName').mockResolvedValue(responseBookDto)

      await expect(service.create(createBookDto)).rejects.toThrow(
        BadRequestException,
      )
      expect(service.getByName).toHaveBeenCalledWith(createBookDto.name.trim())
    })
  })

  describe('update', () => {
    it('debería actualizar un Book existente correctamente', async () => {
      const updateBookDto: UpdateBookDto = {
        name: 'Nuevo Nombre',
        price: 25.99,
        stock: 15,
        image: 'https://www.nuevo-ejemplo.com/favicon.ico',
        category: 'nueva category',
        publisherId: 1,
        author: 'Nuevo Autor',
      }

      jest.spyOn(service, 'findOne').mockResolvedValue(responseBookDto)
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(mockBook)
      jest.spyOn(service, 'getByName').mockResolvedValue(null)
      jest.spyOn(service, 'getCategoryByName').mockResolvedValue(null)
      jest.spyOn(bookMapperMock, 'mapUpdateToEntity').mockReturnValue(mockBook)
      jest.spyOn(bookRepository, 'save').mockResolvedValue(mockBook)

      jest
        .spyOn(bookMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(responseBookDto)

      const res = await service.update(id, updateBookDto)

      expect(res).toEqual(responseBookDto)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(service.getByName).toHaveBeenCalledWith(updateBookDto.name.trim())
      expect(service.getCategoryByName).toHaveBeenCalledWith(
        updateBookDto.category,
      )
      expect(bookMapperMock.mapUpdateToEntity).toHaveBeenCalledWith(
        updateBookDto,
        mockBook,
        null,
      )
      expect(bookRepository.save).toHaveBeenCalledWith({
        ...mockBook,
        ...mockBook,
      })
    })

    it('debería lanzar BadRequestException si el ID no es válido', async () => {
      // Arrange
      const notValidId = null
      const updateBookDto: UpdateBookDto = {
        name: 'Nuevo Nombre',
        author: 'Nuevo Autor',
        publisherId: 1,
      }

      // Act & Assert
      await expect(service.update(notValidId, updateBookDto)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('debería lanzar NotFoundException si el Book a actualizar no se encuentra', async () => {
      // Arrange
      jest.spyOn(service, 'findOne').mockResolvedValue(null)
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(null)

      // Act & Assert
      await expect(service.update(id, {} as UpdateBookDto)).rejects.toThrow(
        NotFoundException,
      )
      expect(service.findOne).toHaveBeenCalledWith(id)
    })
  })

  describe('remove', () => {
    it('debería eliminar un Book existente correctamente', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(responseBookDto)

      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(mockBook)

      jest.spyOn(bookRepository, 'save').mockResolvedValue(mockBook)

      jest
        .spyOn(bookMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(responseBookDto)

      const res = await service.remove(id)

      expect(res).toEqual(responseBookDto)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(bookRepository.save).toHaveBeenCalledWith({
        ...mockBook,
        isActive: false,
      })
    })

    it('debería lanzar BadRequestException si el ID no es válido', async () => {
      const idInvalid = null
      await expect(service.remove(idInvalid)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('getByName', () => {
    it('debería devolver un Book dado el nombre', async () => {
      const nombre = 'Book Buscado'

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockBook),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
      }

      jest
        .spyOn(bookRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any)

      jest
        .spyOn(bookMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(responseBookDto)

      const res = await service.getByName(nombre)

      expect(res).toEqual(responseBookDto)
      expect(bookRepository.createQueryBuilder).toHaveBeenCalled()
    })
  })

  describe('getCategoryByName', () => {
    it('debería devolver una categoría dado el nombre', async () => {
      const categoryName = 'Categoría Buscada'
      const categoryMock: Category = {
        id: 6,
        name: categoryName,
        categoryType: CategoryType.OTHER,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z'),
        isActive: true,
        books: [],
      }

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(categoryMock),
      }

      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any)

      const res = await service.getCategoryByName(categoryName)

      expect(res).toEqual(categoryMock)
      expect(categoryRepository.createQueryBuilder).toHaveBeenCalled()
    })
  })

  describe('updateImage', () => {
    it('debería actualizar la imagen de un Book', async () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      }
      const mockFile = {
        filename: 'new_image.png',
      }

      const mockNewBook = new Book()

      const mockResponseBookResponse = new ResponseBookDto()

      mockNewBook.image = 'http://localhost/storage/new_image.png'
      mockResponseBookResponse.image = 'http://localhost/storage/new_image.png'

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResponseBookResponse)

      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(mockNewBook)

      jest.spyOn(bookRepository, 'save').mockResolvedValue(mockNewBook)
      jest
        .spyOn(bookMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(mockResponseBookResponse)

      expect(
        await service.updateImage(
          uuidv4(),
          mockFile as any,
          mockRequest as any,
          false,
        ),
      ).toEqual(mockResponseBookResponse)

      expect(storageService.removeFile).toHaveBeenCalled()
    })
  })
})
