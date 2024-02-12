import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateClientDto } from '../dto/create-client.dto'
import { UpdateClientDto } from '../dto/update-client.dto'
import { ClientMapper } from '../mappers/client.mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Client } from '../entities/client.entity'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import {
  NotificationType,
  WsNotification,
} from '../../websockets/notifications/notification.model'
import { ClientNotificationsGateway } from '../../websockets/notifications/client-notifications.gateway'
import { ResponseClientDto } from '../dto/response-client.dto'
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
import { OrdersService } from '../../orders/services/orders.service'

/**
 * Servicio de clientes
 */
@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name)

  /**
   * @description Constructor del servicio
   * @param clientRepository repositorio de clientes
   * @param clientMapper mapeador de clientes
   * @param storageService servicio de almacenamiento
   * @param ordersService servicio de pedidos
   * @param clientNotificationGateway cliente de notificaciones
   * @param cacheManager cache manager
   */
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly clientMapper: ClientMapper,
    private readonly storageService: StorageService,
    private readonly ordersService: OrdersService,
    private readonly clientNotificationGateway: ClientNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Método que lista todos los clientes
   * @param query Consulta de paginación
   * @returns Lista de clientes paginada
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Listando todos los clientes')

    const cache = await this.cacheManager.get(
      `clients_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Listando todos los clientes desde cache')
      return cache
    }

    let pagination: Paginated<Client>
    try {
      pagination = await paginate(query, this.clientRepository, {
        sortableColumns: ['name', 'surname', 'email', 'createdAt', 'updatedAt'],
        defaultSortBy: [['name', 'ASC']],
        searchableColumns: [
          'name',
          'surname',
          'email',
          'phone',
          'address.(city)',
        ],
        filterableColumns: {
          name: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
          surname: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
          email: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
          phone: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
        },
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }

    const res = {
      ...pagination,
      data: (pagination.data ?? []).map((client) =>
          this.clientMapper.toDTO(client),
      ),
    }

    console.log('res', res)
    await this.cacheManager.set(
      `clients_${hash(JSON.stringify(query))}`,
      res,
      60000,
    )
    return res
  }

  /**
   * Método que busca un cliente por su id
   * @param id Identificador del cliente
   * @returns Cliente encontrado
   */
  async findOne(id: string) {
    this.logger.log(`Buscando cliente con id: ${id}`)

    const cache = await this.cacheManager.get(`client-${id}`)
    if (cache) {
      this.logger.log(`Buscando cliente con id: ${id} desde cache`)
      return cache
    }

    const client = await this.clientRepository.findOneBy({ id })
    if (!client) {
      this.logger.warn(`No se encontró el cliente con id: ${id}`)
      throw new NotFoundException(`No se encontró el cliente con id: ${id}`)
    }

    const dto = this.clientMapper.toDTO(client)
    await this.cacheManager.set(`client-${id}`, dto, 60000)
    return dto
  }

  /**
   * Método que busca un cliente por email
   * @param email Email del cliente
   * @returns Cliente encontrado
   */
  async findByEmail(email: string) {
    this.logger.log(`Buscando cliente con email: ${email}`)

    const cache = await this.cacheManager.get(`client-${email}`)
    if (cache) {
      this.logger.log(`Buscando cliente con email: ${email} desde cache`)
      return cache
    }

    const client = await this.clientRepository.findOneBy({ email })
    if (!client) {
      this.logger.warn(`No se encontró el cliente con email: ${email}`)
      throw new NotFoundException(
        `No se encontró el cliente con email: ${email}`,
      )
    }
    const dto = this.clientMapper.toDTO(client)
    await this.cacheManager.set(`client-${email}`, dto, 60000)
    return dto
  }

  /**
   * Método que crea un cliente
   * @param createClientDto Datos del cliente a crear
   * @returns Cliente creado
   */
  async create(createClientDto: CreateClientDto) {
    const client = await this.clientRepository.findOneBy({
      email: createClientDto.email,
    })
    if (client) {
      this.logger.warn(
        `Ya existe un cliente con email: ${createClientDto.email}`,
      )
      throw new BadRequestException(
        `Ya existe un cliente con email: ${createClientDto.email}`,
      )
    }

    const clientEntity = this.clientMapper.createToEntity(createClientDto)
    const id: string = uuidv4()
    clientEntity.id = id

    this.logger.log(`Creando cliente con id: ${id}`)
    const clientCreated = await this.clientRepository.save(clientEntity)
    const dto = this.clientMapper.toDTO(clientCreated)
    this.onChange(NotificationType.CREATE, dto)
    await this.invalidateCacheKey('client')
    return dto
  }

  /**
   * Método que actualiza un cliente
   * @param id Identificador del cliente
   * @param updateClientDto Datos del cliente a actualizar
   * @returns Cliente actualizado
   */
  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.clientRepository.findOneBy({
      email: updateClientDto.email,
    })
    if (client) {
      this.logger.warn(
        `Ya existe un cliente con email: ${updateClientDto.email}`,
      )
      throw new BadRequestException(
        `Ya existe un cliente con email: ${updateClientDto.email}`,
      )
    }

    const clientToUpdate = await this.clientRepository.findOneBy({ id })
    if (!clientToUpdate) {
      this.logger.warn(`No se encontró el cliente con id: ${id}`)
      throw new NotFoundException(`No se encontró el cliente con id: ${id}`)
    }

    const clientEntity = this.clientMapper.updateToEntity(updateClientDto)
    clientEntity.id = id

    this.logger.log(`Actualizando cliente con id: ${id}`)
    const clientUpdated = await this.clientRepository.save(clientEntity)
    const dto = this.clientMapper.toDTO(clientUpdated)
    this.onChange(NotificationType.UPDATE, dto)
    await this.invalidateCacheKey('client')
    return dto
  }

  /**
   * Método que elimina un cliente
   * @param id Identificador del cliente
   */
  async remove(id: string) {
    const client = await this.clientRepository.findOneBy({ id })

    if (!client) {
      this.logger.warn(`No se encontró el cliente con id: ${id}`)
      throw new NotFoundException(`No se encontró el cliente con id: ${id}`)
    }

    const hasOrders = await this.ordersService.clientExists(id)
    if (hasOrders) {
      this.logger.warn(`El cliente con id: ${id} tiene orders`)
      throw new BadRequestException(`El cliente con id: ${id} tiene orders`)
    }

    this.logger.log(`Eliminando cliente con id: ${id}`)
    await this.clientRepository.delete({ id })
    await this.invalidateCacheKey('client')
    this.onChange(NotificationType.DELETE, this.clientMapper.toDTO(client))
  }

  /**
   * Método que actualiza la imagen de un cliente
   * @param id Identificador del Client
   * @param file Fichero
   * @param req Petición
   * @param withUrl Indica si se debe generar la URL
   * @returns Cliente actualizado
   */
  async updateImage(
    id: string,
    file: Express.Multer.File,
    req: Request,
    withUrl: boolean = false,
  ) {
    this.logger.log(`Actualizando imagen del cliente con id: ${id}`)
    const clientToUpdate = await this.clientRepository.findOneBy({ id })
    if (!clientToUpdate) {
      this.logger.warn(`No se encontró el cliente con id: ${id}`)
      throw new NotFoundException(`No se encontró el cliente con id: ${id}`)
    }

    if (clientToUpdate.image !== Client.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${clientToUpdate.image}`)
      let imagePath = clientToUpdate.image
      if (withUrl) {
        imagePath = this.storageService.getFileNameWithoutUrl(
          clientToUpdate.image,
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

    clientToUpdate.image = filePath

    const clientUpdated = await this.clientRepository.save(clientToUpdate)

    const dto = this.clientMapper.toDTO(clientUpdated)

    this.onChange(NotificationType.UPDATE, dto)

    await this.invalidateCacheKey('client')

    return dto
  }

  /**
   * Método que envía una notificación a los clientes
   * @param type Tipo de notificación
   * @param data Datos de la notificación
   */
  private onChange(type: NotificationType, data: ResponseClientDto) {
    const notification = new WsNotification<ResponseClientDto>(
      'Clients',
      type,
      data,
      new Date(),
    )
    this.clientNotificationGateway.sendMessage(notification)
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
