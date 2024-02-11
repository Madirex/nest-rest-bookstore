import { UsersController } from './users.controller'
import { UsersService } from '../services/users.service'
import { Test, TestingModule } from '@nestjs/testing'
import { CacheModule } from '@nestjs/cache-manager'
import { Paginated } from 'nestjs-paginate'
import { UserDto } from '../dto/user-response.dto'
import { NotFoundException } from '@nestjs/common'

describe('UsersController', () => {
  let controller: UsersController
  let usersService: UsersService

  const usersServiceMock = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    deleteById: jest.fn(),
    getPedidos: jest.fn(),
    getPedido: jest.fn(),
    createPedido: jest.fn(),
    updatePedido: jest.fn(),
    removePedido: jest.fn(),
  }
  const mockUser: UserDto = {
    id: 1,
    nombre: 'test',
    apellidos: 'test',
    username: 'test',
    email: 'test@test.com',
    roles: ['USER'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  }
  const mockCreateUserDto = {
    nombre: 'test',
    apellidos: 'test',
    username: 'test',
    email: 'test@test.com',
    roles: ['USER'],
    password: 'test',
  }
  const mockUpdateUserDto = {
    nombre: 'test',
    apellidos: 'test',
    username: 'test',
    email: 'test@test.com',
    roles: ['USER'],
    password: 'test',
    isDeleted: false,
  }
  const mockRequest = {
    user: mockUser,
  }
  const mockOrders = [
    {
      id: 1,
      usuarioId: 1,
      total: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ]
  const mockCreateOrderDto = {
    idUser: 1,
    idClient: 'client123',
    orderLines: [
      {
        idProduct: 101,
        price: 9.99,
        quantity: 2,
        total: 19.98,
      },
      {
        idProduct: 102,
        price: 14.99,
        quantity: 1,
        total: 14.99,
      },
    ],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    usersService = module.get<UsersService>(UsersService)
  })
  it('deberia estar definido', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('deberia retornar todos los usuarios', async () => {
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
      jest.spyOn(usersService, 'findAll').mockResolvedValue(testUsers)
      const result: any = await controller.findAll(paginateOptions)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.meta.totalPages).toEqual(1)
    })
  })
  describe('findOne', () => {
    it('deberia retornar un usuario', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser)
      const result: any = await controller.findOne(1)
      expect(result.id).toEqual(mockUser.id)
      expect(result.nombre).toEqual(mockUser.nombre)
      expect(result.apellidos).toEqual(mockUser.apellidos)
      expect(result.username).toEqual(mockUser.username)
    })
    it('debería lanzar NotFoundException porque el usuario no existe', async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('deberia crear un usuario', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser)
      const result: any = await controller.create(mockCreateUserDto)
      expect(result.id).toEqual(mockUser.id)
    })
    it('debería lanzar BadRequestException porque el usuario ya existe', async () => {
      jest.spyOn(usersService, 'create').mockRejectedValue(new Error())
      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(Error)
    })
  })
  describe('update', () => {
    it('deberia actualizar un usuario', async () => {
      jest.spyOn(usersService, 'update').mockResolvedValue(mockUser)
      const result: any = await controller.update(1, mockUpdateUserDto)
      expect(result.id).toEqual(mockUser.id)
    })
    it('debería lanzar NotFoundException porque el usuario no existe', async () => {
      jest
        .spyOn(usersService, 'update')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.update(1, mockUpdateUserDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('getProfile', () => {
    it('deberia retornar el perfil del usuario', async () => {
      const result: any = await controller.getProfile(mockRequest)
      expect(result.id).toEqual(mockUser.id)
    })
  })
  describe('deleteProfile', () => {
    it('deberia eliminar el perfil del usuario', async () => {
      await controller.deleteProfile(mockRequest)
    })
  })
  describe('updateProfile', () => {
    it('deberia actualizar el perfil del usuario', async () => {
      jest.spyOn(usersService, 'update').mockResolvedValue(mockUser)
      const result: any = await controller.updateProfile(
        mockRequest,
        mockUpdateUserDto,
      )
      expect(result.id).toEqual(mockUser.id)
    })
  })
  describe('deleteProfile', () => {
    it('deberia eliminar el perfil del usuario', async () => {
      await controller.deleteProfile(mockRequest)
    })
  })
  describe('getPedidos', () => {
    it('deberia retornar los pedidos del usuario', async () => {
      jest
        .spyOn(usersService, 'getPedidos')
        .mockResolvedValue(mockOrders as any)
      const result: any = await controller.getPedidos(mockRequest)
      expect(result).toEqual(mockOrders)
    })
  })
  describe('getPedido', () => {
    it('deberia retornar un pedido', async () => {
      jest.spyOn(usersService, 'getPedido').mockResolvedValue(mockOrders as any)
      const result: any = await controller.getPedido(mockRequest, '1')
      expect(result).toEqual(mockOrders)
    })
  })
  describe('createPedido', () => {
    it('deberia crear un pedido', async () => {
      jest
        .spyOn(usersService, 'createPedido')
        .mockResolvedValue(mockCreateOrderDto as any)
      const result: any = await controller.createPedido(
        mockCreateOrderDto,
        mockRequest,
      )
      expect(result).toEqual(mockCreateOrderDto)
    })
  })
  describe('updatePedido', () => {
    it('deberia actualizar un pedido', async () => {
      jest
        .spyOn(usersService, 'updatePedido')
        .mockResolvedValue(mockCreateOrderDto as any)
      const result: any = await controller.updatePedido(
        '1',
        mockCreateOrderDto,
        mockRequest,
      )
      expect(result).toEqual(mockCreateOrderDto)
    })
  })
  describe('deletePedido', () => {
    it('deberia eliminar un pedido', async () => {
      await controller.removePedido('1', mockRequest)
      expect(usersService.removePedido).toHaveBeenCalled()
    })
  })
})
