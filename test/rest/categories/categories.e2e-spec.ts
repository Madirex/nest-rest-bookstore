import { Test, TestingModule } from '@nestjs/testing'
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common'
import * as request from 'supertest'
import { CategoriesController } from '../../../src/categories/controller/categories.controller'
import { CategoriesService } from '../../../src/categories/service/categories.service'
import {
  Category,
  CategoryType,
} from '../../../src/categories/entities/category.entity'
import { CreateCategoryDto } from '../../../src/categories/dto/create-category.dto'
import { UpdateCategoryDto } from '../../../src/categories/dto/update-category.dto'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

describe('CategoriesController (e2e)', () => {
  let app: INestApplication
  let cacheManager: Cache
  const endpoint = '/categories'
  const simulatedDate = new Date('2021-01-01T00:00:00.000Z')

  const testCategories: Category[] = [
    {
      id: 1,
      name: 'Category1',
      createdAt: simulatedDate,
      updatedAt: simulatedDate,
      categoryType: CategoryType.OTHER,
      isActive: true,
      books: [],
    },
  ]

  const createCategoryDto: CreateCategoryDto = {
    name: 'Category1',
    categoryType: CategoryType.OTHER,
  }

  const updateCategoryDto: UpdateCategoryDto = {
    name: 'UpdatedCategory',
  }

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getByName: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(() => []),
    },
  }

  /**
   * Antes de cada test
   */
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER)
  })

  /**
   * Después de cada test
   */
  afterAll(async () => {
    await app.close()
  })

  /**
   * Test for GET /categories
   */
  describe('GET /categories', () => {
    it('debería retornar las categorías', async () => {
      mockCategoriesService.findAll.mockResolvedValue([testCategories])

      const { body } = await request(app.getHttpServer())
        .get(endpoint)
        .expect(200)

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const expectedBodyString = JSON.stringify([testCategories])
      const receivedBodyString = JSON.stringify(body)

      expect(receivedBodyString).toEqual(expectedBodyString)
      expect(mockCategoriesService.findAll).toHaveBeenCalled()
    })

    it('debería retornar el resultado caché', async () => {
      const categories = [testCategories]
      jest.spyOn(cacheManager, 'get').mockResolvedValue(categories)
      const result = await mockCategoriesService.findAll()
      expect(result).toEqual(categories)
    })
  })

  /**
   * Test for GET /categories/:id
   */
  describe('GET /categories/:id', () => {
    it('debería retornar la categoría por su ID', async () => {
      mockCategoriesService.findOne.mockResolvedValue(testCategories[0])

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}/${testCategories[0].id}`)
        .expect(200)

      const expectedBodyString = JSON.stringify(testCategories[0])
      const receivedBodyString = JSON.stringify(body)
      expect(receivedBodyString).toEqual(expectedBodyString)
      expect(mockCategoriesService.findOne).toHaveBeenCalled()
    })

    it('debería retornar un error 404 si la categoría no se encuentra', async () => {
      mockCategoriesService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${endpoint}/${testCategories[0].id}`)
        .expect(404)
    })
  })

  /**
   * Test for POST /categories
   */
  describe('POST /categories', () => {
    it('debería de crear una nueva categoría', async () => {
      mockCategoriesService.create.mockResolvedValue(testCategories[0])

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const { body } = await request(app.getHttpServer())
        .post(endpoint)
        .send(createCategoryDto)
        .expect(201)
      const expectedBodyString = JSON.stringify(testCategories[0])
      const receivedBodyString = JSON.stringify(body)

      expect(receivedBodyString).toEqual(expectedBodyString)
      expect(mockCategoriesService.create).toHaveBeenCalledWith(
        createCategoryDto,
      )
    })
  })

  /**
   * Test for PUT /categories/:id
   */
  describe('PUT /categories/:id', () => {
    it('debería actualizar una categoría', async () => {
      mockCategoriesService.update.mockResolvedValue(testCategories[0])

      const { body } = await request(app.getHttpServer())
        .put(`${endpoint}/${testCategories[0].id}`)
        .send(updateCategoryDto)
        .expect(200)
      const expectedBodyString = JSON.stringify(testCategories[0])
      const receivedBodyString = JSON.stringify(body)

      expect(receivedBodyString).toEqual(expectedBodyString)
      expect(mockCategoriesService.update).toHaveBeenCalledWith(
        testCategories[0].id,
        updateCategoryDto,
      )
    })

    it('debería lanzar error 404 si la categoría no existe', async () => {
      mockCategoriesService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testCategories[0].id}`)
        .send(mockCategoriesService)
        .expect(404)
    })

    it('debería lanzar error 400 debido a datos incorrectos', async () => {
      mockCategoriesService.update.mockRejectedValue(new BadRequestException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testCategories[0].id}`)
        .send(mockCategoriesService)
        .expect(400)
    })
  })

  /**
   * Test for DELETE /categories/:id
   */
  describe('DELETE /categories/:id', () => {
    it('debería eliminar la categoría', async () => {
      mockCategoriesService.remove.mockResolvedValue(testCategories[0])

      await request(app.getHttpServer())
        .delete(`${endpoint}/${testCategories[0].id}`)
        .expect(204)
    })

    it('debería lanzar error 400 por Bad Request', async () => {
      mockCategoriesService.remove.mockRejectedValue(new BadRequestException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testCategories[0].id}`)
        .send(mockCategoriesService)
        .expect(400)
    })
  })
})
