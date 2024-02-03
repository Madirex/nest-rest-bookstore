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
import { ApiExcludeController } from '@nestjs/swagger'
import { CreateOrderDto } from '../../orders/dto/CreateOrderDto'
import { UpdateOrderDto } from '../../orders/dto/UpdateOrderDto'

/**
 * @description Controlador de usuarios
 */
@Controller('users')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiExcludeController()
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
  async findAll() {
    this.logger.log('findAll')
    return await this.usersService.findAll()
  }

  /**
   * @description Devuelve un usuario por su id
   * @param id Id del usuario
   */
  @Get(':id')
  @Roles('ADMIN')
  async findOne(id: string) {
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
  async getOrders(@Req() request: any) {
    return await this.usersService.getOrders(request.user.id)
  }

  /**
   * @description Devuelve un pedido de un usuario
   * @param request Request
   * @param id Id del pedido
   */
  @Get('me/orders/:id')
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
  async removeOrder(
    @Param('id', IdValidatePipe) id: string,
    @Req() request: any,
  ) {
    this.logger.log(`Eliminando order con id ${id}`)
    await this.usersService.removeOrder(id, request.user.id)
  }
}
