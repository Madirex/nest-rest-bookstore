import { Test, TestingModule } from '@nestjs/testing'
import {
  Category,
  CategoryType,
} from '../../categories/entities/category.entity'
import { BookMapper } from './book.mapper'
import { CreateBookDto } from '../dto/create-book.dto'
import { Book } from '../entities/book.entity'
import { UpdateBookDto } from '../dto/update-book.dto'
import { Publisher } from '../../publishers/entities/publisher.entity'
import { ResponseBookDto } from '../dto/response-book.dto'

describe('BookMapper', () => {
  let bookMapper: BookMapper

  const publisher: Publisher = {
    id: 1,
    name: 'Publisher',
    createdAt: new Date(),
    updatedAt: new Date(),
    books: null,
    image: 'publisher-image.jpg',
    active: true,
  }

  const existingBook: Book = {
    id: 1,
    name: 'Book existente',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    price: 10.99,
    stock: 10,
    image: 'book-image.jpg',
    description: 'Book description',
    category: {
      id: 1,
      categoryType: CategoryType.SERIES,
      name: 'Series',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      books: [],
    },
    author: '',
    publisher: {
      id: 1,
      name: 'Publisher',
      createdAt: new Date(),
      updatedAt: new Date(),
      books: null,
      image: 'publisher-image.jpg',
      active: true,
    },
    shop: null,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookMapper],
    }).compile()

    bookMapper = module.get<BookMapper>(BookMapper)
  })

  it('debe de estar definido', () => {
    expect(bookMapper).toBeDefined()
  })

  describe('toEntity', () => {
    it('el mapeo de CreateBookDto a entidad Book debe de tener la imagen por defecto si no es proporcionada', () => {
      // Arrange
      const createBookDto: CreateBookDto = {
        author: '',
        publisherId: 0,
        name: 'SuperBook',
      }

      const category: Category = {
        id: 1,
        categoryType: CategoryType.SERIES,
        name: 'Series',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        books: [],
      }

      // Act
      const actualBookEntity: Book = bookMapper.toEntity(
        createBookDto,
        category,
        publisher,
      )

      // Assert
      expect(actualBookEntity.name).toEqual(createBookDto.name.trim())
      expect(actualBookEntity.category).toEqual(category)
      expect(actualBookEntity.image).toEqual(Book.IMAGE_DEFAULT)
    })

    it('Se debe de mapear CreateBookDto a entidad Book', () => {
      // Arrange
      const createBookDto: CreateBookDto = {
        name: 'SuperBook',
        image: 'book-image.jpg',
        author: '',
        publisherId: 0,
      }

      const category: Category = {
        id: 1,
        categoryType: CategoryType.SERIES,
        name: 'Series',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        books: [],
      }

      // Act
      const actualBookEntity: Book = bookMapper.toEntity(
        createBookDto,
        category,
        publisher,
      )

      // Assert
      expect(actualBookEntity.name).toEqual(createBookDto.name.trim())
      expect(actualBookEntity.category).toEqual(category)
    })
  })

  describe('mapUpdateToEntity', () => {
    it('el mapeo de las propiedades debe de ser correcto', () => {
      // Arrange
      const updateBookDto: UpdateBookDto = {
        image: 'updated-image.jpg',
        author: 'test',
        publisherId: 1,
        name: 'Book Actualizado',
      }

      // Act
      const actualBookEntity: Book = bookMapper.mapUpdateToEntity(
        updateBookDto,
        existingBook,
        null,
        null,
      )

      // Assert
      expect(actualBookEntity.name).toEqual(
        updateBookDto.name ? updateBookDto.name.trim() : existingBook.name,
      )
      expect(actualBookEntity.price).toEqual(
        updateBookDto.price || existingBook.price,
      )
      expect(actualBookEntity.image).toEqual(updateBookDto.image.trim())
      expect(actualBookEntity.category).toEqual(
        updateBookDto.category || existingBook.category,
      )
      expect(actualBookEntity.createdAt).toEqual(existingBook.createdAt)
    })

    it('el mapeo de UpdateBookDto a entidad Book se debe realizar', () => {
      // Arrange
      const updateBookDto: UpdateBookDto = {
        name: 'Book Actualizado',
        price: 15.99,
        publisherId: 1,
        author: 'test',
      }

      const category: Category = {
        id: 1,
        categoryType: CategoryType.SERIES,
        name: 'Series',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        books: [],
      }

      // Act
      const actualBookEntity: Book = bookMapper.mapUpdateToEntity(
        updateBookDto,
        existingBook,
        category,
        publisher,
      )

      // Assert
      expect(actualBookEntity.name).toEqual(updateBookDto.name.trim())
      expect(actualBookEntity.price).toEqual(updateBookDto.price)
      expect(actualBookEntity.category).toEqual(category)
    })
  })

  describe('mapEntityToResponseDto', () => {
    it('el mapeo de UpdateBookDto a entidad Book se debe realizar', () => {
      // Act
      const actualBookEntity: ResponseBookDto =
        bookMapper.mapEntityToResponseDto(existingBook)

      // Assert
      expect(actualBookEntity.name).toEqual(existingBook.name.trim())
      expect(actualBookEntity.price).toEqual(existingBook.price)
    })
  })
})
