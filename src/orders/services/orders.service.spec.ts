import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { getRepositoryToken } from '@nestjs/typeorm'
import { PaginateModel } from 'mongoose'
import { Repository } from 'typeorm'
import { OrdersService } from './orders.service'
import { Order, OrderDocument } from '../schemas/order.schema'
import { OrdersMapper } from '../mappers/orders.mapper'
import { User } from '../../users/entities/user.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CategoryType } from '../../categories/entities/category.entity'
import { Book } from '../../books/entities/book.entity'
import { CreateOrderDto } from '../dto/CreateOrderDto'
import { UpdateOrderDto } from '../dto/UpdateOrderDto'
import { Client } from '../../client/entities/client.entity'

describe('OrdersService', () => {
  let ordersService: OrdersService
  let ordersModel: PaginateModel<OrderDocument>
  let ordersRepository: PaginateModel<OrderDocument>
  let booksRepository: Repository<Book>
  let usersRepository: Repository<User>
  let clientRepository: Repository<Client>

  const book = {
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
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            paginate: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Book),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Client),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        OrdersMapper,
      ],
    }).compile()

    ordersService = module.get<OrdersService>(OrdersService)
    ordersModel = module.get<PaginateModel<OrderDocument>>(
      getModelToken(Order.name),
    )
    ordersRepository = module.get<PaginateModel<OrderDocument>>(
      getModelToken(Order.name),
    )
    booksRepository = module.get<Repository<Book>>(getRepositoryToken(Book))
    clientRepository = module.get<Repository<Client>>(
      getRepositoryToken(Client),
    )
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const page = 1
      const limit = 10
      const orderBy = 'userId'
      const order = 'asc'

      const mockPaginatedResult = {
        docs: [{ _id: '1', userId: 'user1' }],
        totalDocs: 1,
        limit: limit,
        page: page,
        totalPages: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      }

      jest
        .spyOn(ordersModel, 'paginate')
        .mockResolvedValueOnce(mockPaginatedResult as any)

      const result = await ordersService.findAll(page, limit, orderBy, order)

      expect(result).toEqual(mockPaginatedResult)
      expect(ordersModel.paginate).toHaveBeenCalledTimes(1)
      expect(ordersModel.paginate).toHaveBeenCalledWith(
        {},
        {
          page,
          limit,
          sort: { [orderBy]: order },
          collection: 'es_ES',
        },
      )
    })
  })

  describe('findOne', () => {
    it('should return the order with the given ID', async () => {
      const orderId = 'some-id'
      const mockOrder = { _id: orderId /* other fields */ }

      jest.spyOn(ordersRepository, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockOrder),
      } as any)

      const result = await ordersService.findOne(orderId)

      expect(result).toEqual(mockOrder)
      expect(ordersRepository.findById).toHaveBeenCalledWith(orderId)
    })

    it('should throw NotFoundException if the order is not found', async () => {
      const orderId = 'non-existent-id'

      jest.spyOn(ordersRepository, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)

      await expect(ordersService.findOne(orderId)).rejects.toThrow(
        new NotFoundException(`No se encontró el order con id: ${orderId}`),
      )

      expect(ordersRepository.findById).toHaveBeenCalledWith(orderId)
    })
  })

  describe('findByUserId', () => {
    it('should return orders for the given user ID', async () => {
      const userId = 'some-user-id'
      const mockOrders = [{}]

      const findSpy = jest.spyOn(ordersModel, 'find') as any
      findSpy.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValueOnce(mockOrders as any),
      }))

      const result = await ordersService.findByUserId(userId)

      expect(result).toEqual(mockOrders)
      expect(findSpy).toHaveBeenCalledWith({ userId: userId })
    })
  })

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 'user-id',
        clientId: 'client-id',
        orderLines: [
          {
            productId: 1,
            price: 19.99,
            quantity: 2,
            total: 39.98,
          },
        ],
      }

      jest.spyOn(booksRepository, 'findOneBy').mockResolvedValueOnce(book)

      jest.spyOn(booksRepository, 'save').mockResolvedValueOnce(book)

      jest.spyOn(ordersRepository, 'create').mockReturnValueOnce({
        id: 'order-id',
        userId: 'user-id',
        clientId: createOrderDto.clientId,
        orderLines: [
          {
            productId: 'book-id',
            productPrice: 19.99,
            stock: 2,
            total: 39.98,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        totalItems: 2,
        total: 39.98,
        isDeleted: false,
      } as any)

      jest.spyOn(booksRepository, 'findOneBy').mockResolvedValueOnce(book)

      const result = await ordersService.create(createOrderDto)

      // Assertions
      expect(booksRepository.findOneBy).toHaveBeenCalledWith({
        id: createOrderDto.orderLines[0].productId,
      })
      expect(booksRepository.save).toHaveBeenCalled()
      expect(ordersRepository.create).toHaveBeenCalledWith(expect.anything())
      expect(result).toEqual({
        id: 'order-id',
        userId: 'user-id',
        clientId: createOrderDto.clientId,
        orderLines: [
          {
            productId: 'book-id',
            productPrice: 19.99,
            stock: 2,
            total: 39.98,
          },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        total: 39.98,
        totalItems: 2,
        isDeleted: false,
      })
    })
  })

  describe('update', () => {
    it('should fail (BadRequestException) price not equal', async () => {
      const orderId = 'order-id'
      const updateOrderDto: UpdateOrderDto = {
        userId: 'user-id',
        clientId: 'client-id',
        orderLines: [
          {
            productId: 1,
            price: 10.2,
            quantity: 2,
            total: 20.4,
          },
        ],
      }

      // Mock para simular la existencia de la orden actual
      jest.spyOn(ordersRepository, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({
          _id: orderId,
          userId: 'user-id',
          client: {
            fullName: 'Old Name',
            email: 'old@example.com',
            phone: '123456789',
            address: {
              street: '123 Old St',
              number: '456',
              city: 'Old City',
              province: 'Old Province',
              country: 'Old Country',
              postalCode: '12345',
            },
          },
          orderLines: [
            {
              productId: 'old-book-id',
              productName: 'Old Book',
              productPrice: 19.99,
              quantity: 2,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          totalItems: 2,
          total: 39.98,
          isDeleted: false,
        }),
      } as any)

      // Mock para simular la actualización de la orden
      jest.spyOn(ordersRepository, 'findByIdAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({
          _id: orderId,
          userId: 'user-id',
          client: {
            fullName: 'Updated Name',
            email: 'updated@example.com',
            phone: '987654321',
            address: {
              street: '456 Updated St',
              number: '789',
              city: 'Updated City',
              province: 'Updated Province',
              country: 'Updated Country',
              postalCode: '54321',
            },
          },
          orderLines: [
            {
              productId: 'updated-book-id',
              productName: 'Updated Book',
              productPrice: 29.99,
              quantity: 3,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          totalItems: 3,
          total: 89.97,
          isDeleted: false,
        }),
      } as any)

      jest.spyOn(booksRepository, 'findOneBy').mockResolvedValueOnce(book)

      jest.spyOn(booksRepository, 'findOneBy').mockResolvedValueOnce(book)

      // Act & Assert
      await expect(
        ordersService.update(orderId, updateOrderDto),
      ).rejects.toThrowError(BadRequestException)
    })

    it('should update an existing order', async () => {
      const orderId = 'order-id'
      const updateOrderDto: UpdateOrderDto = {
        userId: 'user-id',
        clientId: 'client-id',
        orderLines: [
          {
            productId: 1,
            price: 10.2,
            quantity: 2,
            total: 20.4,
          },
        ],
      }

      // Mock para simular la existencia de la orden actual
      jest.spyOn(ordersRepository, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({
          _id: orderId,
          userId: 'user-id',
          client: {
            fullName: 'Old Name',
            email: 'old@example.com',
            phone: '123456789',
            address: {
              street: '123 Old St',
              number: '456',
              city: 'Old City',
              province: 'Old Province',
              country: 'Old Country',
              postalCode: '12345',
            },
          },
          orderLines: [
            {
              productId: 'old-book-id',
              productName: 'Old Book',
              productPrice: 19.99,
              quantity: 2,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          totalItems: 2,
          total: 39.98,
          isDeleted: false,
        }),
      } as any)

      // Mock para simular la actualización de la orden
      jest.spyOn(ordersRepository, 'findByIdAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({
          _id: orderId,
          userId: 'user-id',
          client: {
            fullName: 'Updated Name',
            email: 'updated@example.com',
            phone: '987654321',
            address: {
              street: '456 Updated St',
              number: '789',
              city: 'Updated City',
              province: 'Updated Province',
              country: 'Updated Country',
              postalCode: '54321',
            },
          },
          orderLines: [
            {
              productId: 'updated-book-id',
              productName: 'Updated Book',
              productPrice: 19.99,
              quantity: 3,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          totalItems: 3,
          total: 89.97,
          isDeleted: false,
        }),
      } as any)

      jest.spyOn(booksRepository, 'findOneBy').mockResolvedValue(book)

      const result = await ordersService.update(orderId, updateOrderDto)

      // Assertions
      expect(ordersRepository.findById).toHaveBeenCalledWith(orderId)
      expect(ordersRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        expect.any(Object),
        { new: true },
      )
      expect(result).toEqual({
        _id: 'order-id',
        userId: 'user-id',
        client: {
          fullName: 'Updated Name',
          email: 'updated@example.com',
          phone: '987654321',
          address: {
            street: '456 Updated St',
            number: '789',
            city: 'Updated City',
            province: 'Updated Province',
            country: 'Updated Country',
            postalCode: '54321',
          },
        },
        orderLines: [
          {
            productId: 'updated-book-id',
            productName: 'Updated Book',
            productPrice: 19.99,
            quantity: 3,
          },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        totalItems: 3,
        total: 89.97,
        isDeleted: false,
      })
    })
  })

  describe('remove', () => {
    it('should throw NotFoundException if the order to remove is not found', async () => {
      const orderId = 'non-existent-id'

      jest.spyOn(ordersRepository, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any)

      await expect(ordersService.remove(orderId)).rejects.toThrow(
        new NotFoundException(`Order con id ${orderId} no encontrado`),
      )

      expect(ordersRepository.findById).toHaveBeenCalledWith(orderId)
    })
  })

  describe('userExists', () => {
    it('should return true if user exists', async () => {
      const userId = 'user-id'

      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValueOnce({
        id: userId,
        // other user fields
      } as any)

      const result = await ordersService.userExists(userId)

      expect(result).toBe(true)
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: userId })
    })

    it('should return false if user does not exist', async () => {
      const userId = 'non-existent-user-id'

      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValueOnce(null)

      const result = await ordersService.userExists(userId)

      expect(result).toBe(false)
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: userId })
    })
  })

  describe('findByUserId', () => {
    it('should return orders for the given user ID', async () => {
      const userId = 'some-user-id'
      const mockOrders = [{}, {}]

      const findSpy = jest.spyOn(ordersRepository, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockOrders as any),
      } as any)

      const result = await ordersService.findByUserId(userId)

      expect(result).toEqual(mockOrders)
      expect(findSpy).toHaveBeenCalledWith({ userId: userId })
    })
  })
})
