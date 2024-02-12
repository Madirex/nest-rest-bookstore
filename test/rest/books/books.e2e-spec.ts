import { Test, TestingModule } from '@nestjs/testing'
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common'
import * as request from 'supertest'
import { CreateBookDto } from '../../../src/books/dto/create-book.dto'
import { UpdateBookDto } from '../../../src/books/dto/update-book.dto'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { JwtAuthGuard } from '../../../src/auth/guards/jwt-auth.guard'
import { RolesAuthGuard } from '../../../src/auth/guards/roles-auth.guard'
import { BooksController } from '../../../src/books/controller/books.controller'
import { BooksService } from '../../../src/books/service/books.service'

describe('BooksController (e2e)', () => {
  let app: INestApplication
  let cacheManager: Cache
  const endpoint = '/books'

  const testBookId = '1'
  const testBook = {
    id: testBookId,
    name: 'Book1',
    description: 'Awesome Book',
  }
  const testBooks = [
    {
      id: testBookId,
      name: 'Book1',
      description: 'Awesome Book',
    },
  ]

  const createBookDto: CreateBookDto = {
    name: 'Book1',
    author: 'Author1',
    publisherId: 1,
  }

  const updateBookDto: UpdateBookDto = { author: '', name: '', publisherId: 0 }

  const mockBooksService = {
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
      controllers: [BooksController],
      providers: [
        BooksService,
        { provide: BooksService, useValue: mockBooksService },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesAuthGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /books', () => {
    it('debería retornar todos los Books', async () => {
      mockBooksService.findAll.mockResolvedValue(testBooks)

      const options = { page: 1, limit: 1 }
      const { body } = await request(app.getHttpServer())
        .get(endpoint)
        .query(options)
        .expect(200)

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(body).toEqual(testBooks)
      expect(body).toHaveLength(options.limit)
      expect(mockBooksService.findAll).toHaveBeenCalled()
    })

    it('debería retornar el resultado caché', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(testBooks)
      const result = await mockBooksService.findAll()
      expect(result).toEqual(testBooks)
    })

    it('debería retornar una página de Books con una query', async () => {
      mockBooksService.findAll.mockResolvedValue([testBook])

      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}?page=1&limit=10`)
        .expect(200)
      expect(() => {
        expect(body).toEqual([testBook])
        expect(mockBooksService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /books/:id', () => {
    it('debería retornar el Book por su ID', async () => {
      mockBooksService.findOne.mockResolvedValue(testBook)

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}/${testBookId}`)
        .expect(200)

      expect(body).toEqual(testBook)
      expect(mockBooksService.findOne).toHaveBeenCalledWith(testBookId)
    })

    it('debería retornar un error 404 si el Book no se encuentra', async () => {
      mockBooksService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${endpoint}/${testBookId}`)
        .expect(404)
    })
  })

  describe('POST /books', () => {
    it('debería crear un nuevo Book', async () => {
      mockBooksService.create.mockResolvedValue(testBook)

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const { body } = await request(app.getHttpServer())
        .post(endpoint)
        .send(createBookDto)
        .expect(201)

      expect(body).toEqual(testBook)
      expect(mockBooksService.create).toHaveBeenCalledWith(createBookDto)
    })
  })

  describe('PUT /books/:id', () => {
    it('debería actualizar un Book', async () => {
      mockBooksService.update.mockResolvedValue(testBook)

      const { body } = await request(app.getHttpServer())
        .put(`${endpoint}/${testBookId}`)
        .send(updateBookDto)
        .expect(200)

      expect(body).toEqual(testBook)
      expect(mockBooksService.update).toHaveBeenCalledWith(
        testBookId,
        updateBookDto,
      )
    })

    it('debería retornar un error 404 si el Book no existe', async () => {
      mockBooksService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testBookId}`)
        .send(updateBookDto)
        .expect(404)
    })

    it('debería retornar un error 400 debido a datos incorrectos', async () => {
      mockBooksService.update.mockRejectedValue(new BadRequestException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testBookId}`)
        .send(updateBookDto)
        .expect(400)
    })
  })

  describe('DELETE /books/:id', () => {
    it('debería eliminar el Book', async () => {
      mockBooksService.remove.mockResolvedValue(testBook)

      await request(app.getHttpServer())
        .delete(`${endpoint}/${testBookId}`)
        .expect(204)
    })

    it('debería retornar un error 400 por Bad Request', async () => {
      mockBooksService.remove.mockRejectedValue(new BadRequestException())
      await request(app.getHttpServer())
        .put(`${endpoint}/${testBookId}`)
        .send(updateBookDto)
        .expect(400)
    })
  })

  describe('PATCH /books/image/:id', () => {
    it('debería dar error porque la imagen es un jpg falso', async () => {
      const file = Buffer.from('file')

      mockBooksService.exists.mockResolvedValue(true)
      mockBooksService.updateImage.mockResolvedValue(testBook)

      await request(app.getHttpServer())
        .patch(`${endpoint}/image/${testBook.id}`)
        .attach('file', file, 'image.jpg')
        .set('Content-Type', 'multipart/form-data')
        .expect(400)
    })
  })
})
