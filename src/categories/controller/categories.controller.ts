import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CategoriesService } from '../service/categories.service'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { Roles, RolesAuthGuard } from '../../auth/guards/roles-auth.guard'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseCategoryDto } from '../dto/response-category.dto'

/**
 * Controlador de categorías
 */
@Controller('categories')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiTags('Categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name)

  /**
   * Constructor
   * @param categoriesService Servicio de categorías
   */
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Obtiene todas las categorías
   * @param query Query de paginación
   * @returns Arreglo con todas las categorías
   * @example http://localhost:3000/v1/categories
   */
  @Get()
  @CacheKey('all_categories')
  @CacheTTL(30)
  @HttpCode(200)
  @Roles('USER')
  @ApiResponse({
    status: 200,
    description: 'Categorías encontradas',
    type: Paginated<ResponseCategoryDto>,
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
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Obteniendo todas las categorías')
    return await this.categoriesService.findAll(query)
  }

  /**
   * Obtiene una categoría dado su ID
   * @param id Identificador de la categoría
   * @returns Categoría encontrada
   * @example http://localhost:3000/v1/categories/1
   */
  @Get(':id')
  @HttpCode(200)
  @Roles('USER')
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: ResponseCategoryDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la categoría',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Categoría no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la categoría no es válido',
  })
  async findOne(@Param('id') id: number) {
    this.logger.log(`Obteniendo categoría por id: ${id}`)
    return await this.categoriesService.findOne(+id)
  }

  /**
   * Crear una categoría
   * @param createCategoryDto DTO de creación de categoría
   * @returns Categoría creada
   * @example http://localhost:3000/v1/categories
   */
  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Categoría creada',
    type: ResponseCategoryDto,
  })
  @ApiBody({
    description: 'Datos de la categoría a crear',
    type: CreateCategoryDto,
  })
  @ApiBadRequestResponse({
    description:
      'En algunos de los campos no es válido según la especificación del DTO',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    this.logger.log(
      `Creando categoría con datos: ${JSON.stringify(createCategoryDto)}`,
    )
    return await this.categoriesService.create(createCategoryDto)
  }

  /**
   * Actualizar una categoría
   * @param id Identificador de la categoría
   * @param updateCategoryDto DTO de actualización de categoría
   * @returns Categoría actualizada
   * @example http://localhost:3000/v1/categories/1
   */
  @Put(':id')
  @HttpCode(200)
  @Roles('ADMIN')
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada',
    type: ResponseCategoryDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la categoría',
    type: Number,
  })
  @ApiBody({
    description: 'Datos de la categoría a actualizar',
    type: UpdateCategoryDto,
  })
  @ApiBadRequestResponse({
    description: 'El id de la categoría no es válido',
  })
  @ApiNotFoundResponse({
    description: 'Categoría no encontrada',
  })
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.logger.log(
      `Actualizando categoría ${id} con datos: ${JSON.stringify(
        updateCategoryDto,
      )}`,
    )
    return await this.categoriesService.update(+id, updateCategoryDto)
  }

  /**
   * Eliminar una categoría
   * @param id Identificador de la categoría
   * @returns Categoría eliminada
   * @example http://localhost:3000/v1/categories/1
   */
  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  @ApiResponse({
    status: 204,
    description: 'Categoría eliminada',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la categoría',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Categoría no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la categoría no es válido',
  })
  async remove(@Param('id') id: number) {
    this.logger.log(`Eliminando categoría con id: ${id}`)
    return await this.categoriesService.remove(+id)
  }
}
