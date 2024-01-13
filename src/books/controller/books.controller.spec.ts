import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { BooksController } from './books.controller'
import { BooksService } from '../service/books.service'
import { CreateBookDto } from '../dto/create-book.dto'
import { UpdateBookDto } from '../dto/update-book.dto'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import { CacheModule } from '@nestjs/cache-manager'
import { ResponseBookDto } from '../dto/response-book.dto'
import { Paginated } from 'nestjs-paginate'

const id = uuidv4()

const bytesPNG: number[] = [
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
  0, 0, 1, 8, 6, 0, 0, 0, 31, 21, -60, -60, 137, 80, 78, 71, 13, 10, 26, 10, 0,
  0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, -60,
  -60,
]

const bytesJPEG: number[] = [
  255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 0, 96, 0, 0, 255, 219, 0,
  67, 0, 8, 6, 6, 7, 6, 5, 8, 7, 7, 7, 9, 9,
]

describe('BooksController', () => {
  let controller: BooksController
  let service: BooksService

  const booksServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: booksServiceMock }],
    }).compile()

    controller = module.get<BooksController>(BooksController)
    service = module.get<BooksService>(BooksService)
  })

  it('debería estar definido', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('debería retornar todos los Books', async () => {
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
      } as Paginated<ResponseBookDto>

      jest.spyOn(service, 'findAll').mockResolvedValue(testBooks)
      const result: any = await controller.findAll(paginateOptions)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.meta.totalPages).toEqual(1)
      expect(result.links.current).toEqual(
        `books?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=name:ASC`,
      )
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    const date = new Date()
    it('debería de recibir el Book dado el ID', async () => {
      const id = uuidv4()
      const mockResult: ResponseBookDto = {
        id: id,
        name: 'Book1',
        price: 100,
        stock: 10,
        image: 'test',
        category: 'test',
        createdAt: date,
        updatedAt: date,
        isActive: true,
        author: 'test',
        publisherId: 2,
        description: 'test',
      }

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult)
      await controller.findOne(id)

      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(mockResult).toEqual({
        id,
        name: 'Book1',
        price: 100,
        stock: 10,
        image: 'test',
        category: 'test',
        createdAt: date,
        updatedAt: date,
        isActive: true,
        author: 'test',
        publisherId: 2,
        description: 'test',
      })
    })

    it('debería hacer un throw NotFoundException porque el Book no existe', async () => {
      const id = uuidv4()
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    const date = new Date()
    it('debería de crear un  Book', async () => {
      const id = uuidv4()
      const dto: CreateBookDto = {
        name: 'Book1',
        author: 'test',
        publisherId: 2,
      }
      const mockResult: ResponseBookDto = {
        id: id,
        name: 'Book1',
        price: 100,
        stock: 10,
        image: 'test',
        category: 'test',
        createdAt: date,
        updatedAt: date,
        isActive: true,
        author: 'test',
        publisherId: 2,
        description: 'test',
      }

      jest.spyOn(service, 'create').mockResolvedValue(mockResult)
      await controller.create(dto)

      expect(service.create).toHaveBeenCalledWith(dto)
      expect(mockResult).toEqual({
        id: id,
        name: 'Book1',
        price: 100,
        stock: 10,
        image: 'test',
        category: 'test',
        createdAt: date,
        updatedAt: date,
        isActive: true,
        author: 'test',
        publisherId: 2,
        description: 'test',
      })
    })
  })

  describe('update', () => {
    const date = new Date()
    it('debería de actualizar el Book', async () => {
      const id = uuidv4()
      const dto: UpdateBookDto = { name: 'UpdatedBook' }
      const mockResult: ResponseBookDto = {
        id: id,
        name: 'UpdatedBook',
        price: 100,
        stock: 10,
        image: 'test',
        category: 'test',
        createdAt: date,
        updatedAt: date,
        isActive: true,
        author: 'test',
        publisherId: 2,
        description: 'test',
      }

      jest.spyOn(service, 'update').mockResolvedValue(mockResult)
      await controller.update(id, dto)

      expect(service.update).toHaveBeenCalledWith(id, dto)
      expect(mockResult).toEqual({
        id,
        name: 'UpdatedBook',
        price: 100,
        stock: 10,
        image: 'test',
        category: 'test',
        createdAt: date,
        updatedAt: date,
        isActive: true,
        author: 'test',
        publisherId: 2,
        description: 'test',
      })
    })

    it('debería hacer throw NotFoundException porque el Book no existe', async () => {
      const id = uuidv4()
      const dto: UpdateBookDto = { name: 'UpdatedBook' }
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update(id, dto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    const date = new Date()
    it('debería eliminar un Book', async () => {
      const id = uuidv4()
      const mockResult: ResponseBookDto = {
        id: id,
        name: 'Book1',
        price: 100,
        stock: 10,
        image: 'test',
        category: 'test',
        createdAt: date,
        updatedAt: date,
        isActive: true,
        author: 'test',
        publisherId: 2,
        description: 'test',
      }

      jest.spyOn(service, 'remove').mockResolvedValue(mockResult)
      await controller.remove(id)

      expect(service.remove).toHaveBeenCalledWith(id)
      expect(mockResult).toEqual({
        id,
        name: 'Book1',
        price: 100,
        stock: 10,
        image: 'test',
        category: 'test',
        createdAt: date,
        updatedAt: date,
        isActive: true,
        author: 'test',
        publisherId: 2,
        description: 'test',
      })
    })

    it('debería lanzarse un throw NotFoundException porque el Book no existe', async () => {
      const id = 1
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateImage', () => {
    it('debería dar error porque la imagen es un png falso', async () => {
      const mockId = uuidv4()
      const mockFile = {
        originalname: 'test.png',
        mimetype: 'image/png',
      } as Express.Multer.File
      const mockReq = {} as Request
      const mockResult: ResponseBookDto = new ResponseBookDto()

      jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult)

      await expect(
        controller.updateImage(mockId, mockFile, mockReq),
      ).rejects.toThrow(BadRequestException)
    })

    it('debería lanzar BadRequestException si el archivo es undefined', async () => {
      const req = { params: { id } } as any

      await expect(controller.updateImage(id, undefined, req)).rejects.toThrow(
        BadRequestException,
      )

      expect(service.updateImage).not.toHaveBeenCalled()
    })

    it('debería lanzar BadRequestException por tipo de archivo no soportado', async () => {
      const req = { params: { id } } as any
      const file = {
        originalname: 'test.txt', // Example of an unsupported file type
        mimetype: 'text/plain',
      } as Express.Multer.File

      jest.mock('../../util/util', () => ({
        Util: {
          detectFileType: jest.fn(() => false),
          getCurrentDateTimeString: jest.fn(() => 'some-date-time'),
        },
      }))

      await expect(controller.updateImage(id, file, req)).rejects.toThrow(
        BadRequestException,
      )

      expect(service.updateImage).not.toHaveBeenCalled()
    })

    it('se debe llamar al servicio updateImage y dar como tipo de imagen no válido', async () => {
      const req = { params: { id } } as any

      const pngBytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
      const file = {
        originalname: 'test.png',
        mimetype: 'image/exe',
        buffer: pngBytes,
      } as unknown as Express.Multer.File

      await expect(controller.updateImage(id, file, req)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
