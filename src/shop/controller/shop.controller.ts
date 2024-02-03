import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ShopsService } from '../services/shop.service'
import { CreateShopDto } from '../dto/create-shop.dto'
import { UpdateShopDto } from '../dto/update-shop.dto'
import { PaginateQuery } from 'nestjs-paginate'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../../auth/guards/roles-auth.guard'
import { ApiBearerAuth } from '@nestjs/swagger'

/**
 * Controlador de Shops
 */
@Controller('shops')
@UseInterceptors(CacheInterceptor)
export class ShopsController {
  private readonly logger = new Logger(ShopsController.name)

  /**
   * Constructor del controlador
   * @param shopsService Servicio de tiendas
   */
  constructor(private readonly shopsService: ShopsService) {}

  /**
   * Obtiene todas las tiendas
   * @param query query de paginación
   */
  @Get()
  async findAll(@Query() query: PaginateQuery) {
    this.logger.log('Obteniendo todas las Shops')
    return await this.shopsService.findAllShops(query)
  }

  /**
   * Obtiene una tienda por su ID
   * @param id id de la tienda
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const shop = await this.shopsService.findOne(id)
    if (!shop) {
      throw new NotFoundException(`Shop con ID: ${id} no encontrada`)
    }
    return shop
  }

  /**
   * Crea una nueva tienda
   * @param createShopDto datos de la tienda a crear
   */
  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async create(@Body() createShopDto: CreateShopDto) {
    this.logger.log(`Creando Shop: ${JSON.stringify(createShopDto)}`)
    return await this.shopsService.create(createShopDto)
  }

  /**
   * Actualiza una tienda por su ID
   * @param id id de la tienda
   * @param updateShopDto datos de la tienda a actualizar
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    this.logger.log(`Actualizando Shop con ID: ${id}`)
    return await this.shopsService.update(id, updateShopDto)
  }

  /**
   * Elimina una tienda por su ID
   * @param id id de la tienda
   */
  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    this.logger.log(`Eliminando Shop con ID: ${id}`)
    return await this.shopsService.remove(id)
  }

  /**
   * Obtiene una tienda por su nombre
   * @param name nombre de la tienda
   */
  @Get('/name/:name')
  async getByName(@Param('name') name: string) {
    return await this.shopsService.getByName(name)
  }

  /**
   * Obtiene todos los libros asociados a una tienda específica por su nombre
   * @param name nombre de la tienda
   */
  @Get(':name/books')
  async getBooksByShopName(@Param('name') name: string) {
    return await this.shopsService.getBooksByShopName(name)
  }

  /**
   * Obtiene todos los clientes asociados a una tienda específica por su nombre
   * @param name nombre de la tienda
   */
  @Get(':name/clients')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async getClientsByShopName(@Param('name') name: string) {
    return await this.shopsService.getClientsByShopName(name)
  }

  /**
   * Elimina un libro de la lista de libros de una tienda
   * @param shopId id de la tienda
   * @param bookId id del libro
   */
  @Delete(':shopId/books/:bookId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async removeBookFromShop(
    @Param('shopId') shopId: string,
    @Param('bookId') bookId: number,
  ) {
    this.logger.log(
      `Eliminando libro con ID ${bookId} de la tienda con ID ${shopId}`,
    )
    return await this.shopsService.removeBookFromShop(shopId, bookId)
  }

  /**
   * Añade un cliente a la lista de clientes de una tienda
   * @param shopId id de la tienda
   * @param clientId id del cliente
   */
  @Post(':shopId/clients/:clientId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async addClientToShop(
    @Param('shopId') shopId: string,
    @Param('clientId') clientId: string,
  ) {
    this.logger.log(
      `Añadiendo cliente con ID ${clientId} a la tienda con ID ${shopId}`,
    )
    return await this.shopsService.addClientToShop(shopId, clientId)
  }

  /**
   * Elimina un cliente de la lista de clientes de una tienda
   * @param shopId id de la tienda
   * @param clientId id del cliente
   */
  @Delete(':shopId/clients/:clientId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async removeClientFromShop(
    @Param('shopId') shopId: string,
    @Param('clientId') clientId: string,
  ) {
    this.logger.log(
      `Eliminando cliente con ID ${clientId} de la tienda con ID ${shopId}`,
    )
    return await this.shopsService.removeClientFromShop(shopId, clientId)
  }

  /**
   * Añade un libro a la lista de libros de una tienda
   * @param shopId id de la tienda
   * @param bookId id del libro
   */
  @Post(':shopId/books/:bookId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async addBookToShop(
    @Param('shopId') shopId: string,
    @Param('bookId') bookId: number,
  ) {
    this.logger.log(
      `Añadiendo libro con ID ${bookId} a la tienda con ID ${shopId}`,
    )
    return await this.shopsService.addBookToShop(shopId, bookId)
  }
}
