import { Test, TestingModule } from '@nestjs/testing'
import { ClientService } from './client.service'
import { Repository } from 'typeorm'
import { Client } from '../entities/client.entity'
import { StorageService } from '../../storage/storage.service'
import { OrdersService } from '../../orders/services/orders.service'
import { ClientNotificationsGateway } from '../../websockets/notifications/client-notifications.gateway'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ClientMapper } from '../mappers/client.mapper'

describe('ClientService', () => {
  let service: ClientService
  let clientRepository : Repository<Client>
  let storageService : StorageService
  let ordersService : OrdersService
  let clientNotificationGateway: ClientNotificationsGateway


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
        { provide: getRepositoryToken(Client), useValue: clientRepository },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: OrdersService, useValue: ordersService },
        { provide: ClientMapper, useValue: clientMapperMock },
        {
          provide: ClientNotificationsGateway,
          useValue: clientNotificationGatewayMock,
        },
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
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
