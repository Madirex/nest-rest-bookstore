import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Order, OrderDocument } from '../schemas/Order'
import { PaginateModel } from 'mongoose'
import { OrdersMapper } from '../mappers/orders.mapper'
import { CreateOrderDto } from '../dto/CreateOrderDto'
import { UpdateOrderDto } from '../dto/UpdateOrderDto'
import { InjectRepository } from '@nestjs/typeorm'
import { Book } from '../../books/entities/book.entity'
import { Repository } from 'typeorm'
import { Client } from '../../client/entities/client.entity'

export const OrdersOrderByValues: string[] = ['_id', 'idUsuario'] // Lo usamos en los pipes
export const OrdersOrderValues: string[] = ['asc', 'desc'] // Lo usamos en los pipes

@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name)

  constructor(
    @InjectModel(Order.name)
    private orderRepository: PaginateModel<OrderDocument>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    //@InjectRepository(User)
    //private readonly usuariosRepository: Repository<User>,
    private readonly ordersMapper: OrdersMapper,
  ) {}

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

  async findOne(id: string) {
    this.logger.log(`Buscando pedido con id: ${id}`)
    const order = await this.orderRepository.findById(id).exec()
    if (!order) {
      throw new NotFoundException(`No se encontró el pedido con id: ${id}`)
    }
    return order
  }

  async findByIdUser(idUser: number) {
    this.logger.log(`Buscando pedido con idUser: ${idUser}`)
    const order = await this.orderRepository.find({ idUser: idUser }).exec()
    if (!order) {
      throw new NotFoundException(
        `No se encontró el pedido con idUser: ${idUser}`,
      )
    }
    return order
  }

  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(
      `Creando pedido con datos: ${JSON.stringify(createOrderDto)}`,
    )
    const order = this.ordersMapper.toEntity(createOrderDto)

    await this.checkPedido(order)

    const orderToSave = await this.reserveStockPedidos(order)

    orderToSave.createdAt = new Date()
    orderToSave.updatedAt = new Date()

    return await this.orderRepository.create(orderToSave)
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )

    const pedidoToUpdate = await this.orderRepository.findById(id).exec()
    if (!pedidoToUpdate) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }

    const pedidoToBeSaved = this.ordersMapper.toEntity(updateOrderDto)

    await this.returnStockPedidos(pedidoToBeSaved)

    await this.checkPedido(pedidoToBeSaved)
    const pedidoToSave = await this.reserveStockPedidos(pedidoToBeSaved)

    pedidoToSave.updatedAt = new Date()

    return await this.orderRepository
      .findByIdAndUpdate(id, pedidoToSave, { new: true })
      .exec()
  }

  async remove(id: string) {
    this.logger.log(`Eliminando pedido con id ${id}`)

    const pedidoToDelete = await this.orderRepository.findById(id).exec()
    if (!pedidoToDelete) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    await this.returnStockPedidos(pedidoToDelete)
    await this.orderRepository.findByIdAndDelete(id).exec()
  }

  private async checkPedido(order: Order): Promise<void> {
    this.logger.log(`Comprobando pedido ${JSON.stringify(order)}`)

    const client = await this.clientRepository.findOneBy({
      id: order.idClient,
    })
    if (!client) {
      throw new BadRequestException(
        `El cliente con id ${order.idClient} no existe`,
      )
    }
    //TODO: Comprobar si el usuario existe

    if (!order.orderLines || order.orderLines.length === 0) {
      throw new BadRequestException(
        'No se han agregado lineas de pedido al pedido actual',
      )
    }

    for (const lineaPedido of order.orderLines) {
      const producto = await this.bookRepository.findOneBy({
        id: lineaPedido.idProduct,
      })
      if (!producto) {
        throw new BadRequestException(
          `El producto con id ${lineaPedido.idProduct} no existe`,
        )
      }
      if (producto.stock < lineaPedido.quantity && lineaPedido.quantity > 0) {
        throw new BadRequestException(
          `La cantidad solicitada no es válida o no hay suficiente stock del producto ${producto.id}`,
        )
      }

      const precioProducto = Number(producto.price).toFixed(2)
      const precioLineaPedido = Number(lineaPedido.price).toFixed(2)
      if (precioProducto !== precioLineaPedido) {
        throw new BadRequestException(
          `El precio del producto ${producto.id} del pedido no coincide con el precio actual del producto`,
        )
      }
    }
  }

  private async reserveStockPedidos(order: Order): Promise<Order> {
    this.logger.log(`Reservando stock del pedido: ${order}`)

    if (!order.orderLines || order.orderLines.length === 0) {
      throw new BadRequestException(`No se han agregado lineas de pedido`)
    }

    for (const lineaPedido of order.orderLines) {
      const producto = await this.bookRepository.findOneBy({
        id: lineaPedido.idProduct,
      })
      console.log(producto, lineaPedido.quantity, lineaPedido)
      producto.stock -= Number(lineaPedido.quantity)
      console.log(producto, lineaPedido)
      await this.bookRepository.save(producto)
      lineaPedido.total = lineaPedido.quantity * lineaPedido.price
    }

    order.total = order.orderLines.reduce(
      (sum, lineaPedido) => sum + lineaPedido.quantity * lineaPedido.price,
      0,
    )
    order.totalItems = order.orderLines.reduce(
      (sum, lineaPedido) => sum + lineaPedido.quantity,
      0,
    )

    return order
  }

  private async returnStockPedidos(order: Order): Promise<Order> {
    this.logger.log(`Retornando stock del pedido: ${order}`)
    if (order.orderLines) {
      for (const lineaPedido of order.orderLines) {
        const producto = await this.bookRepository.findOneBy({
          id: lineaPedido.idProduct,
        })
        producto.stock += lineaPedido.quantity
        await this.bookRepository.save(producto)
      }
    }
    return order
  }

  //TODO: Comprobar si el usuario existe
  /*async userExists(idUsuario: number): Promise<boolean> {
    this.logger.log(`Comprobando si existe el usuario ${idUsuario}`)
    const usuario = await this.usuariosRepository.findOneBy({ id: idUsuario })
    return !!usuario
  }*/

  async clientExists(idClient: string): Promise<boolean> {
    this.logger.log(`Comprobando si existe el cliente ${idClient}`)
    const client = await this.clientRepository.findOneBy({ id: idClient })
    return !!client
  }
}
