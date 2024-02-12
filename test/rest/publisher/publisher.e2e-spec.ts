import { Test, TestingModule } from '@nestjs/testing'
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common'
import * as request from 'supertest'
import { CreatePublisherDto } from '../../../src/publishers/dto/create-publisher.dto'
import { UpdatePublisherDto } from '../../../src/publishers/dto/update-publisher.dto'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { PublishersController } from '../../../src/publishers/controllers/publishers.controller'
import { PublisherService } from '../../../src/publishers/services/publishers.service'

describe('PublishersController (e2e)', () => {
  let app: INestApplication
  let cacheManager: Cache
  const endpoint = '/publishers'

  const testPublisherId = '1'
  const testPublisher = {
    id: testPublisherId,
    name: 'Publisher1',
    description: 'Awesome Publisher',
  }

  const createPublisherDto: CreatePublisherDto = {
    name: 'Publisher1',
  }

  const updatePublisherDto: UpdatePublisherDto = { name: 'updated' }

  const mockPublishersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn(),
    updateImage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(() => []),
    },
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [PublishersController],
      providers: [
        PublisherService,
        { provide: PublisherService, useValue: mockPublishersService },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /publishers', () => {
    it('debería retornar todos los Publishers', async () => {
      mockPublishersService.findAll.mockResolvedValue([testPublisher])

      const { body } = await request(app.getHttpServer())
        .get(endpoint)
        .expect(200)

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(body).toEqual([testPublisher])
      expect(mockPublishersService.findAll).toHaveBeenCalled()
    })

    it('debería retornar el resultado caché', async () => {
      const testPublishers = [testPublisher]
      jest.spyOn(cacheManager, 'get').mockResolvedValue(testPublishers)
      const result = await mockPublishersService.findAll()
      expect(result).toEqual(testPublishers)
    })

    it('debería retornar una página de Publishers con una query', async () => {
      mockPublishersService.findAll.mockResolvedValue([testPublisher])

      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}?page=1&limit=10`)
        .expect(200)
      expect(() => {
        expect(body).toEqual([testPublisher])
        expect(mockPublishersService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /publishers/:id', () => {
    it('debería retornar el Publisher por su ID', async () => {
      mockPublishersService.findOne.mockResolvedValue(testPublisher)

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}/${testPublisherId}`)
        .expect(200)

      expect(body).toEqual(testPublisher)
    })

    it('debería retornar un error 404 si el Publisher no se encuentra', async () => {
      mockPublishersService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${endpoint}/${testPublisherId}`)
        .expect(404)
    })
  })

  describe('POST /publishers', () => {
    it('debería crear un nuevo Publisher', async () => {
      mockPublishersService.create.mockResolvedValue(testPublisher)

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const { body } = await request(app.getHttpServer())
        .post(endpoint)
        .send(createPublisherDto)
        .expect(201)

      expect(body).toEqual(testPublisher)
    })
  })

  describe('PUT /publishers/:id', () => {
    it('debería actualizar un Publisher', async () => {
      mockPublishersService.update.mockResolvedValue(testPublisher)

      const { body } = await request(app.getHttpServer())
        .put(`${endpoint}/${testPublisherId}`)
        .send(updatePublisherDto)
        .expect(200)

      expect(body).toEqual(testPublisher)
    })

    it('debería retornar un error 404 si el Publisher no existe', async () => {
      mockPublishersService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testPublisherId}`)
        .send(updatePublisherDto)
        .expect(404)
    })

    it('debería retornar un error 400 debido a datos incorrectos', async () => {
      mockPublishersService.update.mockRejectedValue(new BadRequestException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testPublisherId}`)
        .send(updatePublisherDto)
        .expect(400)
    })
  })

  describe('DELETE /publishers/:id', () => {
    it('debería eliminar el Publisher', async () => {
      mockPublishersService.remove.mockResolvedValue(testPublisher)

      await request(app.getHttpServer())
        .delete(`${endpoint}/${testPublisherId}`)
        .expect(204)
    })

    it('debería retornar un error 400 por Bad Request', async () => {
      mockPublishersService.remove.mockRejectedValue(new BadRequestException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testPublisherId}`)
        .send(updatePublisherDto)
        .expect(400)
    })
  })
})
