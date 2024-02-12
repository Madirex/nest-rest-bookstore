import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { OrdersController } from '../../../src/orders/controllers/orders.controller'
import { OrdersService } from '../../../src/orders/services/orders.service'
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'
import { v4 as uuidv4 } from 'uuid'
import { JwtAuthGuard } from '../../../src/auth/guards/jwt-auth.guard'
import { RolesAuthGuard } from '../../../src/auth/guards/roles-auth.guard'
import { CreateOrderDto } from '../../../src/orders/dto/CreateOrderDto'
import { UpdateOrderDto } from '../../../src/orders/dto/UpdateOrderDto'

describe('OrdersController (e2e)', () => {
  let app: INestApplication

  const id = uuidv4()

  const testOrder: CreateOrderDto = {
    userId: id,
    clientId: '65a6b373127430803ad4be38',
    orderLines: [
      {
        productId: 1,
        price: 10.1,
        quantity: 3,
        total: 30.3,
      },
    ],
  }

  const updateOrder: UpdateOrderDto = {
    userId: id,
    clientId: '65a6b373127430803ad4be38',
    orderLines: [
      {
        productId: 1,
        price: 34.99,
        quantity: 5,
        total: 174.95,
      },
    ],
  }

  const mockOrdersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn(),
    updateImage: jest.fn(),
    findByUserId: jest.fn(),
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
      controllers: [OrdersController],
      providers: [
        OrdersService,
        { provide: OrdersService, useValue: mockOrdersService },
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
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /orders', () => {
    it('should return all orders', async () => {
      const { body } = await request(app.getHttpServer()).get('/orders')
      expect(body).toBeDefined()
    })
  })

  describe('GET /orders/:id', () => {
    it('should return a specific order by ID', async () => {
      const { body } = await request(app.getHttpServer()).get('/orders/1')
      expect(body).toBeDefined()
    })
  })

  describe('GET /orders/user/:userId', () => {
    it('should return orders for a specific user', async () => {
      const { body } = await request(app.getHttpServer()).get('/orders/user/1')
      expect(body).toBeDefined()
    })
  })

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/orders')
        .send(testOrder)
      expect(body).toBeDefined()
    })
  })

  describe('PUT /orders/:id', () => {
    it('should update a specific order by ID', async () => {
      const { body } = await request(app.getHttpServer())
        .put('/orders/1')
        .send(updateOrder)
      expect(body).toBeDefined()
    })
  })

  describe('DELETE /orders/:id', () => {
    it('should delete a specific order by ID', async () => {
      const orderIdToDelete = '65a6b373127430803ad4be38'
      const { status } = await request(app.getHttpServer()).delete(
        `/orders/${orderIdToDelete}`,
      )
      expect(status).toBe(204)
      expect(mockOrdersService.remove).toHaveBeenCalledWith(orderIdToDelete)
    })
  })
})
