import { Test, TestingModule } from '@nestjs/testing'
import { OrdersController } from './orders.controller'
import { OrdersService } from '../services/orders.service'
import { CacheModule } from '@nestjs/cache-manager'
import { CreateOrderDto } from '../dto/CreateOrderDto'
import { UpdateOrderDto } from '../dto/UpdateOrderDto'

describe('OrdersController', () => {
  let controller: OrdersController

  const ordersServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      imports: [CacheModule.register()],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersServiceMock,
        },
      ],
    }).compile()

    controller = module.get<OrdersController>(OrdersController)
  })

  describe('findAll', () => {
    it('should return all orders', async () => {
      // Mock
      const expectedResult = [] // Mock the expected result
      ordersServiceMock.findAll.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.findAll(1, 20, 'userId', 'asc')

      // Assert
      expect(result).toEqual(expectedResult)
      expect(ordersServiceMock.findAll).toHaveBeenCalledWith(
        1,
        20,
        'userId',
        'asc',
      )
    })
  })

  describe('findOne', () => {
    it('should return a specific order', async () => {
      // Mock
      const expectedResult = {} // Mock the expected result
      ordersServiceMock.findOne.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.findOne('orderId')

      // Assert
      expect(result).toEqual(expectedResult)
      expect(ordersServiceMock.findOne).toHaveBeenCalledWith('orderId')
    })
  })

  describe('findOrdersByUser', () => {
    it('should return orders for a specific user', async () => {
      // Mock
      const expectedResult = [] // Mock the expected result
      ordersServiceMock.findByUserId.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.findOrdersByUser('userId')

      // Assert
      expect(result).toEqual(expectedResult)
      expect(ordersServiceMock.findByUserId).toHaveBeenCalledWith('userId')
    })
  })

  describe('create', () => {
    it('should create a new order', async () => {
      // Mock
      const createOrderDto: CreateOrderDto = {
        userId: 'userId',
        clientId: 'clientId',
        orderLines: [],
      }
      const expectedResult = {}
      ordersServiceMock.create.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.create(createOrderDto)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(ordersServiceMock.create).toHaveBeenCalledWith(createOrderDto)
    })
  })

  describe('update', () => {
    it('should update an existing order', async () => {
      // Mock
      const updateOrderDto: UpdateOrderDto = {
        userId: 'userId',
        clientId: 'clientId',
        orderLines: [],
      }
      const expectedResult = {}
      ordersServiceMock.update.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.update('orderId', updateOrderDto)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(ordersServiceMock.update).toHaveBeenCalledWith(
        'orderId',
        updateOrderDto,
      )
    })
  })

  describe('remove', () => {
    it('should remove an existing order', async () => {
      // Mock
      const expectedResult = {}
      ordersServiceMock.remove.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.remove('orderId')

      // Assert
      expect(result).toEqual(undefined)
      expect(ordersServiceMock.remove).toHaveBeenCalledWith('orderId')
    })
  })
})
