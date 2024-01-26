import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  Logger,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ShopsService } from '../services/shop.service';
import { CreateShopDto } from '../dto/create-shop.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';
import { PaginateQuery } from 'nestjs-paginate';

@Controller('shops')
export class ShopsController {
  private readonly logger = new Logger(ShopsController.name);

  constructor(private readonly shopsService: ShopsService) {}

  /* Obtiene todas las tiendas con opciones de paginación y filtrado */
  @Get()
  async findAll(@Query() query: PaginateQuery) {
    this.logger.log('Obteniendo todas las Shops');
    return await this.shopsService.findAllShops(query);
  }

  /* Obtiene una tienda específica por su ID */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const shop = await this.shopsService.findOne(id);
    if (!shop) {
      throw new NotFoundException(`Shop con ID: ${id} no encontrada`);
    }
    return shop;
  }

  /* Crea una nueva tienda basada en los datos proporcionados */
  @Post()
  @HttpCode(201)
  async create(@Body() createShopDto: CreateShopDto) {
    this.logger.log(`Creando Shop: ${JSON.stringify(createShopDto)}`);
    return await this.shopsService.create(createShopDto);
  }

  /* Actualiza los datos de una tienda existente */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    this.logger.log(`Actualizando Shop con ID: ${id}`);
    return await this.shopsService.update(id, updateShopDto);
  }

  /* Elimina una tienda por su ID */
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    this.logger.log(`Eliminando Shop con ID: ${id}`);
    return await this.shopsService.remove(id);
  }

  /* Busca una tienda por su nombre */
  @Get('/name/:name')
  async getByName(@Param('name') name: string) {
    return await this.shopsService.getByName(name);
  }

  /* Obtiene todos los libros asociados a una tienda específica por su nombre */
  @Get(':name/books')
  async getBooksByShopName(@Param('name') name: string) {
    return await this.shopsService.getBooksByShopName(name);
  }

  /* Obtiene todos los clientes asociados a una tienda específica por su nombre */
  @Get(':name/clients')
  async getClientsByShopName(@Param('name') name: string) {
    return await this.shopsService.getClientsByShopName(name);
  }

  /* Elimina un libro de la colección de una tienda */
  @Delete(':shopId/books/:bookId')
  @HttpCode(200)
  async removeBookFromShop(@Param('shopId') shopId: string, @Param('bookId') bookId: number) {
    this.logger.log(`Eliminando libro con ID ${bookId} de la tienda con ID ${shopId}`);
    return await this.shopsService.removeBookFromShop(shopId, bookId);
  }

  /* Añade un cliente a la lista de clientes de una tienda */
  @Post(':shopId/clients/:clientId')
  @HttpCode(200)
  async addClientToShop(@Param('shopId') shopId: string, @Param('clientId') clientId: string) {
    this.logger.log(`Añadiendo cliente con ID ${clientId} a la tienda con ID ${shopId}`);
    return await this.shopsService.addClientToShop(shopId, clientId);
  }

  /* Elimina un cliente de la lista de clientes de una tienda */
  @Delete(':shopId/clients/:clientId')
  @HttpCode(200)
  async removeClientFromShop(@Param('shopId') shopId: string, @Param('clientId') clientId: string) {
    this.logger.log(`Eliminando cliente con ID ${clientId} de la tienda con ID ${shopId}`);
    return await this.shopsService.removeClientFromShop(shopId, clientId);
  }

  /* Añade un libro a la colección de una tienda */
  @Post(':shopId/books/:bookId')
  @HttpCode(200)
  async addBookToShop(@Param('shopId') shopId: string, @Param('bookId') bookId: number) {
    this.logger.log(`Añadiendo libro con ID ${bookId} a la tienda con ID ${shopId}`);
    return await this.shopsService.addBookToShop(shopId, bookId);
  }
}
