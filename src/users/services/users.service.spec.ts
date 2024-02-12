import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { User } from '../entities/user.entity'
import { UsersMapper } from '../mappers/users.mapper'
import { BcryptService } from '../bcrypt.service'
import { OrdersService } from '../../orders/services/orders.service'
import { UserRole } from '../entities/user-role.entity'
import { CreateUserDto } from '../dto/create-user.dto'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { UpdateUserDto } from '../dto/update-user.dto'
import { v4 as uuidv4 } from 'uuid'
import { Paginated } from 'nestjs-paginate'

describe('UsersService', () => {
  let service: UsersService
  let usersRepositoryMock: any
  let userRoleRepositoryMock: any
  let ordersServiceMock: any
  let usersMapperMock: any
  let bcryptServiceMock: any
  const uuid = uuidv4()

  const paginateOptions = {
    page: 1,
    limit: 10,
    path: 'books',
  }
  const testUser = {
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
  } as Paginated<User>
  const mockQueryBuilder = {
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([testUser, 1]),
  }
  beforeEach(async () => {
    usersRepositoryMock = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    }

    userRoleRepositoryMock = {
      save: jest.fn(),
      remove: jest.fn(),
    }

    ordersServiceMock = {
      getOrdersByUser: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      userExists: jest.fn(),
      findByUserId: jest.fn(),
    }

    usersMapperMock = {
      toResponseDto: jest.fn(),
      toEntity: jest.fn(),
      toResponseDtoWithRoles: jest.fn(),
    }

    bcryptServiceMock = {
      hash: jest.fn(),
      isMatch: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: userRoleRepositoryMock,
        },
        {
          provide: OrdersService,
          useValue: ordersServiceMock,
        },
        {
          provide: UsersMapper,
          useValue: usersMapperMock,
        },
        {
          provide: BcryptService,
          useValue: bcryptServiceMock,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest
        .spyOn(usersRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(service, 'findAll').mockResolvedValue(testUser)
      const result = await service.findAll(paginateOptions)
      expect(result).toEqual(testUser)
      expect(result.meta.totalItems).toEqual(1)
      expect(result.meta.currentPage).toEqual(1)
    })
  })
  describe('findById', () => {
    it('should return a user by id', async () => {
      const userId = 'some_id'
      const mockUser = { id: userId, roles: [] }

      jest.spyOn(usersRepositoryMock, 'findOneBy').mockResolvedValue(mockUser)
      jest.spyOn(usersMapperMock, 'toResponseDto').mockReturnValue(mockUser)
      const result = await service.findOne(userId)

      expect(result).toEqual(mockUser)
    })
    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'some_id'
      jest.spyOn(usersRepositoryMock, 'findOneBy').mockResolvedValue(null)
      await expect(service.findOne(userId)).rejects.toThrowError(
        NotFoundException,
      )
    })
    it('should throw BadRequestException if user id is not valid', async () => {

      await expect(service.findOne('')).rejects.toThrowError(
        BadRequestException,
      )
    })
  })

  describe('create', () => {
    it('should create a user and return the user with roles', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        surname: 'Doe',
        username: 'john_doe',
        email: 'john@example.com',
        roles: ['USER'],
        password: 'Password123',
      }

      const hashPassword = 'hashedPassword'
      const mockUserEntity = {
        id: 'some_id',
        ...createUserDto,
        password: hashPassword,
      }
      const mockUser = { ...mockUserEntity, roles: [] }
      const mockUserRoles = [
        {
          user: mockUser,
          role: 'USER',
          id: '9cfafed2-2c18-46b1-ade4-22e04e9fb40f',
        },
      ]

      usersRepositoryMock.findOneBy.mockResolvedValue(null)
      usersRepositoryMock.save.mockResolvedValue(mockUserEntity)
      jest.spyOn(usersMapperMock, 'toEntity').mockReturnValue(mockUserEntity) // Añadido el spy aquí
      bcryptServiceMock.hash.mockResolvedValue(hashPassword)
      userRoleRepositoryMock.save.mockResolvedValue(mockUserRoles)
      usersMapperMock.toResponseDtoWithRoles.mockImplementation(
        (user, roles) => ({ ...user, roles }),
      )

      const result = await service.create(createUserDto)

      expect(usersRepositoryMock.findOneBy).toHaveBeenCalledTimes(2)
      expect(usersRepositoryMock.save).toHaveBeenCalledWith(mockUserEntity)
      expect(usersMapperMock.toEntity).toHaveBeenCalledWith(createUserDto) // Verificamos el uso de toEntity
      expect(bcryptServiceMock.hash).toHaveBeenCalledWith(
        createUserDto.password,
      )
      expect(userRoleRepositoryMock.save).toHaveBeenCalled()
      expect(usersMapperMock.toResponseDtoWithRoles).toHaveBeenCalledWith(
        mockUserEntity,
        mockUserRoles,
      )
      expect(result).toEqual({ ...mockUserEntity, roles: mockUserRoles })
    })
    it('should throw BadRequestException if user already exists', async () => {
      jest.spyOn(usersRepositoryMock, 'findOneBy').mockResolvedValue({})
      await expect(service.create({} as CreateUserDto)).rejects.toThrowError(
        BadRequestException,
      )
    })
  })

  describe('deleteById', () => {
    it('should delete a user by id', async () => {
      const userId = 'some_id'
      const mockUserEntity = { id: userId, roles: [] }

      usersRepositoryMock.findOneBy.mockResolvedValue(mockUserEntity)
      ordersServiceMock.userExists.mockResolvedValue(false)
      usersRepositoryMock.save.mockResolvedValue(mockUserEntity)

      await service.deleteById(userId)

      expect(usersRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: userId })
      expect(ordersServiceMock.userExists).toHaveBeenCalledWith(userId)
    })

    it('should delete a user and associated roles if orders exist', async () => {
      const userId = 'some_id'
      const mockUserEntity = { id: userId, roles: [{ id: 'roleId' }] }

      usersRepositoryMock.findOneBy.mockResolvedValue(mockUserEntity)
      ordersServiceMock.userExists.mockResolvedValue(true)
      userRoleRepositoryMock.remove.mockResolvedValue(true)
      usersRepositoryMock.delete.mockResolvedValue(true)

      await service.deleteById(userId)

      expect(usersRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: userId })
      expect(ordersServiceMock.userExists).toHaveBeenCalledWith(userId)
    })

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'some_id'

      usersRepositoryMock.findOneBy.mockResolvedValue(null)

      await expect(service.deleteById(userId)).rejects.toThrowError(
        NotFoundException,
      )
    })
  })

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const userId = 'some_id'
      const updateUserDto = {
        name: 'new_user',
        surname: 'new_surname',
        username: 'new_username',
        email: 'new_email',
        password: 'new_password',
        roles: ['USER'],
        isDeleted: false,
      } as UpdateUserDto
      const userEntity = { id: userId, roles: [] }

      usersRepositoryMock.findOneBy.mockResolvedValue(userEntity)
      usersRepositoryMock.save.mockImplementation(async (user) => {
        const updatedUser = Object.assign({}, user, updateUserDto)
        return Promise.resolve(updatedUser)
      })

      await service.update(userId, updateUserDto)

      expect(usersRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: userId })
      expect(usersRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining(userEntity),
      )
    })

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'some_id'
      const updateUserDto = {
        name: 'new_user',
        surname: 'new_surname',
        username: 'new_username',
        email: 'new_email',
        password: 'new_password',
        roles: ['USER'],
        isDeleted: false,
      }

      usersRepositoryMock.findOneBy.mockResolvedValue(null)

      await expect(service.update(userId, updateUserDto)).rejects.toThrowError(
        NotFoundException,
      )
    })
  })

  describe('getOrders', () => {
    it('should return orders for a user', async () => {
      const userId = 'some_id'
      const expectedOrders = [{ id: '1' }, { id: '2' }]

      jest
        .spyOn(ordersServiceMock, 'findByUserId')
        .mockResolvedValue(expectedOrders)

      const result = await service.getOrders(userId)

      expect(result).toEqual(expectedOrders)
    })
  })

  describe('getOrder', () => {
    it('should return an order for a user if user has permission', async () => {
      const userId = 'user_id'
      const orderId = 'order_id'
      const order = { userId, id: orderId }

      ordersServiceMock.findOne.mockResolvedValue(order)

      const result = await service.getOrder(userId, orderId)

      expect(ordersServiceMock.findOne).toHaveBeenCalledWith(orderId)
      expect(result).toEqual(order)
    })

    it('should throw ForbiddenException if user does not have permission', async () => {
      const userId = 'user_id'
      const orderId = 'order_id'
      const order = { userId: 'another_user_id', id: orderId }

      ordersServiceMock.findOne.mockResolvedValue(order)

      await expect(service.getOrder(userId, orderId)).rejects.toThrowError(
        ForbiddenException,
      )
    })
  })

  describe('createOrder', () => {
    it('should create an order for a user', async () => {
      const createOrderDto = {
        userId: 'user_id',
        product: 'Product A',
        clientId: uuid,
        orderLines: [],
      }
      const expectedOrder = { id: '1', ...createOrderDto }

      ordersServiceMock.create.mockResolvedValue(expectedOrder)

      const result = await service.createOrder(
        createOrderDto,
        createOrderDto.userId,
      )

      expect(ordersServiceMock.create).toHaveBeenCalledWith(createOrderDto)
      expect(result).toEqual(expectedOrder)
    })

    it('should throw BadRequestException if userId does not match the authenticated user', async () => {
      const createOrderDto = {
        userId: 'user_id',
        product: 'Product A',
        clientId: uuid,
        orderLines: [],
      }

      await expect(
        service.createOrder(createOrderDto, 'another_user_id'),
      ).rejects.toThrowError(BadRequestException)
    })
  })

  describe('updateOrder', () => {
    it('should update an order for a user', async () => {
      const orderId = 'order_id'
      const updateOrderDto = {
        userId: 'user_id',
        product: 'Product A',
        clientId: uuid,
        orderLines: [],
      }
      const userId = 'user_id'
      const order = { id: orderId, userId, product: 'Product A' }

      ordersServiceMock.findOne.mockResolvedValue(order)
      ordersServiceMock.update.mockResolvedValue({
        ...order,
        ...updateOrderDto,
      })

      const result = await service.updateOrder(orderId, updateOrderDto, userId)

      expect(ordersServiceMock.findOne).toHaveBeenCalledWith(orderId)
      expect(ordersServiceMock.update).toHaveBeenCalledWith(
        orderId,
        updateOrderDto,
      )
      expect(result).toEqual({ ...order, ...updateOrderDto })
    })

    it('should throw BadRequestException if userId does not match the user of the order', async () => {
      const orderId = 'order_id'
      const updateOrderDto = {
        userId: 'user_id',
        product: 'Product A',
        clientId: uuid,
        orderLines: [],
      }
      const userId = 'user_id'
      const order = { id: orderId, userId, product: 'Product A' }

      ordersServiceMock.findOne.mockResolvedValue(order)

      await expect(
        service.updateOrder(orderId, updateOrderDto, 'another_user_id'),
      ).rejects.toThrowError(BadRequestException)
    })

    it('should throw ForbiddenException if user does not have permission to update the order', async () => {
      const orderId = 'order_id'
      const updateOrderDto = {
        userId: 'user_id',
        product: 'Product A',
        clientId: uuid,
        orderLines: [],
      }
      const userId = 'user_id'
      const order = {
        id: orderId,
        userId: 'another_user_id',
        product: 'Product A',
      }

      ordersServiceMock.findOne.mockResolvedValue(order)

      await expect(
        service.updateOrder(orderId, updateOrderDto, userId),
      ).rejects.toThrowError(ForbiddenException)
    })
  })

  describe('removeOrder', () => {
    it('should remove an order for a user', async () => {
      const orderId = 'order_id'
      const userId = 'user_id'
      const order = { id: orderId, userId, product: 'Product A' }

      ordersServiceMock.findOne.mockResolvedValue(order)
      ordersServiceMock.remove.mockResolvedValue(true)

      const result = await service.removeOrder(orderId, userId)

      expect(ordersServiceMock.findOne).toHaveBeenCalledWith(orderId)
      expect(ordersServiceMock.remove).toHaveBeenCalledWith(orderId)
      expect(result).toEqual(true)
    })

    it('should throw ForbiddenException if user does not have permission to remove the order', async () => {
      const orderId = 'order_id'
      const userId = 'user_id'
      const order = {
        id: orderId,
        userId: 'another_user_id',
        product: 'Product A',
      }

      ordersServiceMock.findOne.mockResolvedValue(order)

      await expect(service.removeOrder(orderId, userId)).rejects.toThrowError(
        ForbiddenException,
      )
    })
  })

  describe('validateRoles', () => {
    it('should return true if all roles exist', () => {
      const roles = ['USER', 'ADMIN']
      const result = service.validateRoles(roles)
      expect(result).toBe(true)
    })

    it('should return false if any role does not exist', () => {
      const roles = ['USER', 'INVALID_ROLE']
      const result = service.validateRoles(roles)
      expect(result).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should return true if password is valid', async () => {
      const password = 'TestPassword123'
      const hashPassword = 'hashedPassword'

      bcryptServiceMock.isMatch.mockResolvedValue(true)

      const result = await service.validatePassword(password, hashPassword)

      expect(bcryptServiceMock.isMatch).toHaveBeenCalledWith(
        password,
        hashPassword,
      )
      expect(result).toBe(true)
    })

    it('should return false if password is not valid', async () => {
      const password = 'InvalidPassword'
      const hashPassword = 'hashedPassword'

      bcryptServiceMock.isMatch.mockResolvedValue(false)

      const result = await service.validatePassword(password, hashPassword)

      expect(bcryptServiceMock.isMatch).toHaveBeenCalledWith(
        password,
        hashPassword,
      )
      expect(result).toBe(false)
    })
  })

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const username = 'test_user'
      const mockUser = { id: '1', username, roles: [] }

      usersRepositoryMock.findOneBy.mockResolvedValue(mockUser)

      const result = await service.findByUsername(username)

      expect(result).toEqual(mockUser)
    })

    it('should return null if user is not found by username', async () => {
      const username = 'nonexistent_user'

      usersRepositoryMock.findOneBy.mockResolvedValue(null)

      const result = await service.findByUsername(username)

      expect(result).toBeNull()
    })
  })
})
