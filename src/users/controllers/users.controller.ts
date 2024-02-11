import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { UsersService } from '../services/users.service'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { CreateUserDto } from '../dto/create-user.dto'
import { Roles, RolesAuthGuard } from '../../auth/guards/roles-auth.guard'
import { UpdateUserDto } from '../dto/update-user.dto'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { IdValidatePipe } from '../../orders/pipes/id-validate.pipe'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CreateOrderDto } from '../../orders/dto/CreateOrderDto'
import { UpdateOrderDto } from '../../orders/dto/UpdateOrderDto'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

/**
 * @description Controlador de usuarios
 */
@Controller('users')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('Users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  /**
   * @description Constructor del controlador
   * @param usersService Servicio de usuarios
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * @description Devuelve todos los usuarios
   */
  @Get()
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Usuarios encontrados',
  })
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('findAll')
    return await this.usersService.findAll(query)
  }

  /**
   * @description Devuelve un usuario por su id
   * @param id Id del usuario
   */
  @Get(':id')
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del usuario',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`findOne: ${id}`)
    return await this.usersService.findOne(id)
  }

  /**
   * @description Elimina un usuario por su id
   * @param createUserDto DTO para crear un usuario
   */
  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Usuario creado',
    type: CreateUserDto,
  })
  @ApiBody({
    description: 'Datos del usuario a crear',
    type: CreateUserDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('create')
    return await this.usersService.create(createUserDto)
  }

  /**
   * @description Elimina un usuario por su id
   * @param id Id del usuario
   * @param updateUserDto DTO para actualizar un usuario
   */
  @Put(':id')
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: UpdateUserDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del usuario',
    type: String,
  })
  @ApiBody({
    description: 'Datos del usuario a actualizar',
    type: UpdateUserDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.log(`update: ${id}`)
    return await this.usersService.update(id, updateUserDto, true)
  }

  /**
   * @description Elimina un usuario por su id
   * @param request Request
   */
  @Get('me/profile')
  @Roles('USER')
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async getProfile(@Req() request: any) {
    return request.user
  }

  /**
   * @description Elimina un usuario por su id
   * @param request Request
   */
  @Delete('me/profile')
  @HttpCode(204)
  @Roles('USER')
  @ApiResponse({
    status: 204,
    description: 'Usuario eliminado',
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async deleteProfile(@Req() request: any) {
    return await this.usersService.deleteById(request.user.id)
  }

  /**
   * @description Elimina un usuario por su id
   * @param request Request
   * @param updateUserDto DTO para actualizar un usuario
   */
  @Put('me/profile')
  @Roles('USER')
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: UpdateUserDto,
  })
  @ApiBody({
    description: 'Datos del usuario a actualizar',
    type: UpdateUserDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async updateProfile(
    @Req() request: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(request.user.id, updateUserDto, false)
  }

  /**
   * @description Devuelve todos los pedidos de un usuario
   * @param request Request
   */
  @Get('me/orders')
  @ApiResponse({
    status: 200,
    description: 'Pedidos encontrados',
  })
  @ApiNotFoundResponse({
    description: 'Pedidos no encontrados',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async getOrders(@Req() request: any) {
    return await this.usersService.getOrders(request.user.id)
  }

  /**
   * @description Devuelve un pedido de un usuario
   * @param request Request
   * @param id Id del pedido
   */
  @Get('me/orders/:id')
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
  async getOrder(@Req() request: any, @Param('id', IdValidatePipe) id: string) {
    return await this.usersService.getOrder(request.user.id, id)
  }

  /**
   * @description Crea un pedido para un usuario
   * @param createOrderDto DTO para crear un pedido
   * @param request Request
   */
  @Post('me/orders')
  @HttpCode(201)
  @Roles('USER')
  @ApiResponse({
    status: 201,
    description: 'Pedido creado',
    type: CreateOrderDto,
  })
  @ApiBody({
    description: 'Datos del pedido a crear',
    type: CreateOrderDto,
  })
  @ApiNotFoundResponse({
    description: 'Pedido no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del libro no es válido',
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: any,
  ) {
    this.logger.log(`Creando order ${JSON.stringify(createOrderDto)}`)
    return await this.usersService.createOrder(createOrderDto, request.user.id)
  }

  /**
   * @description Actualiza un pedido de un usuario
   * @param id Id del pedido
   * @param updateOrderDto DTO para actualizar un pedido
   * @param request Request
   */
  @Put('me/orders/:id')
  @Roles('USER')
  @ApiResponse({
    status: 200,
    description: 'Pedido actualizado',
    type: UpdateOrderDto,
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
  async updateOrder(
    @Param('id', IdValidatePipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() request: any,
  ) {
    this.logger.log(
      `Actualizando order con id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )
    return await this.usersService.updateOrder(
      id,
      updateOrderDto,
      request.user.id,
    )
  }

  /**
   * @description Elimina un pedido de un usuario
   * @param id Id del pedido
   * @param request Request
   */
  @Delete('me/orders/:id')
  @HttpCode(204)
  @Roles('USER')
  @ApiResponse({
    status: 204,
    description: 'Usuario eliminado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del usuario',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del usuario no es válido',
  })
  async removeOrder(
    @Param('id', IdValidatePipe) id: string,
    @Req() request: any,
  ) {
    this.logger.log(`Eliminando order con id ${id}`)
    await this.usersService.removeOrder(id, request.user.id)
  }
}
