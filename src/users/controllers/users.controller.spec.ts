import { UsersController } from './users.controller'
import { UsersService } from '../services/users.service'
import { Test, TestingModule } from '@nestjs/testing'
import { CacheModule } from '@nestjs/cache-manager'
import { Paginated } from 'nestjs-paginate'
import { UserDto } from '../dto/user-response.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { User } from '../entities/user.entity'
import { getRepositoryToken } from '@nestjs/typeorm'

describe('UsersController', () => {
  let controller: UsersController
  let service: UsersService

  const usersRepositorio = {
    save: jest.fn(),
  }
  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    deleteById: jest.fn(),
    getOrders: jest.fn(),
    getOrder: jest.fn(),
    createOrder: jest.fn(),
    updateOrder: jest.fn(),
    removeOrder: jest.fn(),
  }
  const paginateOptions = {
    page: 1,
    limit: 10,
    path: 'users',
  }
  const testUsers = {
    data: [],
    meta: {
      itemsPerPage: 10,
      totalItems: 1,
      currentPage: 1,
      totalPages: 1,
    },
    links: {
      current: 'users?page=1&limit=10&sortBy=name:ASC',
    },
  } as Paginated<UserDto>
  const testUserCreate = {} as CreateUserDto
  const testUserDto = {} as UserDto
  const testUserUpdate = {} as UpdateUserDto
  const testUser = {} as User
  const testOrders = {
    user: {
      id: 'someId',
    },
    userId: 'usuario123',
    clientId: 'cliente456',
    orderLines: [
      {
        productId: 'producto789',
        quantity: 2,
        price: 100,
      },
      {
        productId: 'producto012',
        quantity: 1,
        price: 50,
      },
    ],
    totalItems: 3,
    total: 250,
    createdAt: '2023-02-10T00:00:00.000Z',
    updatedAt: '2023-02-10T00:00:00.000Z',
    isDeleted: false,
  } as any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositorio,
        },
      ],
    }).compile()
    controller = module.get<UsersController>(UsersController)
    service = module.get<UsersService>(UsersService)
  })
  it('debería estar definido', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('debería retornar todos los usuarios', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(testUsers as any)
      const result: any = await controller.findAll(paginateOptions)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.meta.totalPages).toEqual(1)
      expect(result.links.current).toEqual(
        `users?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=name:ASC`,
      )
    })
  })
  describe('findOne', () => {
    it('debería retornar un usuario por su id', async () => {
      const testUser = {} as UserDto
      jest.spyOn(service, 'findOne').mockResolvedValue(testUser)
      const result: any = await controller.findOne('1')
      expect(result).toEqual(testUser)
    })
    it('debería retornar un error si el usuario no existe', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException)
    })
    it('debería retornar un error si el id no es válido', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new BadRequestException())
      await expect(controller.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      )
    })
  })
  describe('create', () => {
    it('debería crear un usuario', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(testUserDto)
      const result: any = await controller.create(testUserCreate)
      expect(result).toEqual(testUserDto)
    })
  })
  describe('update', () => {
    it('debería actualizar un usuario', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(testUserDto)
      const result: any = await controller.update('1', testUserUpdate)
      expect(result).toEqual(testUserDto)
    })
  })
  describe('remove', () => {
    it('debería eliminar un usuario', async () => {
      const ejec = jest.spyOn(service, 'remove').mockResolvedValue(testUser)
      await controller.remove('1')
      expect(ejec).toHaveBeenCalledTimes(1)
    })
  })
  describe('getProfile', () => {
    it('debería retornar el perfil del usuario', async () => {
      const result = await controller.getProfile('1')
      expect(result).toEqual(result)
    })
  })
  describe('deleteProfile', () => {
    it('debería eliminar el perfil del usuario', async () => {
      jest.spyOn(service, 'deleteById').mockResolvedValue(testUser as any)
      const result: any = await controller.deleteProfile(testOrders as any)
      expect(result).toEqual(testUser)
    })
  })
  describe('updateProfile', () => {
    it('debería actualizar el perfil del usuario', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(testUser as any)
      const result: any = await controller.updateProfile(
        testOrders as any,
        testUserUpdate,
      )
      expect(result).toEqual(testUser)
    })
  })
  describe('getOrders', () => {
    it('debería retornar las ordenes del usuario', async () => {
      jest.spyOn(service, 'getOrders').mockResolvedValue(testOrders)
      const result: any = await controller.getOrders(testOrders as any)
      expect(result).toEqual(testOrders)
    })
  })
  describe('getOrder', () => {
    it('debería retornar una orden del usuario', async () => {
      jest.spyOn(service, 'getOrder').mockResolvedValue(testOrders)
      const result: any = await controller.getOrder(testOrders as any, '1')
      expect(result).toEqual(testOrders)
    })
  })
  describe('createOrder', () => {
    it('debería crear una orden del usuario', async () => {
      jest.spyOn(service, 'createOrder').mockResolvedValue(testOrders)
      const result: any = await controller.createOrder(
        testOrders,
        testOrders as any,
      )
      expect(result).toEqual(testOrders)
    })
  })
  describe('updateOrder', () => {
    it('debería actualizar una orden del usuario', async () => {
      jest.spyOn(service, 'updateOrder').mockResolvedValue(testOrders)
      const result: any = await controller.updateOrder(
        '1',
        testUserUpdate as any,
        testOrders as any,
      )
      expect(result).toEqual(testOrders)
    })
  })
  describe('removeOrder', () => {
    it('debería eliminar una orden del usuario', async () => {
      const ejec = jest
        .spyOn(service, 'removeOrder')
        .mockResolvedValue(testOrders)
      await controller.removeOrder('1', testOrders as any)
      expect(ejec).toHaveBeenCalledTimes(1)
    })
  })
})
