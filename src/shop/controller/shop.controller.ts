import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param, ParseIntPipe, ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ShopsService } from '../services/shop.service'
import { CreateShopDto } from '../dto/create-shop.dto'
import { UpdateShopDto } from '../dto/update-shop.dto'
import { Paginated, PaginateQuery } from 'nestjs-paginate'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../../auth/guards/roles-auth.guard'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseBookDto } from '../../books/dto/response-book.dto'
import { ResponseShopDto } from '../dto/response-shop.dto'

/**
 * Controlador de Shops
 */
@Controller('shops')
@UseInterceptors(CacheInterceptor)
@ApiTags('Shops')
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
  @ApiResponse({
    status: 200,
    description:
      'Lista de tiendas paginada. Se puede filtrar por límite, página sortBy, filter y search',
    type: Paginated<ResponseShopDto>,
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
  async findAll(@Query() query: PaginateQuery) {
    this.logger.log('Obteniendo todas las Shops')
    return await this.shopsService.findAllShops(query)
  }

  /**
   * Obtiene una tienda por su ID
   * @param id id de la tienda
   */
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Tienda encontrada',
    type: ResponseShopDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la tienda',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Tienda no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la tienda no es válido',
  })
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
  @ApiResponse({
    status: 201,
    description: 'Tienda creada',
    type: ResponseShopDto,
  })
  @ApiBody({
    description: 'Datos de la tienda a crear',
    type: CreateShopDto,
  })
  @ApiBadRequestResponse({
    description:
      'En algunos de los campos no es válido según la especificación del DTO',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Tienda actualizada',
    type: ResponseShopDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la tienda',
    type: String,
  })
  @ApiBody({
    description: 'Datos de la tienda a actualizar',
    type: UpdateShopDto,
  })
  @ApiNotFoundResponse({
    description: 'Tienda no encontrada',
  })
  @ApiBadRequestResponse({
    description:
      'En algunos de los campos no es válido según la especificación del DTO',
  })
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
  @ApiResponse({
    status: 204,
    description: 'Tienda eliminada',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la tienda',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Tienda no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la tienda no es válido',
  })
  async remove(@Param('id') id: string) {
    this.logger.log(`Eliminando Shop con ID: ${id}`)
    return await this.shopsService.remove(id)
  }

  /**
   * Obtiene una tienda por su nombre
   * @param name nombre de la tienda
   */
  @Get('/name/:name')
  @ApiResponse({
    status: 200,
    description: 'Tienda encontrada',
    type: ResponseShopDto,
  })
  @ApiParam({
    name: 'name',
    description: 'Nombre de la tienda',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Tienda no encontrada',
  })
  async getByName(@Param('name') name: string) {
    return await this.shopsService.getByName(name)
  }

  /**
   * Obtiene todos los libros asociados a una tienda específica por su nombre
   * @param name nombre de la tienda
   */
  @Get(':name/books')
  @ApiResponse({
    status: 200,
    description: 'Lista de libros de la tienda',
    type: [ResponseBookDto],
  })
  @ApiParam({
    name: 'name',
    description: 'Nombre de la tienda',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Tienda no encontrada',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes de la tienda',
    type: [ResponseShopDto],
  })
  @ApiParam({
    name: 'name',
    description: 'Nombre de la tienda',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Tienda no encontrada',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Libro eliminado de la tienda',
  })
  @ApiParam({
    name: 'shopId',
    description: 'Identificador de la tienda',
    type: String,
  })
  @ApiParam({
    name: 'bookId',
    description: 'Identificador del libro',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Tienda o libro no encontrado',
  })
  async removeBookFromShop(
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('bookId', ParseIntPipe) bookId: number,
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
  @ApiResponse({
    status: 200,
    description: 'Cliente añadido a la tienda',
  })
  @ApiParam({
    name: 'shopId',
    description: 'Identificador de la tienda',
    type: String,
  })
  @ApiParam({
    name: 'clientId',
    description: 'Identificador del cliente',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Tienda o cliente no encontrado',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Cliente eliminado de la tienda',
  })
  @ApiParam({
    name: 'shopId',
    description: 'Identificador de la tienda',
    type: String,
  })
  @ApiParam({
    name: 'clientId',
    description: 'Identificador del cliente',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Tienda o cliente no encontrado',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Libro añadido a la tienda',
  })
  @ApiParam({
    name: 'shopId',
    description: 'Identificador de la tienda',
    type: String,
  })
  @ApiParam({
    name: 'bookId',
    description: 'Identificador del libro',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Tienda o libro no encontrado',
  })
  async addBookToShop(
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    this.logger.log(
      `Añadiendo libro con ID ${bookId} a la tienda con ID ${shopId}`,
    )
    return await this.shopsService.addBookToShop(shopId, bookId)
  }
}
