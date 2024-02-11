import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { Roles, RolesAuthGuard } from '../../auth/guards/roles-auth.guard'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { IdValidatePipe } from '../../orders/pipes/id-validate.pipe'
import { CreateOrderDto } from '../../orders/dto/CreateOrderDto'
import { UpdateOrderDto } from '../../orders/dto/UpdateOrderDto'
import { ApiExcludeController } from '@nestjs/swagger'
import { UsersService } from '../services/users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('users')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiExcludeController()
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('findAll')
    return await this.usersService.findAll(query)
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`findOne: ${id}`)
    return await this.usersService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('create')
    return await this.usersService.create(createUserDto)
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.log(`update: ${id}`)
    return await this.usersService.update(id, updateUserDto, true)
  }

  @Get('me/profile')
  @Roles('USER')
  async getProfile(@Req() request: any) {
    return request.user
  }

  @Delete('me/profile')
  @HttpCode(204)
  @Roles('USER')
  async deleteProfile(@Req() request: any) {
    return await this.usersService.deleteById(request.user.id)
  }

  @Put('me/profile')
  @Roles('USER')
  async updateProfile(
    @Req() request: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(request.user.id, updateUserDto, false)
  }

  @Get('me/orders')
  async getPedidos(@Req() request: any) {
    return await this.usersService.getPedidos(request.user.id)
  }

  @Get('me/orders/:id')
  async getPedido(
    @Req() request: any,
    @Param('id', IdValidatePipe) id: string,
  ) {
    return await this.usersService.getPedido(request.user.id, id)
  }

  @Post('me/orders')
  @HttpCode(201)
  @Roles('USER')
  async createPedido(
    @Body() createPedidoDto: CreateOrderDto,
    @Req() request: any,
  ) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    return await this.usersService.createPedido(
      createPedidoDto,
      request.user.id,
    )
  }

  @Put('me/orders/:id')
  @Roles('USER')
  async updatePedido(
    @Param('id', IdValidatePipe) id: string,
    @Body() updatePedidoDto: UpdateOrderDto,
    @Req() request: any,
  ) {
    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(updatePedidoDto)}`,
    )
    return await this.usersService.updatePedido(
      id,
      updatePedidoDto,
      request.user.id,
    )
  }

  @Delete('me/orders/:id')
  @HttpCode(204)
  @Roles('USER')
  async removePedido(
    @Param('id', IdValidatePipe) id: string,
    @Req() request: any,
  ) {
    this.logger.log(`Eliminando pedido con id ${id}`)
    await this.usersService.removePedido(id, request.user.id)
  }
}
