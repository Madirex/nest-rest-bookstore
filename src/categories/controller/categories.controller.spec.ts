import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from '../service/categories.service'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { Category, CategoryType } from '../entities/category.entity'
import { CacheModule } from '@nestjs/cache-manager'

describe('CategoriesController', () => {
  let controller: CategoriesController
  let service: CategoriesService

  const categoriesServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: categoriesServiceMock },
      ],
    }).compile()

    controller = module.get<CategoriesController>(CategoriesController)
    service = module.get<CategoriesService>(CategoriesService)
  })

  it('debería estar definido', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('debería retornar todas las categorías', async () => {
      const testCategories: Category[] = [
        {
          id: 1,
          name: 'Category1',
          createdAt: new Date(),
          updatedAt: new Date(),
          categoryType: CategoryType.OTHER,
          isActive: true,
          books: [],
        },
      ]

      jest.spyOn(service, 'findAll').mockResolvedValue(testCategories)

      expect(await controller.findAll()).toEqual(testCategories)
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    const id = 1
    it('debería obtener una categoría por ID', async () => {
      const mockResult: Category = {
        id: id,
        name: 'Category1',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryType: CategoryType.OTHER,
        isActive: true,
        books: [],
      }

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult)
      await controller.findOne(id)

      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(mockResult).toEqual({
        id,
        name: 'Category1',
        createdAt: mockResult.createdAt,
        updatedAt: mockResult.updatedAt,
        categoryType: CategoryType.OTHER,
        isActive: true,
        books: [],
      })
    })

    it('debería lanzar NotFoundException porque la categoría no existe', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('debería crear una categoría', async () => {
      const id = 1
      const dto: CreateCategoryDto = {
        name: 'Category1',
        categoryType: CategoryType.OTHER,
      }
      const mockResult: Category = {
        id: id,
        name: 'Category1',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryType: CategoryType.OTHER,
        isActive: true,
        books: [],
      }

      jest.spyOn(service, 'create').mockResolvedValue(mockResult)
      await controller.create(dto)

      expect(service.create).toHaveBeenCalledWith(dto)
      expect(mockResult).toEqual({
        id,
        name: 'Category1',
        createdAt: mockResult.createdAt,
        updatedAt: mockResult.updatedAt,
        categoryType: CategoryType.OTHER,
        isActive: true,
        books: [],
      })
    })
  })

  describe('update', () => {
    const id = 1
    it('debería actualizar la categoría', async () => {
      const dto: UpdateCategoryDto = { name: 'UpdatedCategory' }
      const mockResult: Category = {
        id: id,
        name: 'UpdatedCategory',
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryType: CategoryType.OTHER,
        isActive: true,
        books: [],
      }

      jest.spyOn(service, 'update').mockResolvedValue(mockResult)
      await controller.update(id, dto)

      expect(service.update).toHaveBeenCalledWith(id, dto)
      expect(mockResult).toEqual({
        id,
        name: 'UpdatedCategory',
        createdAt: mockResult.createdAt,
        updatedAt: mockResult.updatedAt,
        categoryType: CategoryType.OTHER,
        isActive: true,
        books: [],
      })
    })

    it('debería lanzar NotFoundException porque la categoría no existe', async () => {
      const dto: UpdateCategoryDto = { name: 'UpdatedCategory' }
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update(id, dto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    const id = 1

    it('debería lanzar NotFoundException porque la categoría no existe', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })
})
