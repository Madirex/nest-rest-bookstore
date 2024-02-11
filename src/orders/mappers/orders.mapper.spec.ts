import { Test, TestingModule } from '@nestjs/testing'
import { OrdersMapper } from './orders.mapper'
import { v4 as uuidv4 } from 'uuid'
import { CreateOrderDto } from '../dto/CreateOrderDto'
import { Order } from '../schemas/order.schema'

describe('OrdersMapper', () => {
  let ordersMapper: OrdersMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersMapper],
    }).compile()

    ordersMapper = module.get<OrdersMapper>(OrdersMapper)
  })

  it('debería estar definido', () => {
    expect(ordersMapper).toBeDefined()
  })

  it('debería mapear CreateOrderDto a entidad OrderSchema', () => {
    const createOrderDto: CreateOrderDto = {
      userId: uuidv4(),
      clientId: uuidv4(),
      orderLines: [
        {
          productId: 2,
          price: 50.0,
          quantity: 10,
          total: 500.0,
        },
      ],
    }

    const mappedOrder: Order = ordersMapper.toEntity(createOrderDto)

    expect(mappedOrder.userId).toEqual(createOrderDto.userId)
    expect(mappedOrder.clientId).toEqual(createOrderDto.clientId)

    expect(mappedOrder.orderLines[0].productId).toEqual(
      createOrderDto.orderLines[0].productId,
    )
    expect(mappedOrder.orderLines[0].price).toEqual(
      createOrderDto.orderLines[0].price,
    )
    expect(mappedOrder.orderLines[0].quantity).toEqual(
      createOrderDto.orderLines[0].quantity,
    )
  })
})
