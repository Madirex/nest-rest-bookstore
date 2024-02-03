import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Order, OrderDocument } from '../schemas/order.schema'
import { PaginateModel } from 'mongoose'
import { OrdersMapper } from '../mappers/orders.mapper'
import { CreateOrderDto } from '../dto/CreateOrderDto'
import { UpdateOrderDto } from '../dto/UpdateOrderDto'
import { InjectRepository } from '@nestjs/typeorm'
import { Book } from '../../books/entities/book.entity'
import { Repository } from 'typeorm'
import { Client } from '../../client/entities/client.entity'
import { User } from '../../users/entities/user.entity'

export const OrdersOrderByValues: string[] = ['_id', 'userId']
export const OrdersOrderValues: string[] = ['asc', 'desc']

/**
 * @description The Orders Service
 */
@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name)

  /**
   * @description The Orders Service constructor
   * @param orderRepository The order repository
   * @param bookRepository The book repository
   * @param clientRepository The client repository
   * @param usersRepository The users repository
   * @param ordersMapper The orders mapper
   */
  constructor(
    @InjectModel(Order.name)
    private orderRepository: PaginateModel<OrderDocument>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly ordersMapper: OrdersMapper,
  ) {}

  /**
   * Busca todos los pedidos
   * @param page El número de página
   * @param limit El límite de resultados por página
   * @param orderBy El campo por el que ordenar
   * @param order El orden de ordenación
   */
  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.logger.log(
      `Buscando todos los pedidos con paginación y filtros: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    )

    const options = {
      page,
      limit,
      sort: {
        [orderBy]: order,
      },
      collection: 'es_ES',
    }

    return await this.orderRepository.paginate({}, options)
  }

  /**
   * Busca un pedido por su ID
   * @param id El ID del pedido
   */
  async findOne(id: string) {
    this.logger.log(`Buscando order con id: ${id}`)
    const order = await this.orderRepository.findById(id).exec()
    if (!order) {
      throw new NotFoundException(`No se encontró el order con id: ${id}`)
    }
    return order
  }

  /**
   * Busca todos los pedidos de un usuario
   * @param userId El ID del usuario
   */
  async findByUserId(userId: string) {
    this.logger.log(`Buscando order con userId: ${userId}`)
    const order = await this.orderRepository.find({ userId: userId }).exec()
    if (!order) {
      throw new NotFoundException(
        `No se encontró el order con userId: ${userId}`,
      )
    }
    return order
  }

  /**
   * Crea un nuevo pedido
   * @param createOrderDto Los datos del pedido a crear
   */
  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(
      `Creando order con datos: ${JSON.stringify(createOrderDto)}`,
    )
    const order = this.ordersMapper.toEntity(createOrderDto)

    await this.checkOrder(order)

    const orderToSave = await this.reserveStockOrders(order)

    orderToSave.createdAt = new Date()
    orderToSave.updatedAt = new Date()

    return await this.orderRepository.create(orderToSave)
  }

  /**
   * Actualiza un pedido
   * @param id El ID del pedido
   * @param updateOrderDto Los datos del pedido a actualizar
   */
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    this.logger.log(
      `Actualizando order con id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )

    const orderToUpdate = await this.orderRepository.findById(id).exec()
    if (!orderToUpdate) {
      throw new NotFoundException(`Order con id ${id} no encontrado`)
    }

    const orderToBeSaved = this.ordersMapper.toEntity(updateOrderDto)

    await this.returnStockOrders(orderToBeSaved)

    await this.checkOrder(orderToBeSaved)
    const orderToSave = await this.reserveStockOrders(orderToBeSaved)

    orderToSave.updatedAt = new Date()

    return await this.orderRepository
      .findByIdAndUpdate(id, orderToSave, { new: true })
      .exec()
  }

  /**
   * Elimina un pedido
   * @param id El ID del pedido
   */
  async remove(id: string) {
    this.logger.log(`Eliminando order con id ${id}`)

    const orderToDelete = await this.orderRepository.findById(id).exec()
    if (!orderToDelete) {
      throw new NotFoundException(`Order con id ${id} no encontrado`)
    }
    await this.returnStockOrders(orderToDelete)
    await this.orderRepository.findByIdAndDelete(id).exec()
  }

  /**
   * Comprueba si existe un usuario
   * @param userId El ID del usuario
   */
  async userExists(userId: string): Promise<boolean> {
    this.logger.log(`Comprobando si existe el usuario ${userId}`)
    const user = await this.usersRepository.findOneBy({ id: userId })
    return !!user
  }

  /**
   * Comprueba si existe un cliente
   * @param clientId El ID del cliente
   */
  async clientExists(clientId: string): Promise<boolean> {
    this.logger.log(`Comprobando si existe el cliente ${clientId}`)
    const client = await this.clientRepository.findOneBy({ id: clientId })
    return !!client
  }

  /**
   * Comprueba si un pedido es válido
   * @param order El pedido a comprobar
   * @private Método privado
   */
  private async checkOrder(order: Order): Promise<void> {
    this.logger.log(`Comprobando order ${JSON.stringify(order)}`)

    const client = await this.clientRepository.findOneBy({
      id: order.clientId,
    })
    if (!client) {
      throw new BadRequestException(
        `El cliente con id ${order.clientId} no existe`,
      )
    }

    const user = await this.usersRepository.findOneBy({
      id: order.userId,
    })

    if (!user) {
      throw new BadRequestException(
        `El usuario con id ${order.userId} no existe`,
      )
    }

    if (!order.orderLines || order.orderLines.length === 0) {
      throw new BadRequestException(
        'No se han agregado líneas de pedido al pedido actual',
      )
    }

    for (const orderLine of order.orderLines) {
      const book = await this.bookRepository.findOneBy({
        id: orderLine.productId,
      })
      if (!book) {
        throw new BadRequestException(
          `El libro con id ${orderLine.productId} no existe`,
        )
      }
      if (book.stock < orderLine.quantity && orderLine.quantity > 0) {
        throw new BadRequestException(
          `La cantidad solicitada no es válida o no hay suficiente stock del libro ${book.id}`,
        )
      }

      const bookPrice = Number(book.price).toFixed(2)
      const bookOrderLinePrice = Number(orderLine.price).toFixed(2)
      if (bookPrice !== bookOrderLinePrice) {
        throw new BadRequestException(
          `El precio del libro ${book.id} del pedido no coincide con el precio actual del producto`,
        )
      }
    }
  }

  /**
   * Reserva el stock de un pedido
   * @param order El pedido a reservar
   * @private Método privado
   */
  private async reserveStockOrders(order: Order): Promise<Order> {
    this.logger.log(`Reservando stock del order: ${order}`)

    if (!order.orderLines || order.orderLines.length === 0) {
      throw new BadRequestException(`No se han agregado líneas de pedido`)
    }

    for (const orderLine of order.orderLines) {
      const book = await this.bookRepository.findOneBy({
        id: orderLine.productId,
      })
      book.stock -= Number(orderLine.quantity)
      await this.bookRepository.save(book)
      orderLine.total = orderLine.quantity * orderLine.price
    }

    order.total = order.orderLines.reduce(
      (sum, orderLine) => sum + orderLine.quantity * orderLine.price,
      0,
    )
    order.totalItems = order.orderLines.reduce(
      (sum, orderLine) => sum + orderLine.quantity,
      0,
    )

    return order
  }

  /**
   * Devuelve el stock de un pedido
   * @param order El pedido a devolver
   * @private Método privado
   */
  private async returnStockOrders(order: Order): Promise<Order> {
    this.logger.log(`Retornando stock del pedido: ${order}`)
    if (order.orderLines) {
      for (const orderLine of order.orderLines) {
        const book = await this.bookRepository.findOneBy({
          id: orderLine.productId,
        })
        book.stock += orderLine.quantity
        await this.bookRepository.save(book)
      }
    }
    return order
  }
}
