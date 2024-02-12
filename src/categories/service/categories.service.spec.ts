import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from './categories.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Category, CategoryType } from '../entities/category.entity'
import { Repository } from 'typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoriesMapper } from '../mappers/categories.mapper'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { CategoriesNotificationsGateway } from '../../websockets/notifications/categories-notifications.gateway'
import { ResponseCategoryDto } from '../dto/response-category.dto'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

describe('CategoriesService', () => {
  let service: CategoriesService
  let categoriesRepository: Repository<Category>
  let categoriesNotificationsGateway: CategoriesNotificationsGateway
  let cacheManager: Cache

  const categoriesMapperMock = {
    toEntity: jest.fn(),
    mapUpdateToEntity: jest.fn(),
    mapEntityToResponseDto: jest.fn(),
  }

  const categoriesNotificationsGatewayMock = {
    sendMessage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(() => []),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        {
          provide: CategoriesMapper,
          useValue: categoriesMapperMock,
        },
        {
          provide: CategoriesNotificationsGateway,
          useValue: categoriesNotificationsGatewayMock,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<CategoriesService>(CategoriesService)
    categoriesRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    categoriesNotificationsGateway = module.get<CategoriesNotificationsGateway>(
      CategoriesNotificationsGateway,
    )
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('debería estar definido', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('debería devolver un array de categorías', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'categories',
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
        .spyOn(categoriesRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      jest
        .spyOn(categoriesMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(new ResponseCategoryDto())

      // Act
      const res: any = await service.findAll(paginateOptions)

      // Assert
      expect(res.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(res.meta.currentPage).toEqual(paginateOptions.page)
      expect(res.links.current).toEqual(
        `categories?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=name:ASC`,
      )
    })

    /*it('debería retornar el resultado caché', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'categories',
      }

      const testCategories = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'categories?page=1&limit=10&sortBy=name:ASC',
        },
      } as Paginated<Category>

      jest.spyOn(cacheManager, 'get').mockResolvedValue(testCategories)

      const result = await service.findAll(paginateOptions)

      expect(cacheManager.get).toHaveBeenCalledWith(
        `all_categories_page_${hash(JSON.stringify(paginateOptions))}`,
      )
      expect(result).toEqual(testCategories)
    })*/
  })

  describe('findOne', () => {
    it('debería devolver una categoría por ID', async () => {
      // Arrange
      const id = 1
      const mockCategory: Category = {
        id: id,
        name: 'Categoría Ejemplo',
        categoryType: CategoryType.DISNEY,
        isActive: true,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
        books: [],
      }

      const mockCategoryResponse: ResponseCategoryDto = {
        id: id,
        name: 'Categoría Ejemplo',
        categoryType: CategoryType.DISNEY,
        isActive: true,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
      }
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(mockCategory)
      jest
        .spyOn(categoriesMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(mockCategoryResponse)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      // Act
      const res = await service.findOne(id)

      // Assert
      expect(res).toEqual(mockCategoryResponse)
    })

    it('debería lanzar NotFoundException si no se encuentra la categoría con el ID', async () => {
      // Arrange
      jest.spyOn(categoriesRepository, 'findOneBy').mockResolvedValue(null)

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
      expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({ id: 999 })
    })

    it('debería lanzar BadRequestException si el ID no es válido', async () => {
      // Act & Assert
      await expect(service.findOne(null)).rejects.toThrow(BadRequestException)
    })
  })

  describe('create', () => {
    it('debería crear una nueva categoría', async () => {
      // Arrange
      const createCategoryDto: CreateCategoryDto = {
        name: 'Nueva Categoría',
        categoryType: CategoryType.DISNEY,
      }
      const mockCategory: Category = {
        id: 1,
        name: 'Nueva Categoría',
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
        books: [],
      }

      const mockCategoryResponse: ResponseCategoryDto = {
        id: 1,
        name: 'Nueva Categoría',
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
      }
      jest.spyOn(service, 'getByName').mockResolvedValue(null)
      jest.spyOn(categoriesMapperMock, 'toEntity').mockReturnValue(mockCategory)
      jest.spyOn(categoriesRepository, 'save').mockResolvedValue(mockCategory)
      jest
        .spyOn(categoriesMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(mockCategoryResponse)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      // Act
      const res = await service.create(createCategoryDto)

      // Assert
      expect(res).toEqual(mockCategoryResponse)
      expect(categoriesMapperMock.toEntity).toHaveBeenCalledWith(
        createCategoryDto,
      )
      expect(categoriesRepository.save).toHaveBeenCalledWith({
        ...mockCategory,
      })
    })

    it('debería lanzar BadRequestException si la categoría con el mismo nombre ya existe', async () => {
      // Arrange
      const createCategoryDto: CreateCategoryDto = {
        name: 'Categoría Existente',
        categoryType: CategoryType.DISNEY,
      }
      const existingCategory: Category = {
        id: 2,
        name: 'Categoría Existente',
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
        books: [],
      }
      const mockCategoryResponse: ResponseCategoryDto = {
        id: 2,
        name: 'Categoría Existente',
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
      }
      jest.spyOn(service, 'getByName').mockResolvedValue(existingCategory)
      jest
        .spyOn(categoriesMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(mockCategoryResponse)

      // Act & Assert
      await expect(service.create(createCategoryDto)).rejects.toThrow(
        BadRequestException,
      )
      expect(service.getByName).toHaveBeenCalledWith(
        createCategoryDto.name.trim(),
      )
    })
  })

  describe('update', () => {
    it('debería actualizar una categoría existente correctamente', async () => {
      // Arrange
      const id = 1
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Nuevo Nombre de Categoría',
      }
      const existingCategory: Category = {
        id: id,
        name: 'Categoría Antigua',
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
        books: [],
      }
      const mockCategoryResponse: ResponseCategoryDto = {
        id: id,
        name: 'Categoría Antigua',
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
      }
      jest.spyOn(service, 'findOne').mockResolvedValue(existingCategory)
      jest.spyOn(service, 'getByName').mockResolvedValue(null)
      jest
        .spyOn(categoriesMapperMock, 'mapUpdateToEntity')
        .mockReturnValue(existingCategory)
      jest
        .spyOn(categoriesRepository, 'save')
        .mockResolvedValue(existingCategory)
      jest
        .spyOn(categoriesMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(mockCategoryResponse)
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(existingCategory)

      // Act
      const res = await service.update(id, updateCategoryDto)

      // Assert
      expect(res).toEqual(mockCategoryResponse)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(service.getByName).toHaveBeenCalledWith(
        updateCategoryDto.name.trim(),
      )
      expect(categoriesMapperMock.mapUpdateToEntity).toHaveBeenCalledWith(
        updateCategoryDto,
        existingCategory,
      )
      expect(categoriesRepository.save).toHaveBeenCalledWith({
        ...existingCategory,
        ...existingCategory,
      })
    })

    it('debería lanzar BadRequestException si la categoría con el mismo nombre ya existe', async () => {
      // Arrange
      const id = 1
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Categoría Existente',
      }
      const existingCategory: Category = {
        id: 2,
        name: 'Categoría Existente',
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
        books: [],
      }
      jest.spyOn(service, 'findOne').mockResolvedValue(existingCategory)
      jest.spyOn(service, 'getByName').mockResolvedValue(existingCategory)

      // Act & Assert
      await expect(service.update(id, updateCategoryDto)).rejects.toThrow(
        BadRequestException,
      )
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(service.getByName).toHaveBeenCalledWith(
        updateCategoryDto.name.trim(),
      )
    })

    it('debería lanzar BadRequestException si el ID no es válido', async () => {
      // Act & Assert
      await expect(
        service.update(null, {} as UpdateCategoryDto),
      ).rejects.toThrow(BadRequestException)
    })

    it('debería lanzar NotFoundException si la categoría no se encuentra', async () => {
      // Arrange
      const id = 1
      jest.spyOn(service, 'findOne').mockResolvedValue(null)
      const updateCategoryDto = { name: 'Nueva Categoría' }

      // Act & Assert
      await expect(service.update(id, updateCategoryDto)).rejects.toThrow(
        NotFoundException,
      )
      expect(service.findOne).toHaveBeenCalledWith(id)
    })
  })

  describe('remove', () => {
    it('debería eliminar una categoría existente correctamente', async () => {
      // Arrange
      const id = 1
      const existingCategory: Category = {
        id: id,
        name: 'Categoría a Eliminar',
        categoryType: CategoryType.DISNEY,
        isActive: true,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
        books: [],
      }

      const mockCategoryResponse: ResponseCategoryDto = {
        id: id,
        name: 'Categoría a Eliminar',
        categoryType: CategoryType.DISNEY,
        isActive: true,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
      }
      jest.spyOn(service, 'findOne').mockResolvedValue(existingCategory)
      jest
        .spyOn(categoriesRepository, 'save')
        .mockResolvedValue(existingCategory)
      jest
        .spyOn(categoriesMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(mockCategoryResponse)

      // Act
      const res = await service.remove(id)

      // Assert
      expect(res).toEqual(mockCategoryResponse)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(categoriesRepository.save).toHaveBeenCalledWith({
        ...existingCategory,
        isActive: false,
      })
    })

    it('debería lanzar BadRequestException si el ID no es válido', async () => {
      // Act & Assert
      await expect(service.remove(null)).rejects.toThrow(BadRequestException)
    })
  })

  describe('getByName', () => {
    it('debería devolver una categoría dado el nombre', async () => {
      // Arrange
      const categoryName = 'Categoría Buscada'
      const mockCategory: Category = {
        id: 3,
        name: categoryName,
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
        books: [],
      }
      const mockCategoryResponse: ResponseCategoryDto = {
        id: 3,
        name: categoryName,
        isActive: true,
        categoryType: CategoryType.DISNEY,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T14:30:00Z'),
      }
      jest.spyOn(categoriesRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockCategory),
      } as any)

      jest
        .spyOn(categoriesMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(mockCategoryResponse)

      // Act
      const res = await service.getByName(categoryName)

      // Assert
      expect(res).toEqual(mockCategoryResponse)
      expect(categoriesRepository.createQueryBuilder).toHaveBeenCalled()
    })
  })
})
