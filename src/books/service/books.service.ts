import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { CreateBookDto } from '../dto/create-book.dto'
import { UpdateBookDto } from '../dto/update-book.dto'
import { BookMapper } from '../mappers/book.mapper'
import { Book } from '../entities/book.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from '../../categories/entities/category.entity'
import { Repository } from 'typeorm'
import { StorageService } from '../../storage/storage.service'
import { Request } from 'express'
import { BooksNotificationsGateway } from '../../websockets/notifications/books-notifications.gateway'
import {
  NotificationType,
  WsNotification,
} from '../../websockets/notifications/notification.model'
import { ResponseBookDto } from '../dto/response-book.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'

/**
 * Servicio de Books
 */
@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name)

  /**
   * Constructor
   * @param bookRepository Repositorio de Books
   * @param categoryRepository Repositorio de categorías
   * @param bookMapper Mapper de Books
   * @param storageService Servicio de Storage
   * @param booksNotificationsGateway Gateway de notificaciones de Books
   * @param cacheManager Gestor de caché
   */
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly bookMapper: BookMapper,
    private readonly storageService: StorageService,
    private readonly booksNotificationsGateway: BooksNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Obtiene todos los Books
   * @param query Query de paginación
   * @returns Arreglo con todos los Books
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Obteniendo todos los Books')

    // check cache
    const cache = await this.cacheManager.get(
      `all_books_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')

    let pagination: Paginated<Book>
    try {
      pagination = await paginate(query, queryBuilder, {
        sortableColumns: ['name', 'category', 'price', 'stock'],
        defaultSortBy: [['name', 'ASC']],
        searchableColumns: ['name', 'category', 'price', 'stock'],
        filterableColumns: {
          name: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
          category: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
          price: true,
          stock: true,
          isActive: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
        },
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }

    const res = {
      data: (pagination.data ?? []).map((book) =>
        this.bookMapper.mapEntityToResponseDto(book),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }

    // Guardamos en caché
    await this.cacheManager.set(
      `all_books_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    )
    return res
  }

  /**
   * Obtiene un Book dado el ID
   * @param id Identificador del Book
   * @returns Book encontrado
   */
  async findOne(@Param('id') id: number): Promise<ResponseBookDto> {
    this.logger.log(`Obteniendo Book por id: ${id}`)

    // Caché
    const cache: ResponseBookDto = await this.cacheManager.get(`book_${id}`)
    if (cache) {
      console.log('Cache hit')
      this.logger.log('Cache hit')
      return cache
    }

    const isNumeric = !isNaN(Number(id))
    if (!id || !isNumeric) {
      throw new BadRequestException('ID no válido')
    }
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    })

    if (!book) {
      throw new NotFoundException(`Book con ID: ${id} no encontrado`)
    }

    const res = this.bookMapper.mapEntityToResponseDto(book)

    // Se guarda en caché
    await this.cacheManager.set(`book_${id}`, res, 60)

    return res
  }

  /**
   * Crea un Book
   * @param createBookDto DTO de creación de Book
   * @returns Book creado
   */
  async create(createBookDto: CreateBookDto): Promise<ResponseBookDto> {
    this.logger.log(`Creando Book con datos: ${JSON.stringify(createBookDto)}`)
    if (createBookDto.name) {
      const book = await this.getByName(createBookDto.name.trim())

      if (book) {
        this.logger.log(`Book con nombre: ${book.name} ya existe`)
        throw new BadRequestException(
          `El Book con el nombre ${book.name} ya existe`,
        )
      }
    }

    let category = null
    if (createBookDto.category) {
      category = await this.getCategoryByName(createBookDto.category)
    }
    const book = this.bookMapper.toEntity(createBookDto, category)
    if (book.category == null) {
      delete book.category
    }

    const dto = this.bookMapper.mapEntityToResponseDto(book)
    this.onChange(NotificationType.CREATE, dto)

    book.publisher = 'no implementado todavía' //TODO: implementar relación con publisher

    const res = await this.bookRepository.save({
      ...book,
    })

    // caché
    await this.invalidateCacheKey('all_books')

    return this.bookMapper.mapEntityToResponseDto(res)
  }

  /**
   * Actualiza un Book
   * @param id Identificador del Book
   * @param updateBookDto DTO de actualización de Book
   * @returns Book actualizado
   */
  async update(
    @Param('id') id: number,
    updateBookDto: UpdateBookDto,
  ): Promise<
    {
      id: number
      name: string
      author: string
      publisherId: number
      category: string
      image: string
      description: string
      price: number
      stock: number
      createdAt: Date
      updatedAt: Date
      isActive: boolean
    } & ResponseBookDto
  > {
    this.logger.log(
      `Actualizando Book con datos: ${JSON.stringify(updateBookDto)}`,
    )

    const isNumeric = !isNaN(Number(id))

    if (!id || !isNumeric) {
      throw new BadRequestException('ID no válido')
    }

    await this.findOne(id)
    const bookToUpdate = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    })

    if (!bookToUpdate) {
      throw new NotFoundException(`Book con ID: ${id} no encontrado`)
    }

    if (updateBookDto.name) {
      const book = await this.getByName(updateBookDto.name.trim())

      if (book && book.id !== id) {
        this.logger.log(`Book con nombre: ${book.name} ya existe`)
        throw new BadRequestException(
          `El Book con el nombre ${book.name} ya existe`,
        )
      }
    }

    let category = null

    if (updateBookDto.category) {
      category = await this.getCategoryByName(updateBookDto.category)
    }

    const book = this.bookMapper.mapUpdateToEntity(
      updateBookDto,
      bookToUpdate,
      category,
    )

    if (bookToUpdate.category != null) {
      delete bookToUpdate.category
    }

    if (book.category != null) {
      delete book.category
    }

    const dto = this.bookMapper.mapEntityToResponseDto(book)

    this.onChange(NotificationType.UPDATE, dto)

    const res = await this.bookRepository.save({
      ...bookToUpdate,
      ...book,
    })

    // invalidar caché
    await this.invalidateCacheKey(`book_${id}`)
    await this.invalidateCacheKey('all_books')

    return this.bookMapper.mapEntityToResponseDto(res)
  }

  /**
   * Elimina un Book
   * @param id Identificador del Book
   * @returns Book eliminado
   */
  async remove(@Param('id') id: number): Promise<ResponseBookDto> {
    this.logger.log(`Eliminando Book con id: ${id}`)
    const isNumeric = !isNaN(Number(id))
    if (!id || !isNumeric) {
      throw new BadRequestException('ID no válido')
    }
    await this.findOne(id)
    const bookToRemove = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    })

    const dto = this.bookMapper.mapEntityToResponseDto(bookToRemove)

    this.onChange(NotificationType.DELETE, dto)

    const res = await this.bookRepository.save({
      ...bookToRemove,
      isActive: false,
    })

    // invalidar caché
    await this.invalidateCacheKey(`book_${id}`)
    await this.invalidateCacheKey('all_books')

    return this.bookMapper.mapEntityToResponseDto(res)
  }

  /**
   * Retorna un Book dado el nombre
   * @param name Nombre del Book
   * @private Función privada
   * @returns Book encontrado
   */
  async getByName(name: string) {
    const bookOp = await this.bookRepository
      .createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', {
        name: name.toLowerCase(),
      })
      .getOne()
    return this.bookMapper.mapEntityToResponseDto(bookOp)
  }

  /**
   * Retorna una categoría dado el nombre
   * @param name Nombre de la categoría
   * @private Función privada
   * @returns Categoría encontrada
   */
  async getCategoryByName(name: string) {
    return await this.categoryRepository
      .createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', {
        name: name.toLowerCase(),
      })
      .getOne()
  }

  /**
   * Actualiza la imagen de un Book
   * @param id Identificador del Book
   * @param file Fichero
   * @param req Petición
   * @param withUrl Indica si se debe generar la URL
   */
  public async updateImage(
    id: number,
    file: Express.Multer.File,
    req: Request,
    withUrl: boolean = false,
  ) {
    this.logger.log(`Actualizando imagen Book por id: ${id}`)
    await this.findOne(id)
    const bookToUpdate = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    })

    if (bookToUpdate.image !== Book.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${bookToUpdate.image}`)
      let imagePath = bookToUpdate.image
      if (withUrl) {
        imagePath = this.storageService.getFileNameWithoutUrl(
          bookToUpdate.image,
        )
      }
      try {
        this.storageService.removeFile(imagePath)
      } catch (error) {
        this.logger.error(error)
      }
    }

    if (!file) {
      throw new BadRequestException('Fichero no encontrado.')
    }

    let filePath: string

    if (withUrl) {
      this.logger.log(`Generando url para ${file.filename}`)
      const apiVersion = process.env.API_VERSION
        ? `/${process.env.API_VERSION}`
        : '/v1'
      filePath = `${req.protocol}://${req.get('host')}${apiVersion}/storage/${
        file.filename
      }`
    } else {
      filePath = file.filename
    }

    bookToUpdate.image = filePath

    const dto = this.bookMapper.mapEntityToResponseDto(bookToUpdate)

    this.onChange(NotificationType.UPDATE, dto)

    const res = await this.bookRepository.save(bookToUpdate)

    // invalidar caché
    await this.invalidateCacheKey(`book_${id}`)
    await this.invalidateCacheKey('all_books')

    return this.bookMapper.mapEntityToResponseDto(res)
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
  private onChange(type: NotificationType, data: ResponseBookDto) {
    const notification = new WsNotification<ResponseBookDto>(
      'Books',
      type,
      data,
      new Date(),
    )
    this.booksNotificationsGateway.sendMessage(notification)
  }
}
