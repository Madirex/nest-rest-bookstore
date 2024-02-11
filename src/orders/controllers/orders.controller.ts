import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { OrdersService } from '../services/orders.service'
import { OrderValidatePipe } from '../pipes/order-validate.pipe'
import { OrderByValidatePipe } from '../pipes/orderby-validate.pipe'
import { IdValidatePipe } from '../pipes/id-validate.pipe'
import { UserExistsGuard } from '../guards/user-exists.guard'
import { Roles, RolesAuthGuard } from '../../auth/guards/roles-auth.guard'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { CreateOrderDto } from '../dto/CreateOrderDto'
import { UpdateOrderDto } from '../dto/UpdateOrderDto'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

/**
 * Controlador de pedidos
 */
@Controller('orders')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('Orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name)

  /**
   * Inicializa el controlador de pedidos
   * @param ordersService El servicio de pedidos
   */
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Busca todos los pedidos
   * @param page El número de página
   * @param limit El límite de pedidos por página
   * @param orderBy El campo por el que se ordenarán los pedidos
   * @param order El orden de los pedidos
   */
  @Get()
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Pedidos encontrados',
  })
  @ApiQuery({
    description: 'Filtro por límite por página',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por página',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de búsqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de búsqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number = 1,
    @Query('limit', new DefaultValuePipe(20)) limit: number = 20,
    @Query('orderBy', new DefaultValuePipe('userId'), OrderByValidatePipe)
    orderBy: string = 'userId',
    @Query('order', new DefaultValuePipe('asc'), OrderValidatePipe)
    order: string,
  ) {
    this.logger.log(`Obteniendo todos los pedidos`)
    return await this.ordersService.findAll(page, limit, orderBy, order)
  }

  /**
   * Busca un pedido por su id
   * @param id El id del pedido a buscar
   */
  @Get(':id')
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Pedido encontrado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del pedido',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Pedido no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del pedido no es válido',
  })
  async findOne(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Buscando pedido con id ${id}`)
    return await this.ordersService.findOne(id)
  }

  /**
   * Busca los pedidos de un usuario
   * @param userId El id del usuario
   */
  @Get('user/:userId')
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Pedidos encontrados',
  })
  @ApiParam({
    name: 'userId',
    description: 'Identificador del usuario',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Pedidos no encontrados',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async findOrdersByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    this.logger.log(`Buscando pedidos por user ${userId}`)
    return await this.ordersService.findByUserId(userId)
  }

  /**
   * Crea un pedido
   * @param createOrderDto Los datos del pedido a crear
   */
  @Post()
  @HttpCode(201)
  @UseGuards(UserExistsGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Pedido creado',
  })
  @ApiBody({
    description: 'Datos del pedido a crear',
    type: CreateOrderDto,
  })
  @ApiBadRequestResponse({
    description: 'El pedido no es válido',
  })
  async create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`Creando pedido ${JSON.stringify(createOrderDto)}`)
    return await this.ordersService.create(createOrderDto)
  }

  /**
   * Actualiza un pedido
   * @param id El id del pedido a actualizar
   * @param updateOrderDto Los datos a actualizar del pedido
   */
  @Put(':id')
  @UseGuards(UserExistsGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Pedido actualizado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del pedido',
    type: String,
  })
  @ApiBody({
    description: 'Datos del pedido a actualizar',
    type: UpdateOrderDto,
  })
  @ApiNotFoundResponse({
    description: 'Pedido no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del pedido no es válido',
  })
  async update(
    @Param('id', IdValidatePipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )
    return await this.ordersService.update(id, updateOrderDto)
  }

  /**
   * Elimina un pedido
   * @param id El id del pedido a eliminar
   */
  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  @ApiResponse({
    status: 204,
    description: 'Pedido eliminado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del pedido',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Pedido no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del pedido no es válido',
  })
  async remove(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Eliminando pedido con id ${id}`)
    await this.ordersService.remove(id)
  }
}
