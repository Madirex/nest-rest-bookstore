import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from '../entities/category.entity'
import { Repository } from 'typeorm'
import { CategoriesMapper } from '../mappers/categories.mapper'
import {
  NotificationType,
  WsNotification,
} from '../../websockets/notifications/notification.model'
import { ResponseCategoryDto } from '../dto/response-category.dto'
import { CategoriesNotificationsGateway } from '../../websockets/notifications/categories-notifications.gateway'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'

/**
 * Servicio de categorías
 */
@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name)

  /**
   * Constructor
   * @param categoriesRepository Repositorio de categorías
   * @param categoriesMapper Mapper de categorías
   * @param categoriesNotificationsGateway Gateway de notificaciones de categorías
   * @param cacheManager Manejador de caché
   */
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly categoriesMapper: CategoriesMapper,
    private readonly categoriesNotificationsGateway: CategoriesNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Obtener todas las categorías
   * @param query Query de paginación
   * @returns Arreglo con todas las categorías
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Obteniendo todas las categorías')

    // check cache
    const cache = await this.cacheManager.get(
      `all_categories_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    const res = await paginate(query, this.categoriesRepository, {
      sortableColumns: ['categoryType', 'name', 'createdAt', 'updatedAt'],
      defaultSortBy: [['name', 'ASC']],
      searchableColumns: ['categoryType', 'name', 'createdAt', 'updatedAt'],
      filterableColumns: {
        name: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
        isActive: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
      },
    })

    // Se guarda en caché
    await this.cacheManager.set(
      `all_categories_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    )

    return res
  }

  /**
   * Obtener una categoría dado el ID
   * @param id Identificador de la categoría
   * @returns Categoría encontrada
   */
  async findOne(id: number) {
    this.logger.log(`Obteniendo categoría por id: ${id}`)

    // Caché
    const cache: ResponseCategoryDto = await this.cacheManager.get(
      `category_${id}`,
    )
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    const isNumeric = !isNaN(Number(id))
    if (!id || !isNumeric || id < 0 || id > 2147483647) {
      throw new BadRequestException('ID no válido')
    }
    const category = await this.categoriesRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Categoría con ID: ${id} no encontrada`)
    }

    const res = this.categoriesMapper.mapEntityToResponseDto(category)

    // Se guarda en caché
    await this.cacheManager.set(`category_${id}`, res, 60)

    return res
  }

  /**
   * Crear una categoría
   * @param createCategoryDto DTO de creación de categoría
   * @returns Categoría creada
   */
  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log(
      `Creando categoría con datos: ${JSON.stringify(createCategoryDto)}`,
    )

    if (createCategoryDto.name) {
      const category = await this.getByName(createCategoryDto.name.trim())

      if (category) {
        this.logger.log(`Categoría con nombre: ${category.name} ya existe`)
        throw new BadRequestException(
          `La categoría con el nombre ${category.name} ya existe`,
        )
      }
    }

    const category = this.categoriesMapper.toEntity(createCategoryDto)

    const categoryResponse = await this.categoriesRepository.save({
      ...category,
    })

    this.onChange(NotificationType.CREATE, categoryResponse)

    // caché
    await this.invalidateCacheKey('all_categories')

    return this.categoriesMapper.mapEntityToResponseDto(categoryResponse)
  }

  /**
   * Actualizar una categoría
   * @param id Identificador de la categoría
   * @param updateCategoryDto DTO de actualización de categoría
   * @returns Categoría actualizada
   */
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    this.logger.log(
      `Actualizando categoría ${id} con datos: ${JSON.stringify(
        updateCategoryDto,
      )}`,
    )

    const isNumeric = !isNaN(Number(id))

    if (!id || !isNumeric || id < 0 || id > 2147483647) {
      throw new BadRequestException('ID no válido')
    }

    const categoryToUpdate = await this.findOne(id)

    if (!categoryToUpdate) {
      throw new NotFoundException(`Categoría con ID: ${id} no encontrada`)
    }

    if (updateCategoryDto.name) {
      const category = await this.getByName(updateCategoryDto.name.trim())

      if (category && category.id !== id) {
        this.logger.log(`Categoría con nombre: ${category.name} ya existe`)
        throw new BadRequestException(
          `La categoría con el nombre ${category.name} ya existe`,
        )
      }
    }

    const categoryEntity = await this.categoriesRepository.findOneBy({ id })

    const category = this.categoriesMapper.mapUpdateToEntity(
      updateCategoryDto,
      categoryEntity,
    )

    const categoryResponse = await this.categoriesRepository.save({
      ...categoryToUpdate,
      ...category,
    })

    this.onChange(NotificationType.UPDATE, categoryResponse)

    // invalidar caché
    await this.invalidateCacheKey(`category_${id}`)
    await this.invalidateCacheKey('all_categories')

    return this.categoriesMapper.mapEntityToResponseDto(categoryResponse)
  }

  /**
   * Eliminar una categoría
   * @param id Identificador de la categoría
   * @returns Categoría eliminada
   */
  async remove(id: number) {
    this.logger.log(`Eliminando categoría con id: ${id}`)
    const isNumeric = !isNaN(Number(id))
    if (!id || !isNumeric || id < 0 || id > 2147483647) {
      throw new BadRequestException('ID no válido')
    }
    const categoryToRemove = await this.findOne(id)
    const category = await this.categoriesRepository.save({
      ...categoryToRemove,
      isActive: false,
    })

    this.onChange(NotificationType.DELETE, category)

    // invalidar caché
    await this.invalidateCacheKey(`category_${id}`)
    await this.invalidateCacheKey('all_categories')

    return this.categoriesMapper.mapEntityToResponseDto(category)
  }

  /**
   * Retorna una categoría dado el nombre
   * @param name Nombre de la categoría
   * @private Función privada
   * @returns Categoría encontrada
   */
  async getByName(name: string) {
    const category = await this.categoriesRepository
      .createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', {
        name: name.toLowerCase(),
      })
      .getOne()
    return this.categoriesMapper.mapEntityToResponseDto(category)
  }

  /**
   * @description Método que invalida una clave de caché
   * @param keyPattern Patrón de la clave a invalidar
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  /**
   * @description Método que envía una notificación a los clientes conectados
   * @param type Tipo de notificación
   * @param data Datos de la notificación
   * @private Método privado
   */
  private onChange(type: NotificationType, data: ResponseCategoryDto) {
    const notification = new WsNotification<ResponseCategoryDto>(
      'Categories',
      type,
      data,
      new Date(),
    )
    this.categoriesNotificationsGateway.sendMessage(notification)
  }
}
