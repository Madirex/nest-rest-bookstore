import { Test, TestingModule } from '@nestjs/testing'
import { ClientService } from './client.service'
import {DeleteResult, Repository} from 'typeorm'
import { Client } from '../entities/client.entity'
import { StorageService } from '../../storage/storage.service'
import { OrdersService } from '../../orders/services/orders.service'
import { ClientNotificationsGateway } from '../../websockets/notifications/client-notifications.gateway'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ClientMapper } from '../mappers/client.mapper'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {Address} from "../../common/address.entity";
import {ResponseClientDto} from "../dto/response-client.dto";
import {Paginated} from "nestjs-paginate";
import {NotFoundException} from "@nestjs/common";
import {CreateClientDto} from "../dto/create-client.dto";
import {UpdateClientDto} from "../dto/update-client.dto";

describe('ClientService', () => {
  let service: ClientService
  let clientRepository: Repository<Client>
  let storageService: StorageService
  let ordersService: OrdersService
  let clientNotificationGateway: ClientNotificationsGateway
  let cacheManager: Cache

  const address: Address = {
    street: 'street',
    number: '2',
    city: 'city',
    province: 'province',
    country: 'country',
    postalCode: '28970',
  }

  const ordersServiceMock = {
    clientExists: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  const clientMapperMock = {
    toEntity: jest.fn(),
    toDTO: jest.fn(),
    createToEntity: jest.fn(),
    updateToEntity: jest.fn(),
  }

  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithoutUrl: jest.fn(),
  }

  const clientNotificationGatewayMock = {
    sendMessage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {provide: getRepositoryToken(Client), useClass: Repository},
        {provide: StorageService, useValue: storageServiceMock},
        {provide: OrdersService, useValue: ordersServiceMock},
        {provide: ClientMapper, useValue: clientMapperMock},
        {
          provide: ClientNotificationsGateway,
          useValue: clientNotificationGatewayMock,
        },
        {provide: CACHE_MANAGER, useValue: cacheManagerMock},
      ],
    }).compile()

    service = module.get<ClientService>(ClientService)
    clientRepository = module.get<Repository<Client>>(
        getRepositoryToken(Client),
    )
    storageService = module.get<StorageService>(StorageService)
    ordersService = module.get<OrdersService>(OrdersService)
    clientNotificationGateway = module.get<ClientNotificationsGateway>(
        ClientNotificationsGateway,
    )
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    const query = {page: 1, limit: 10, path: 'clients'};
    const clients: Client[] = []
    const clientDto = new ResponseClientDto()
    const client = new Client()

    beforeEach(() => {
      client.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      client.name = 'name'
      client.surname = 'surname'
      client.email = 'email@gmail.com'
      client.phone = '644441297'
      client.address = address

      clientDto.id = client.id
      clientDto.name = client.name
      clientDto.surname = client.surname
      clientDto.email = client.email
      clientDto.phone = client.phone
      clientDto.address = client.address
      clients.push(client)
    })

    it('should return an array of clients without cache', async () => {
      const testClient = {
        data: [client],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'clients?page=1&limit=10',
        }
      } as Paginated<Client>


      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([clients]),
      }

      jest
          .spyOn(clientRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(clientMapperMock, 'toDTO').mockReturnValue(clientDto)

      const result: any = await service.findAll(query)

      expect(result.data[0].id).toBe(clientDto.id)
      expect(result.data[0].name).toBe(clientDto.name)
      expect(result.data[0].surname).toBe(clientDto.surname)
      expect(result.data[0].email).toBe(clientDto.email)
      expect(result.data[0].phone).toBe(clientDto.phone)
      expect(result.data[0].address).toBe(clientDto.address)

      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })

    it('should return an array of clients with cache ', async () => {

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve({
        data: [client],
        meta: {itemsPerPage: 10, totalItems: 1, currentPage: 1, totalPages: 1},
        links: {current: 'clients?page=1&limit=10'}
      }))

      const result: any = await service.findAll(query)

      expect(result.data[0].id).toBe(clientDto.id)
      expect(result.data[0].name).toBe(clientDto.name)
      expect(result.data[0].surname).toBe(clientDto.surname)
      expect(result.data[0].email).toBe(clientDto.email)
      expect(result.data[0].phone).toBe(clientDto.phone)
      expect(result.data[0].address).toBe(clientDto.address)

      expect(cacheManager.get).toHaveBeenCalled()
    });
  })

  describe('findOne', () => {
    const id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
    const client = new Client()
    const clientDto = new ResponseClientDto()

    beforeEach(() => {
      client.id = id
      client.name = 'name'
      client.surname = 'surname'
      client.email = 'email@gmail.com'
      client.phone = '644441297'
      client.address = address

      clientDto.id = id
      clientDto.name = client.name
      clientDto.surname = client.surname
      clientDto.email = client.email
      clientDto.phone = client.phone
      clientDto.address = client.address
    })


    it('should return a client', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(client)
      jest.spyOn(clientMapperMock, 'toDTO').mockReturnValue(clientDto)

      const result: any = await service.findOne(id)

      expect(result.id).toBe(clientDto.id)
      expect(result.name).toBe(clientDto.name)
      expect(result.surname).toBe(clientDto.surname)
      expect(result.email).toBe(clientDto.email)
      expect(result.phone).toBe(clientDto.phone)
      expect(result.address).toBe(clientDto.address)
    })


    it('should return a client with cache', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(clientDto))

      const result: any = await service.findOne(id)

      expect(result.id).toBe(clientDto.id)
      expect(result.name).toBe(clientDto.name)
      expect(result.surname).toBe(clientDto.surname)
      expect(result.email).toBe(clientDto.email)
      expect(result.phone).toBe(clientDto.phone)
      expect(result.address).toBe(clientDto.address)

      expect(cacheManager.get).toHaveBeenCalled()
    })

    it('should not return a client, notfound', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(null)

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException)

      await expect(service.findOne(id)).rejects.toThrowError(`No se encontró el cliente con id: ${id}`)
    })

  })

  describe('findByEmail', () => {
    const email = 'email@gmail.com'
    const client = new Client()
    const clientDto = new ResponseClientDto()

    beforeEach(() => {
      client.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      client.name = 'name'
      client.surname = 'surname'
      client.email = email
      client.phone = '644441297'
      client.address = address

      clientDto.id = client.id
      clientDto.name = client.name
      clientDto.surname = client.surname
      clientDto.email = client.email
      clientDto.phone = client.phone
      clientDto.address = client.address
    })

    it('should return a client', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(client)
      jest.spyOn(clientMapperMock, 'toDTO').mockReturnValue(clientDto)

      const result: any = await service.findByEmail(email)

      expect(result.id).toBe(clientDto.id)
      expect(result.name).toBe(clientDto.name)
      expect(result.surname).toBe(clientDto.surname)
      expect(result.email).toBe(clientDto.email)
      expect(result.phone).toBe(clientDto.phone)
      expect(result.address).toBe(clientDto.address)
    })


    it('should return a client with cache', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(clientDto))

      const result: any = await service.findByEmail(email)

      expect(result.id).toBe(clientDto.id)
      expect(result.name).toBe(clientDto.name)
      expect(result.surname).toBe(clientDto.surname)
      expect(result.email).toBe(clientDto.email)
      expect(result.phone).toBe(clientDto.phone)
      expect(result.address).toBe(clientDto.address)

      expect(cacheManager.get).toHaveBeenCalled()
    })


    it('should not return a client, notfound', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(null)

      await expect(service.findByEmail(email)).rejects.toThrow(NotFoundException)

      await expect(service.findByEmail(email)).rejects.toThrowError(`No se encontró el cliente con email: ${email}`)
    })
  })


  describe('create', () => {
    const client = new Client()
    const clientDto = new ResponseClientDto()
    const createClientDto = new CreateClientDto()

    beforeEach(() => {
      client.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
      client.name = 'name'
      client.surname = 'surname'
      client.email = 'email@gmail.com'
      client.phone = '644441297'
      client.address = address

      createClientDto.name = client.name
      createClientDto.surname = client.surname
      createClientDto.email = client.email
      createClientDto.phone = client.phone
      createClientDto.address = client.address

      clientDto.id = client.id
      clientDto.name = client.name
      clientDto.surname = client.surname
      clientDto.email = client.email
      clientDto.phone = client.phone
      clientDto.address = client.address
    })

    it('should create a client', async () => {
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(null)
      jest.spyOn(clientRepository, 'save').mockResolvedValue(client)
      jest.spyOn(clientMapperMock, 'createToEntity').mockReturnValue(client)
      jest.spyOn(clientMapperMock, 'toDTO').mockReturnValue(clientDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const result: any = await service.create(createClientDto)

      expect(result.id).toBe(clientDto.id)
      expect(result.name).toBe(clientDto.name)
      expect(result.surname).toBe(clientDto.surname)
      expect(result.email).toBe(clientDto.email)
      expect(result.phone).toBe(clientDto.phone)
      expect(result.address).toBe(clientDto.address)
    })

    it('should not create a client, already exists', async () => {
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(client)

      await expect(service.create(createClientDto)).rejects.toThrowError(`Ya existe un cliente con email: ${client.email}`)
    })
  })

  describe('update', () => {
    const id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
    const client = new Client()
    const clientDto = new ResponseClientDto()
    const updateClientDto = new UpdateClientDto()

    beforeEach(() => {
      client.id = id
      client.name = 'name'
      client.surname = 'surname'
      client.email = 'email@gmail.com'
      client.phone = '644441297'
      client.address = address

      updateClientDto.name = client.name
      updateClientDto.surname = client.surname
      updateClientDto.email = client.email
      updateClientDto.phone = client.phone
      updateClientDto.address = client.address

      clientDto.id = id
      clientDto.name = client.name
      clientDto.surname = client.surname
      clientDto.email = client.email
      clientDto.phone = client.phone
      clientDto.address = client.address
    })

    it('should update a client', async () => {
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValueOnce(null).mockResolvedValueOnce(client)
      jest.spyOn(clientRepository, 'save').mockResolvedValue(client)
      jest.spyOn(clientMapperMock, 'updateToEntity').mockReturnValue(client)
      jest.spyOn(clientMapperMock, 'toDTO').mockReturnValue(clientDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const result: any = await service.update(id, updateClientDto)

      expect(result.id).toBe(clientDto.id)
      expect(result.name).toBe(clientDto.name)
      expect(result.surname).toBe(clientDto.surname)
      expect(result.email).toBe(clientDto.email)
      expect(result.phone).toBe(clientDto.phone)
      expect(result.address).toBe(clientDto.address)
    })

    it('should not update a client, not found', async () => {
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValueOnce(null).mockResolvedValueOnce(null)

      await expect(service.update(id, updateClientDto)).rejects.toThrowError(`No se encontró el cliente con id: ${id}`)
    })

    it('should not update a client, already exists', async () => {
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValueOnce(client).mockResolvedValueOnce(client)

      await expect(service.update(id, updateClientDto)).rejects.toThrowError(`Ya existe un cliente con email: ${client.email}`)
    })

  })

  describe('remove', () => {
    const id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'

    it('should not remove a client, not found', async () => {
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(null)

      await expect(service.remove(id)).rejects.toThrowError(`No se encontró el cliente con id: ${id}`)
    })


    it('should remove a client', async () => {
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(new Client())
      jest.spyOn(clientRepository, 'delete').mockResolvedValue(new DeleteResult())
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(ordersService, 'clientExists').mockResolvedValue(false)

      await service.remove(id)

      expect(clientRepository.delete).toHaveBeenCalled()
    })

    it('should not remove a client, has orders', async () => {
      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(new Client())
      jest.spyOn(ordersService, 'clientExists').mockResolvedValue(true)

      await expect(service.remove(id)).rejects.toThrowError(`El cliente con id: ${id} tiene orders`)
    })
  })

  describe('updateImage', () => {
    const id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
    const client = new Client()
    const clientDto = new ResponseClientDto()
    const image = 'http://localhost/pepe.jpg'

    beforeEach(() => {
      client.id = id
      client.name = 'name'
      client.surname = 'surname'
      client.email = 'email@gmail.com'
      client.phone = '644441297'
      client.address = address
      client.image = image

      clientDto.id = id
      clientDto.name = client.name
      clientDto.surname = client.surname
      clientDto.email = client.email
      clientDto.phone = client.phone
      clientDto.address = client.address
      clientDto.image = client.image
    })

    it('should update a client image', async () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      }
      const mockFile = {
        filename: 'new_image',
      }

      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(client)
      jest.spyOn(clientRepository, 'save').mockResolvedValue(client)
      jest.spyOn(clientMapperMock, 'toDTO').mockReturnValue(clientDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      expect(
          await service.updateImage(
              id,
              mockRequest as any,
              mockFile as any,
              false,
          ),
      ).toEqual(clientDto)

      expect(storageService.removeFile).toHaveBeenCalled()
    })

    it('should not update a client image, not found', async () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      }
      const mockFile = {
        filename: 'new_image',
      }

      jest.spyOn(clientRepository, 'findOneBy').mockResolvedValue(null)

      await expect(
          service.updateImage(
              id,
              mockRequest as any,
              mockFile as any,
              false,
          ),
      ).rejects.toThrowError(`No se encontró el cliente con id: ${id}`)
    })
  })
})
