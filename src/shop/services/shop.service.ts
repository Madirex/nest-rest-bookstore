import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Inject,
  Param,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Shop } from '../entities/shop.entity'
import { Repository } from 'typeorm'
import { validate as validateUUID } from 'uuid'
import { ShopMapper } from '../mappers/shop.mapper'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { ShopsNotificationsGateway } from '../websockets/notifications/shops-notifications.gateway'
import {
  NotificationType,
  WsNotification,
} from '../../websockets/notifications/notification.model'
import { Book } from '../../books/entities/book.entity'
import { Client } from '../../client/entities/client.entity'
import {
  PaginateQuery,
  paginate,
  Paginated,
  FilterSuffix,
  FilterOperator,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { ResponseShopDto } from '../dto/response-shop.dto'
import { CreateShopDto } from '../dto/create-shop.dto'
import { UpdateShopDto } from "../dto/update-shop.dto";

/**
 * Servicio de Shops
 */
@Injectable()
export class ShopsService {
  private readonly logger = new Logger(ShopsService.name)

  /**
   * Constructor
   * @param shopRepository Repositorio de Shops
   * @param bookRepository Repositorio de Books
   * @param clientRepository Repositorio de Clients
   * @param shopMapper Mapper de Shops
   * @param shopsNotificationsGateway Gateway de notificaciones de Shops
   * @param cacheManager Gestor de caché
   */
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly shopMapper: ShopMapper,
    private readonly shopsNotificationsGateway: ShopsNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  /**
   * Obtiene todas las Shops
   * @param query Query de paginación
   * @returns Arreglo con todas las Shops
   */
  async findAllShops(query: PaginateQuery) {
    this.logger.log('Obteniendo todas las Shops');

    // Verificar caché
    const cacheKey = `all_shops_page_${hash(JSON.stringify(query))}`;
    const cache = await this.cacheManager.get(cacheKey);
    if (cache) {
      this.logger.log('Cache hit');
      return cache;
    }

    const queryBuilder = this.shopRepository
      .createQueryBuilder('shop')
      .leftJoinAndSelect('shop.books', 'books')
      .leftJoinAndSelect('shop.clients', 'clients')
      .addSelect('shop.address');
    let pagination: Paginated<Shop>;
    try {
      pagination = await paginate(query, queryBuilder, {
        sortableColumns: ['name', 'createdAt', 'updatedAt', 'address'], // Agrega address a las columnas ordenables
        defaultSortBy: [['name', 'ASC']],
        searchableColumns: ['name', 'address'],
        filterableColumns: {
          name: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
          address: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const res = {
      data: (pagination.data ?? []).map((shop) =>
        this.shopMapper.mapEntityToResponseDto(shop),
      ),
      meta: pagination.meta,
      links: pagination.links,
    };

    // Guardar en caché
    await this.cacheManager.set(cacheKey, res, 60);

    return res;
  }


  /**
   * Obtiene una Shop dado el ID
   * @param id Identificador de la Shop
   * @returns Shop encontrada
   */
  async findOne(@Param('id') id: string): Promise<ResponseShopDto> {
    this.logger.log(`Obteniendo Shop por id: ${id}`);

    // Caché
    const cache: ResponseShopDto = await this.cacheManager.get(`shop_${id}`);
    if (cache) {
      this.logger.log('Cache hit');
      return cache;
    }

    if (!id || !validateUUID(id)) {
      throw new BadRequestException('ID no válido');
    }

    const shop = await this.shopRepository.findOne({
      where: { id },
      relations: ['books', 'clients'],
    });

    if (!shop) {
      throw new NotFoundException(`Shop con ID: ${id} no encontrada`);
    }


    const res = this.shopMapper.mapEntityToResponseDto(shop);

    // Se guarda en caché
    await this.cacheManager.set(`shop_${id}`, res, 60);

    return res;
  }



  /**
   * Crea una Shop
   * @param createShopDto DTO de creación de Shop
   * @returns Shop creada
   */
  async create(createShopDto: CreateShopDto): Promise<ResponseShopDto> {
    this.logger.log(`Creando Shop con datos: ${JSON.stringify(createShopDto)}`);

    const existingShop = await this.getByName(createShopDto.name.trim());
    if (existingShop) {
      this.logger.log(`Shop con nombre: ${existingShop.name} ya existe`);
      throw new BadRequestException(`La Shop con el nombre ${existingShop.name} ya existe`);
    }
    const books = [];
    const clients = [];
    const shop = this.shopMapper.toEntity(createShopDto, books, clients);
    const savedShop = await this.shopRepository.save(shop);

    const responseDto = this.shopMapper.mapEntityToResponseDto(savedShop);

    this.onChange(NotificationType.CREATE, responseDto);
    await this.invalidateCacheKey('all_shops');

    return responseDto;
  }



  /**
   * Actualiza un Shop
   * @param id Identificador del Shop
   * @param updateShopDto DTO de actualización de Shop
   * @returns Shop actualizado
   */
  async update(
    @Param('id') id: string,
    updateShopDto: UpdateShopDto,
  ): Promise<ResponseShopDto> {
    this.logger.log(`Actualizando Shop con datos: ${JSON.stringify(updateShopDto)}`);

    if (!id || !validateUUID(id)) {
      throw new BadRequestException('ID no válido');
    }

    const shopToUpdate = await this.shopRepository.findOne({
      where: { id },
      relations: ['books', 'clients'],
    });

    if (!shopToUpdate) {
      throw new NotFoundException(`Shop con ID: ${id} no encontrada`);
    }


    const updatedShop = this.shopMapper.mapUpdateToEntity(
      updateShopDto,
      shopToUpdate,
      shopToUpdate.books,
      shopToUpdate.clients
    );

    const savedShop = await this.shopRepository.save(updatedShop);

    const responseDto = this.shopMapper.mapEntityToResponseDto(savedShop);
    this.onChange(NotificationType.UPDATE, responseDto);

    await this.invalidateCacheKey(`shop_${id}`);
    await this.invalidateCacheKey('all_shops');

    return responseDto;
  }


  /**
   * Elimina una Shop
   * @param id Identificador de la Shop
   * @returns Shop eliminada
   */
  async remove(@Param('id') id: string): Promise<ResponseShopDto> {
    this.logger.log(`Eliminando Shop con id: ${id}`);

    if (!id || !validateUUID(id)) {
      throw new BadRequestException('ID no válido');
    }

    const shopToRemove = await this.shopRepository.findOne({ where: { id } });

    if (!shopToRemove) {
      throw new NotFoundException(`Shop con ID: ${id} no encontrada`);
    }


    await this.shopRepository.remove(shopToRemove);

    const responseDto = this.shopMapper.mapEntityToResponseDto(shopToRemove);
    this.onChange(NotificationType.DELETE, responseDto);

    await this.invalidateCacheKey(`shop_${id}`);
    await this.invalidateCacheKey('all_shops');

    return responseDto;
  }
  /**
   * Retorna una Shop dado el nombre
   * @param name Nombre de la Shop
   * @private Función privada
   * @returns Shop encontrada
   */
  async getByName(name: string): Promise<ResponseShopDto> {
    const shopOp = await this.shopRepository
      .createQueryBuilder('shop')
      .where('LOWER(shop.name) = LOWER(:name)', { name: name.toLowerCase() })
      .getOne();

    if (!shopOp) {
      throw new NotFoundException(`Shop con nombre: ${name} no encontrada`);
    }

    return this.shopMapper.mapEntityToResponseDto(shopOp);
  }

  /**
   * Retorna libros de una Shop dado el nombre de la Shop
   * @param shopName Nombre de la Shop
   * @returns Libros encontrados en la Shop
   */
  async getBooksByShopName(shopName: string): Promise<Book[]> {
    const shop = await this.shopRepository
      .createQueryBuilder('shop')
      .leftJoinAndSelect('shop.books', 'book')
      .where('LOWER(shop.name) = LOWER(:name)', { name: shopName.toLowerCase() })
      .getOne();

    if (!shop) {
      throw new NotFoundException(`Shop con nombre: ${shopName} no encontrada`);
    }

    return shop.books;
  }

  /**
   * Retorna los clientes asociados a una Shop dado el nombre de la Shop
   * @param shopName Nombre de la Shop
   * @returns Clientes asociados a la Shop
   */
  async getClientsByShopName(shopName: string): Promise<Client[]> {
    const shop = await this.shopRepository
      .createQueryBuilder('shop')
      .leftJoinAndSelect('shop.clients', 'client')
      .where('LOWER(shop.name) = LOWER(:name)', { name: shopName.toLowerCase() })
      .getOne();

    if (!shop) {
      throw new NotFoundException(`Shop con nombre: ${shopName} no encontrada`);
    }

    return shop.clients;

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
  private onChange(type: NotificationType, data: ResponseShopDto) {
    const notification = new WsNotification<ResponseShopDto>(
      'Shops',
      type,
      data,
      new Date(),
    );
    this.shopsNotificationsGateway.sendMessage(notification);
  }

  // Dentro de tu clase ShopsService

  /**
   * Añade un libro a la tienda.
   *
   * @param shopId Identificador de la tienda.
   * @param bookId Identificador del libro.
   * @returns La tienda actualizada.
   */
  async addBookToShop(shopId: string, bookId: number): Promise<ResponseShopDto> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ['books', 'clients'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop con ID: ${shopId} no encontrada`);
    }

    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Book con ID: ${bookId} no encontrado`);
    }

    shop.books.push(book);

    await this.shopRepository.save(shop);

    return this.shopMapper.mapEntityToResponseDto(shop);
  }

  /**
   * Elimina un libro de la tienda.
   *
   * @param shopId Identificador de la tienda.
   * @param bookId Identificador del libro.
   * @returns La tienda actualizada.
   */
  async removeBookFromShop(shopId: string, bookId: number): Promise<ResponseShopDto> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ['books', 'clients'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop con ID: ${shopId} no encontrada`);
    }

    shop.books = shop.books.filter(book => book.id !== bookId);

    await this.shopRepository.save(shop);

    return this.shopMapper.mapEntityToResponseDto(shop);
  }

  /**
   * Añade un cliente a la tienda.
   *
   * @param shopId Identificador de la tienda.
   * @param clientId Identificador del cliente.
   * @returns La tienda actualizada.
   */
  async addClientToShop(shopId: string, clientId: string): Promise<ResponseShopDto> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ['books', 'clients'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop con ID: ${shopId} no encontrada`);
    }

    const client = await this.clientRepository.findOneBy({ id: clientId });
    if (!client) {
      throw new NotFoundException(`Client con ID: ${clientId} no encontrado`);
    }

    shop.clients.push(client);

    await this.shopRepository.save(shop);

    return this.shopMapper.mapEntityToResponseDto(shop);
  }

  /**
   * Elimina un cliente de la tienda.
   *
   * @param shopId Identificador de la tienda.
   * @param clientId Identificador del cliente.
   * @returns La tienda actualizada.
   */
  async removeClientFromShop(shopId: string, clientId: string): Promise<ResponseShopDto> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: ['books', 'clients'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop con ID: ${shopId} no encontrada`);
    }

    shop.clients = shop.clients.filter(client => client.id !== clientId);

    await this.shopRepository.save(shop);

    return this.shopMapper.mapEntityToResponseDto(shop);
  }


}
