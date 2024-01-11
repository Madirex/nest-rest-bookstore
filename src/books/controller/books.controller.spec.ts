import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { BooksController } from './books.controller'
import { BooksService } from '../service/books.service'
import { CreateBookDto } from '../dto/create-book.dto'
import { UpdateBookDto } from '../dto/update-book.dto'
import { Request } from 'express'
import { CacheModule } from '@nestjs/cache-manager'
import { ResponseBookDto } from '../dto/response-book.dto'

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

  const id = 2
  const date = new Date()

  const mockResult: ResponseBookDto = {
    id: id,
    name: 'Book1',
    price: 100,
    stock: 10,
    author: 'test',
    publisherId: 1,
    description: 'test',
    image: 'test',
    category: 'test',
    createdAt: date,
    updatedAt: date,
    isActive: true,
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
      const testBooks: ResponseBookDto[] = [mockResult]

      jest.spyOn(service, 'findAll').mockResolvedValue(testBooks)

      expect(await controller.findAll()).toEqual(testBooks)
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('debería de recibir el Book dado el ID', async () => {
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
      })
    })

    it('debería hacer un throw NotFoundException porque el Book no existe', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('debería de crear un  Book', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockResult)
      await controller.create(createBookDto)

      expect(service.create).toHaveBeenCalledWith(createBookDto)
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
      })
    })
  })

  describe('update', () => {
    it('debería de actualizar el Book', async () => {
      const dto: UpdateBookDto = { name: 'UpdatedBook' }

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
      })
    })

    it('debería hacer throw NotFoundException porque el Book no existe', async () => {
      const dto: UpdateBookDto = { name: 'UpdatedBook' }
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update(id, dto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('debería eliminar un Book', async () => {
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
      })
    })

    it('debería lanzarse un throw NotFoundException porque el Book no existe', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateImage', () => {
    it('debería actualizar la imagen del Book', async () => {
      const mockFile = {
        originalname: 'test.png',
        mimetype: 'image/png',
      } as Express.Multer.File
      const mockReq = {} as Request
      const mockResult: ResponseBookDto = new ResponseBookDto()

      jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult)

      await controller.updateImage(id, mockFile, mockReq)
      expect(service.updateImage).toHaveBeenCalledWith(
        id,
        mockFile,
        mockReq,
        true,
      )
      expect(mockResult).toBeInstanceOf(ResponseBookDto)
    })
  })
})
