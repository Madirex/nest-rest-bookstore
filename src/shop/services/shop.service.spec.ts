import { Test, TestingModule } from '@nestjs/testing'
import { ShopsService } from './shop.service'
import { Shop } from '../entities/shop.entity'
import { Book } from '../../books/entities/book.entity'
import { Client } from '../../client/entities/client.entity'
import { Cache } from 'cache-manager'
import { ShopMapper } from '../mappers/shop.mapper'
import { ShopsNotificationsGateway } from '../../websockets/notifications/shop-notification.gateway'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ResponseShopDto } from '../dto/response-shop.dto'
import { Address } from '../../common/address.entity'
import { CategoryType } from '../../categories/entities/category.entity'
import { Paginated } from 'nestjs-paginate'
import { UpdateClientDto } from '../../client/dto/update-client.dto'
import { UpdateShopDto } from '../dto/update-shop.dto'
import { CreateShopDto } from '../dto/create-shop.dto'

describe('ShopService', () => {
  let service: ShopsService
  let shopRepository: Repository<Shop>
  let bookRepository: Repository<Book>
  let clientRepository: Repository<Client>
  let shopsNotificationsGateway: ShopsNotificationsGateway
  let cacheManager: Cache

  const address: Address = {
    street: 'street',
    number: '2',
    city: 'city',
    province: 'province',
    country: 'country',
    postalCode: '28970',
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  const book = new Book()
  book.id = 1
  book.name = 'El Quijote'
  book.author = 'Cervantes'
  book.publisher = {
    id: 1,
    name: 'Publisher',
    createdAt: new Date(),
    updatedAt: new Date(),
    books: null,
    image: 'publisher-image.jpg',
    active: true,
  }
  book.category = {
    id: 1,
    name: 'test',
    categoryType: CategoryType.OTHER,
    createdAt: new Date('2023-01-01T12:00:00Z'),
    updatedAt: new Date('2023-01-01T12:00:00Z'),
    isActive: true,
    books: [],
  }
  book.description = 'A book'
  book.price = 10
  book.stock = 10

  const client = new Client()
  client.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
  client.name = 'name'
  client.surname = 'surname'
  client.email = 'email@gmail.com'
  client.phone = '644441297'
  client.address = address

  const shopMapperMock = {
    mapEntityToResponseDto: jest.fn(),
    toEntity: jest.fn(),
    mapUpdateToEntity: jest.fn(),
  }

  const shopsNotificationsGatewayMock = {
    sendMessage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopsService,
        { provide: getRepositoryToken(Client), useClass: Repository },
        { provide: getRepositoryToken(Shop), useClass: Repository },
        { provide: getRepositoryToken(Book), useClass: Repository },
        { provide: ShopMapper, useValue: shopMapperMock },
        {
          provide: ShopsNotificationsGateway,
          useValue: shopsNotificationsGatewayMock,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<ShopsService>(ShopsService)
    shopRepository = module.get<Repository<Shop>>(getRepositoryToken(Shop))
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book))
    clientRepository = module.get<Repository<Client>>(
      getRepositoryToken(Client),
    )
    shopsNotificationsGateway = module.get<ShopsNotificationsGateway>(
      ShopsNotificationsGateway,
    )
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAllShops', () => {
    const query = { page: 1, limit: 10, path: 'shops' }
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should return an array of shops without cache', async () => {
      const testShop = {
        data: [shop],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'shop?page=1&limit=10',
        },
      } as Paginated<Shop>
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[shop]]),
      }

      jest
        .spyOn(shopRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(shopDto)

      const result: any = await service.findAllShops(query)

      expect(result.data[0].id).toBe(shop.id)
      expect(result.data[0].name).toBe(shop.name)
      expect(result.data[0].address).toBe(shop.address)
      expect(result.data[0].booksId).toStrictEqual([book.id])
      expect(result.data[0].clientsId).toStrictEqual([client.id])
    })

    it('should return an array of shops with cache', async () => {
      const testShop = {
        data: [shop],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'shop?page=1&limit=10',
        },
      } as Paginated<Shop>
      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValue(Promise.resolve(testShop))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = await service.findAllShops(query)

      expect(result.data[0].id).toBe(shop.id)
      expect(result.data[0].name).toBe(shop.name)
      expect(result.data[0].address).toBe(shop.address)
      expect(result.data[0].books[0].id).toBe(book.id)
      expect(result.data[0].clients[0].id).toBe(client.id)
    })
  })

  describe('findOne', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should return a shop whitout cache', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(shopDto)

      const result: any = await service.findOne(shop.id)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address).toBe(shop.address)
      expect(result.booksId).toStrictEqual([book.id])
      expect(result.clientsId).toStrictEqual([client.id])
    })

    it('should return a shop with cache', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(shop))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = await service.findOne(shop.id)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address).toBe(shop.address)
      expect(result.books[0].id).toBe(book.id)
      expect(result.clients[0].id).toBe(client.id)
    })

    it('should return error id is not uuid', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      const result: any = service.findOne('1')

      await expect(result).rejects.toThrowError('ID no válido')
    })

    it('should return not found shop', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      const result: any = service.findOne(
        '7f1e1546-79e5-49d5-9b58-dc353ae82f97',
      )

      await expect(result).rejects.toThrowError(
        `Shop con ID: ${shop.id} no encontrada`,
      )
    })
  })

  describe('create', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()
    const createShopDto = new CreateShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]

      createShopDto.name = shop.name
      createShopDto.address = shop.address
    })

    it('should create a shop', async () => {
      jest.spyOn(shopRepository, 'save').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(service, 'getByName').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest.spyOn(shopMapperMock, 'toEntity').mockReturnValue(shopDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const result: any = await service.create(createShopDto)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address.province).toBe(shop.address.province)
      expect(result.booksId).toStrictEqual([book.id])
      expect(result.clientsId).toStrictEqual([client.id])
    })

    it('should return error shop already exists', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(service, 'getByName').mockResolvedValue(shopDto)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.create(createShopDto)

      await expect(result).rejects.toThrowError(
        `La Shop con el nombre ${shop.name} ya existe`,
      )
    })
  })

  describe('update', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()
    const updatedShop = new UpdateShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]

      updatedShop.name = shop.name
      updatedShop.address = shop.address
    })

    it('should update a shop', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(shopRepository, 'save').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest.spyOn(shopMapperMock, 'mapUpdateToEntity').mockReturnValue(shopDto)

      const result: any = await service.update(shop.id, updatedShop)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address.country).toBe(shop.address.country)
      expect(result.booksId).toStrictEqual([book.id])
      expect(result.clientsId).toStrictEqual([client.id])
    })

    it('should return error shop not found', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.update(shop.id, updatedShop)

      await expect(result).rejects.toThrowError(
        `Shop con ID: ${shop.id} no encontrada`,
      )
    })

    it('should return error id is not uuid', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      const result: any = service.update('1', updatedShop)

      await expect(result).rejects.toThrowError('ID no válido')
    })

    it('should return error shop already exists', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(service, 'getByName').mockResolvedValue(shopDto)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const result: any = service.update(shop.id, {
        ...updatedShop,
        name: 'Librería Pepito 2',
      })

      await expect(result).rejects.toThrowError(
        `Shop con nombre: Librería Pepito 2 ya existe`,
      )
    })
  })

  describe('remove', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should remove a shop', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(shopRepository, 'remove').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = await service.remove(shop.id)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address.country).toBe(shop.address.country)
      expect(result.booksId).toStrictEqual([book.id])
      expect(result.clientsId).toStrictEqual([client.id])
    })

    it('should return error shop not found', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.remove(shop.id)

      await expect(result).rejects.toThrowError(
        `Shop con ID: ${shop.id} no encontrada`,
      )
    })

    it('should return error id is not uuid', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      const result: any = service.remove('1')

      await expect(result).rejects.toThrowError('ID no válido')
    })
  })

  describe('getByName', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should return a shop', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(shop),
      }

      jest
        .spyOn(shopRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any)
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(shopDto)

      const result: any = await service.getByName(shop.name)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address.country).toBe(shop.address.country)
      expect(result.booksId).toStrictEqual([book.id])
      expect(result.clientsId).toStrictEqual([client.id])
    })

    it('should return null', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }

      jest
        .spyOn(shopRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any)
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(shopDto)

      const result: any = await service.getByName(shop.name)

      expect(result).toBe(null)
    })
  })

  describe('getBooksByShopName', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should return a shop', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(shop),
      }

      jest
        .spyOn(shopRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any)
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(shopDto)

      const result: any = await service.getBooksByShopName(shop.name)

      expect(result[0].id).toBe(book.id)
    })

    it('should return null', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }

      jest
        .spyOn(shopRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any)
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(shopDto)

      const result: any = service.getBooksByShopName(shop.name)

      await expect(result).rejects.toThrowError(
        `Shop con nombre: ${shop.name} no encontrada`,
      )
    })
  })

  describe('getClientsByShopName', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should return a shop', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(shop),
      }

      jest
        .spyOn(shopRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any)
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(shopDto)

      const result: any = await service.getClientsByShopName(shop.name)

      expect(result[0].id).toBe(client.id)
    })

    it('should return null', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }

      jest
        .spyOn(shopRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any)
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue(shopDto)

      const result = service.getClientsByShopName(shop.name)

      await expect(result).rejects.toThrowError(
        `Shop con nombre: ${shop.name} no encontrada`,
      )
    })
  })

  describe('addBookToShop', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should add a book to a shop', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)

      jest.spyOn(bookRepository, 'findOneBy').mockResolvedValue(book)
      jest.spyOn(shopRepository, 'save').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = await service.addBookToShop(shop.id, book.id)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address.country).toBe(shop.address.country)
      expect(result.booksId).toStrictEqual([book.id])
      expect(result.clientsId).toStrictEqual([client.id])
    })

    it('should return error shop not found', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.addBookToShop(shop.id, book.id)

      await expect(result).rejects.toThrowError(
        `Shop con ID: ${shop.id} no encontrada`,
      )
    })

    it('should return error book not found', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(bookRepository, 'findOneBy').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.addBookToShop(shop.id, book.id)

      await expect(result).rejects.toThrowError(
        `Book con ID: ${book.id} no encontrado`,
      )
    })
  })

  describe('removeBookFromShop', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should remove a book from a shop', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(bookRepository, 'findOneBy').mockResolvedValue(book)
      jest.spyOn(shopRepository, 'save').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue({ ...shopDto, booksId: [] })

      const result: any = await service.removeBookFromShop(shop.id, book.id)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address.country).toBe(shop.address.country)
      expect(result.booksId).toStrictEqual([])
      expect(result.clientsId).toStrictEqual([client.id])
    })

    it('should return error shop not found', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.removeBookFromShop(shop.id, book.id)

      await expect(result).rejects.toThrowError(
        `Shop con ID: ${shop.id} no encontrada`,
      )
    })
  })

  describe('addClientToShop', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should add a client to a shop', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(client)
      jest.spyOn(shopRepository, 'save').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue({ ...shopDto, clientsId: [client.id] })

      const result: any = await service.addClientToShop(shop.id, client.id)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address.country).toBe(shop.address.country)
      expect(result.booksId).toStrictEqual([book.id])
      expect(result.clientsId).toStrictEqual([client.id])
    })

    it('should return error shop not found', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.addClientToShop(shop.id, client.id)

      await expect(result).rejects.toThrowError(
        `Shop con ID: ${shop.id} no encontrada`,
      )
    })

    it('should return error client not found', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.addClientToShop(shop.id, client.id)

      await expect(result).rejects.toThrowError(
        `Client con ID: ${client.id} no encontrado`,
      )
    })
  })

  describe('removeClientFromShop', () => {
    const shop = new Shop()
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      shop.name = 'Librería Pepito'
      shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      }
      shop.books = [book]
      shop.clients = [client]

      shopDto.id = shop.id
      shopDto.name = shop.name
      shopDto.address = shop.address
      shopDto.booksId = [book.id]
      shopDto.clientsId = [client.id]
    })

    it('should remove a client from a shop', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(shop)
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(client)
      jest.spyOn(shopRepository, 'save').mockResolvedValue(shop)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest
        .spyOn(shopMapperMock, 'mapEntityToResponseDto')
        .mockReturnValue({ ...shopDto, clientsId: [] })

      const result: any = await service.removeClientFromShop(shop.id, client.id)

      expect(result.id).toBe(shop.id)
      expect(result.name).toBe(shop.name)
      expect(result.address.country).toBe(shop.address.country)
      expect(result.booksId).toStrictEqual([book.id])
      expect(result.clientsId).toStrictEqual([])
    })

    it('should return error shop not found', async () => {
      jest.spyOn(shopRepository, 'findOne').mockResolvedValue(null)
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const result: any = service.removeClientFromShop(shop.id, client.id)

      await expect(result).rejects.toThrowError(
        `Shop con ID: ${shop.id} no encontrada`,
      )
    })
  })
})
