import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesMapper } from './categories.mapper'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { Category, CategoryType } from '../entities/category.entity'

describe('CategoriesMapper', () => {
  let categoriesMapper: CategoriesMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesMapper],
    }).compile()

    categoriesMapper = module.get<CategoriesMapper>(CategoriesMapper)
  })

  it('debe de estar definido', () => {
    expect(categoriesMapper).toBeDefined()
  })

  describe('toEntity', () => {
    it('se debe de mapear CreateCategoryDto a la entidad Category', () => {
      // Arrange
      const createCategoryDto: CreateCategoryDto = {
        name: 'Category Name',
        categoryType: CategoryType.SERIES,
      }

      // Act
      const actualCategoryEntity: Category =
        categoriesMapper.toEntity(createCategoryDto)

      // Assert
      expect(actualCategoryEntity.name).toEqual(createCategoryDto.name.trim())
      expect(actualCategoryEntity.categoryType).toEqual(
        createCategoryDto.categoryType,
      )
    })
  })

  describe('mapUpdateToEntity', () => {
    it('se debe de mapear UpdateCategoryDto a entidad Category con las propiedades correctas', () => {
      // Arrange
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Category actualizada',
        categoryType: CategoryType.MOVIE,
      }

      const existingCategory: Category = {
        id: 1,
        categoryType: CategoryType.SERIES,
        name: 'Category existente',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        books: [],
      }

      // Act
      const actualCategoryEntity: Category = categoriesMapper.mapUpdateToEntity(
        updateCategoryDto,
        existingCategory,
      )

      // Assert
      expect(actualCategoryEntity.name).toEqual(
        updateCategoryDto.name.trim() || existingCategory.name,
      )
      expect(actualCategoryEntity.categoryType).toEqual(
        updateCategoryDto.categoryType || existingCategory.categoryType,
      )
      expect(actualCategoryEntity.createdAt).toEqual(existingCategory.createdAt)
    })

    it('se debe de mapear UpdateCategoryDto a entidad Category con valores existentes del DTO', () => {
      // Arrange
      const updateCategoryDto: UpdateCategoryDto = {}

      const existingCategory: Category = {
        id: 1,
        categoryType: CategoryType.SERIES,
        name: 'Category existente',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        books: [],
      }

      // Act
      const actualCategoryEntity: Category = categoriesMapper.mapUpdateToEntity(
        updateCategoryDto,
        existingCategory,
      )

      // Assert
      expect(actualCategoryEntity.categoryType).toEqual(
        existingCategory.categoryType,
      )
      expect(actualCategoryEntity.name).toEqual(existingCategory.name)
    })
  })
})
