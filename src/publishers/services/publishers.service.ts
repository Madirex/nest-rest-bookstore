import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreatePublisherDto } from '../dto/create-publisher.dto'
import { UpdatePublisherDto } from '../dto/update-publisher.dto'
import { PublisherMapper } from '../mappers/publisher.mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Publisher } from '../entities/publisher.entity'
import { Repository } from 'typeorm'
import {
  NotificationType,
  WsNotification,
} from '../../websockets/notifications/notification.model'
import { ResponsePublisherDto } from '../dto/response-publisher.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Request } from 'express'
import { StorageService } from '../../storage/storage.service'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { PublishersNotificationsGateway } from '../../websockets/notifications/publishers-notification.gateway'
import { Book } from '../../books/entities/book.entity'

/**
 * Servicio de publishers
 */
@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name)

  /**
   * @description Constructor del servicio
   * @param publisherRepository repositorio de publishers
   * @param publisherMapper mapeador de publishers
   * @param storageService servicio de almacenamiento
   * @param publisherNotificationGateway publisher de notificaciones
   * @param cacheManager cache manager
   */
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly publisherMapper: PublisherMapper,
    private readonly storageService: StorageService,
    private readonly publisherNotificationGateway: PublishersNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Método que lista todos los publishers
   * @param query Consulta de paginación
   * @returns Lista de publishers paginada
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Listando todos los publishers')

    const cache = await this.cacheManager.get(
      `publishers_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Listando todos los publishers desde cache')
      return cache
    }

    const queryBuilder = this.publisherRepository
      .createQueryBuilder('publisher')
      .leftJoinAndSelect('publisher.books', 'book')

    let pagination: Paginated<Publisher>
    try {
      pagination = await paginate(query, queryBuilder, {
        sortableColumns: ['name', 'createdAt', 'updatedAt'],
        defaultSortBy: [['name', 'ASC']],
        searchableColumns: ['name'],
        filterableColumns: {
          name: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
        },
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }

    const res = {
      data: (pagination.data ?? []).map((publisher) =>
        this.publisherMapper.toDTO(publisher),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }

    await this.cacheManager.set(
      `publishers_${hash(JSON.stringify(query))}`,
      res,
      60000,
    )
    return res
  }

  /**
   * Método que busca un publisher por su id
   * @param id Identificador del publisher
   * @returns Publisher encontrado
   */
  async findOne(id: number) {
    this.logger.log(`Buscando publisher con id: ${id}`)

    const cache = await this.cacheManager.get(`publisher-${id}`)
    if (cache) {
      this.logger.log(`Buscando publisher con id: ${id} desde cache`)
      return cache
    }

    const publisher = await this.publisherRepository.findOneBy({ id })
    if (!publisher) {
      this.logger.warn(`No se encontró el publisher con id: ${id}`)
      throw new NotFoundException(`No se encontró el publisher con id: ${id}`)
    }

    const dto = this.publisherMapper.toDTO(publisher)
    await this.cacheManager.set(`publisher-${id}`, dto, 60000)
    return dto
  }

  /**
   * Método que busca un publisher por nombre
   * @param name Nombre del publisher
   * @returns Publisher encontrado
   */
  async findByName(name: string) {
    this.logger.log(`Buscando publisher con nombre: ${name}`)

    const cache = await this.cacheManager.get(`publisher-${name}`)
    if (cache) {
      this.logger.log(`Buscando publisher con nombre: ${name} desde cache`)
      return cache
    }

    const publisher = await this.publisherRepository.findOneBy({ name: name })
    if (!publisher) {
      this.logger.warn(`No se encontró el publisher con nombre: ${name}`)
      throw new NotFoundException(
        `No se encontró el publisher con nombre: ${name}`,
      )
    }
    const dto = this.publisherMapper.toDTO(publisher)
    await this.cacheManager.set(`publisher-${name}`, dto, 60000)
    return dto
  }

  /**
   * Método que crea un publisher
   * @param createPublisherDto Datos del publisher a crear
   * @returns Publishere creado
   */
  async create(createPublisherDto: CreatePublisherDto) {
    const publisher = await this.publisherRepository.findOneBy({
      name: createPublisherDto.name,
    })
    if (publisher) {
      this.logger.warn(
        `Ya existe un publisher con nombre: ${createPublisherDto.name}`,
      )
      throw new BadRequestException(
        `Ya existe un publisher con nombre: ${createPublisherDto.name}`,
      )
    }

    const publisherEntity =
      this.publisherMapper.createToEntity(createPublisherDto)

    this.logger.log(
      `Creando publisher con datos: ${JSON.stringify(publisherEntity)}`,
    )
    const publisherCreated =
      await this.publisherRepository.save(publisherEntity)
    const dto = this.publisherMapper.toDTO(publisherCreated)
    this.onChange(NotificationType.CREATE, dto)
    await this.invalidateCacheKey('publisher')
    return dto
  }

  /**
   * Método que actualiza un publisher
   * @param id Identificador del publisher
   * @param updatePublisherDto Datos del publisher a actualizar
   * @returns Publishere actualizado
   */
  async update(id: number, updatePublisherDto: UpdatePublisherDto) {
    const publisher = await this.publisherRepository.findOneBy({
      name: updatePublisherDto.name,
    })
    if (publisher) {
      this.logger.warn(
        `Ya existe un publisher con nombre: ${updatePublisherDto.name}`,
      )
      throw new BadRequestException(
        `Ya existe un publisher con nombre: ${updatePublisherDto.name}`,
      )
    }

    const publisherToUpdate = await this.publisherRepository.findOneBy({ id })
    if (!publisherToUpdate) {
      this.logger.warn(`No se encontró el publisher con id: ${id}`)
      throw new NotFoundException(`No se encontró el publisher con id: ${id}`)
    }

    const publisherEntity =
      this.publisherMapper.updateToEntity(updatePublisherDto)
    publisherEntity.id = id

    this.logger.log(`Actualizando publisher con id: ${id}`)
    const publisherUpdated =
      await this.publisherRepository.save(publisherEntity)
    const dto = this.publisherMapper.toDTO(publisherUpdated)
    this.onChange(NotificationType.UPDATE, dto)
    await this.invalidateCacheKey('publisher')
    return dto
  }

  /**
   * Método que elimina un publisher
   * @param id Identificador del publisher
   */
  async remove(id: number) {
    const publisher = await this.publisherRepository.findOneBy({ id })

    if (!publisher) {
      this.logger.warn(`No se encontró el publisher con id: ${id}`)
      throw new NotFoundException(`No se encontró el publisher con id: ${id}`)
    }

    this.logger.log(`Eliminando publisher con id: ${id}`)
    await this.publisherRepository.delete({ id })
    await this.invalidateCacheKey('publisher')
    this.onChange(
      NotificationType.DELETE,
      this.publisherMapper.toDTO(publisher),
    )
  }

  /**
   * Método que actualiza la imagen de un publisher
   * @param id Identificador del Publisher
   * @param file Fichero
   * @param req Petición
   * @param withUrl Indica si se debe generar la URL
   * @returns Publishere actualizado
   */
  async updateImage(
    id: number,
    file: Express.Multer.File,
    req: Request,
    withUrl: boolean = false,
  ) {
    this.logger.log(`Actualizando imagen del publisher con id: ${id}`)
    const publisherToUpdate = await this.publisherRepository.findOneBy({ id })
    if (!publisherToUpdate) {
      this.logger.warn(`No se encontró el publisher con id: ${id}`)
      throw new NotFoundException(`No se encontró el publisher con id: ${id}`)
    }

    if (publisherToUpdate.image !== Publisher.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${publisherToUpdate.image}`)
      let imagePath = publisherToUpdate.image
      if (withUrl) {
        imagePath = this.storageService.getFileNameWithoutUrl(
          publisherToUpdate.image,
        )
      }
      try {
        this.storageService.removeFile(imagePath)
      } catch (error) {
        this.logger.error(error)
      }
    }

    if (!file) {
      this.logger.warn(`No se encontró el archivo`)
      throw new NotFoundException(`No se encontró el archivo`)
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

    publisherToUpdate.image = filePath

    const publisherUpdated =
      await this.publisherRepository.save(publisherToUpdate)

    const dto = this.publisherMapper.toDTO(publisherUpdated)

    this.onChange(NotificationType.UPDATE, dto)

    await this.invalidateCacheKey('publisher')

    return dto
  }

  /**
   * Método que agrega un libro a un publisher
   * @param publisherId Identificador del publisher
   * @param bookId Identificador del libro
   */
  async addBookToPublisher(publisherId: number, bookId: number) {
    const publisher = await this.publisherRepository.findOneBy({
      id: publisherId,
    })
    if (!publisher) {
      throw new NotFoundException(
        `No se encontró el publisher con id: ${publisherId}`,
      )
    }
    const book = await this.bookRepository.findOneBy({ id: bookId })
    if (!book) {
      throw new NotFoundException(`No se encontró el libro con id: ${bookId}`)
    }
    console.log(book, publisher)
    publisher.books.add(book)
    await this.publisherRepository.save(publisher)
    const dto = this.publisherMapper.toDTO(publisher)
    this.onChange(NotificationType.UPDATE, dto)
    await this.invalidateCacheKey('publisher')
    return dto
  }

  /**
   * Método que elimina un libro de un publisher
   * @param publisherId Identificador del publisher
   * @param bookId Identificador del libro
   */
  async removeBookFromPublisher(publisherId: number, bookId: number) {
    const publisher = await this.publisherRepository.findOneBy({
      id: publisherId,
    })
    if (!publisher) {
      throw new NotFoundException(
        `No se encontró el publisher con id: ${publisherId}`,
      )
    }
    const book = await this.bookRepository.findOneBy({ id: bookId })
    if (!book) {
      throw new NotFoundException(`No se encontró el libro con id: ${bookId}`)
    }
    publisher.books.delete(book)
    const publisher_updated = await this.publisherRepository.save(publisher)
    const dto = this.publisherMapper.toDTO(publisher_updated)
    console.log(publisher_updated)
    this.onChange(NotificationType.UPDATE, dto)
    await this.invalidateCacheKey('publisher')
    return dto
  }

  /**
   * Método que envía una notificación a los publishers
   * @param type Tipo de notificación
   * @param data Datos de la notificación
   */
  private onChange(type: NotificationType, data: ResponsePublisherDto) {
    const notification = new WsNotification<ResponsePublisherDto>(
      'Publishers',
      type,
      data,
      new Date(),
    )
    this.publisherNotificationGateway.sendMessage(notification)
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
}
