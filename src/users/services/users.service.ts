import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { UsersMapper } from '../mappers/users.mapper'
import { CreateUserDto } from '../dto/create-user.dto'
import { Role, UserRole } from '../entities/user-role.entity'
import { BcryptService } from '../bcrypt.service'
import { UpdateUserDto } from '../dto/update-user.dto'
import { OrdersService } from '../../orders/services/orders.service'
import { v4 as uuidv4 } from 'uuid'
import { CreateOrderDto } from '../../orders/dto/CreateOrderDto'
import { UpdateOrderDto } from '../../orders/dto/UpdateOrderDto'
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate'

/**
 * @description Servicio de usuarios
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  /**
   * @description Constructor del servicio
   * @param usersRepository Repositorio de usuarios
   * @param userRoleRepository Repositorio de roles de usuarios
   * @param ordersService Servicio de orders
   * @param usersMapper Mapeador de usuarios
   * @param bcryptService Servicio de encriptación
   */
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly ordersService: OrdersService,
    private readonly usersMapper: UsersMapper,
    private readonly bcryptService: BcryptService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
  }

  /**
   * @description Devuelve todos los usuarios
   * @param query Query para paginar
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Obteniendo todos los usuarios')
    const res = await paginate(query, this.usersRepository, {
      sortableColumns: ['username', 'email', 'createdAt', 'updatedAt'],
      defaultSortBy: [['username', 'ASC']],
      searchableColumns: ['username', 'email', 'createdAt', 'updatedAt'],
      filterableColumns: {
        username: [FilterOperator.CONTAINS],
        email: [FilterOperator.CONTAINS],
        createdAt: [FilterOperator.GT, FilterOperator.LT],
        updatedAt: [FilterOperator.GT, FilterOperator.LT],
      },
    })
    return res
  }

  /**
   * @description Devuelve un usuario por su id
   * @param id Id del usuario
   */
  async findOne(id: string) {
    this.logger.log(`findOne: ${id}`)
    return this.usersMapper.toResponseDto(
      await this.usersRepository.findOneBy({ id }),
    )
  }

  /**
   * @description Crea un usuario
   * @param createUserDto DTO para crear un usuario
   */
  async create(createUserDto: CreateUserDto) {
    this.logger.log('create')
    const existingUser = await Promise.all([
      this.findByUsername(createUserDto.username),
      this.findByEmail(createUserDto.email),
    ])
    if (existingUser[0]) {
      throw new BadRequestException('username ya existe')
    }

    if (existingUser[1]) {
      throw new BadRequestException('email ya existe')
    }
    const hashPassword = await this.bcryptService.hash(createUserDto.password)

    const userEntity = this.usersMapper.toEntity(createUserDto)
    userEntity.password = hashPassword
    userEntity.id = uuidv4()
    const user = await this.usersRepository.save(userEntity)

    const roles = createUserDto.roles || [Role.USER]
    const userRoles = roles.map((role) => ({
      user: user,
      role: Role[role],
      id: uuidv4(),
    }))
    const savedUserRoles = await this.userRoleRepository.save(userRoles)

    return this.usersMapper.toResponseDtoWithRoles(user, savedUserRoles)
  }

  /**
   * @description Valida que los roles existan
   * @param roles Roles a validar
   */
  validateRoles(roles: string[]): boolean {
    return roles.every((role) => Role[role])
  }

  /**
   * @description Busca un usuario por su username
   * @param username Username del usuario
   */
  async findByUsername(username: string) {
    this.logger.log(`findByUsername: ${username}`)
    return await this.usersRepository.findOneBy({ username })
  }

  /**
   * @description Valida el password de un usuario
   * @param password Password a validar
   * @param hashPassword Password encriptado
   */
  async validatePassword(password: string, hashPassword: string) {
    this.logger.log(`validatePassword`)
    return await this.bcryptService.isMatch(password, hashPassword)
  }

  /**
   * @description Elimina un usuario por su id
   * @param userId Id del usuario
   */
  async deleteById(userId: string) {
    this.logger.log(`deleteUserById: ${userId}`)
    const user = await this.usersRepository.findOneBy({ id: userId })
    if (!user) {
      throw new NotFoundException(`User con id ${userId} no encontrado`)
    }
    const existsOrders = await this.ordersService.userExists(user.id)
    if (existsOrders) {
      user.updatedAt = new Date()
      user.isDeleted = true
      return await this.usersRepository.save(user)
    } else {
      for (const userRole of user.roles) {
        await this.userRoleRepository.remove(userRole)
      }
      return await this.usersRepository.delete({ id: user.id })
    }
  }

  /**
   * @description Actualiza un usuario por su id
   * @param id Id del usuario
   * @param updateUserDto DTO para actualizar un usuario
   * @param updateRoles Si se actualizan los roles
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    updateRoles: boolean = false,
  ) {
    this.logger.log(
      `UpdateUserProfileById: ${id} con ${JSON.stringify(updateUserDto)}`,
    )
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User con id ${id} no encontrado`)
    }
    if (updateUserDto.username) {
      const existingUser = await this.findByUsername(updateUserDto.username)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('username ya existe')
      }
    }
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('email ya existe')
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await this.bcryptService.hash(
        updateUserDto.password,
      )
    }
    const rolesBackup = [...user.roles]
    Object.assign(user, updateUserDto)

    if (updateRoles) {
      for (const userRole of rolesBackup) {
        await this.userRoleRepository.remove(userRole)
      }
      const roles = updateUserDto.roles || [Role.USER]
      const userRoles = roles.map((role) => ({
        user: user,
        role: Role[role],
        id: uuidv4(),
      }))
      user.roles = await this.userRoleRepository.save(userRoles)
    } else {
      user.roles = rolesBackup
    }

    const updatedUser = await this.usersRepository.save(user)

    return this.usersMapper.toResponseDto(updatedUser)
  }

  /**
   * @description Devuelve todos los pedidos de un usuario
   * @param id Id del usuario
   */
  async getOrders(id: string) {
    return await this.ordersService.findByUserId(id)
  }

  /**
   * @description Devuelve un pedido de un usuario
   * @param userId Id del usuario
   * @param idOrder Id del pedido
   */
  async getOrder(userId: string, idOrder: string) {
    const order = await this.ordersService.findOne(idOrder)
    if (order.userId != userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recurso',
      )
    }
    return order
  }

  /**
   * @description Crea un pedido
   * @param createOrderDto DTO para crear un pedido
   * @param userId Id del usuario
   */
  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    this.logger.log(`Creando order ${JSON.stringify(createOrderDto)}`)
    if (createOrderDto.userId != userId) {
      throw new BadRequestException(
        'El userId del libro que se está adquiriendo debe de ser el mismo que el usuario autenticado',
      )
    }
    return await this.ordersService.create(createOrderDto)
  }

  /**
   * @description Actualiza un pedido
   * @param id Id del pedido
   * @param updateOrderDto DTO para actualizar un pedido
   * @param userId Id del usuario
   */
  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId: string,
  ) {
    this.logger.log(
      `Actualizando order con id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )
    if (updateOrderDto.userId != userId) {
      throw new BadRequestException(
        'El userId del libro que se está adquiriendo debe de ser el mismo que el usuario autenticado',
      )
    }
    const order = await this.ordersService.findOne(id)
    if (order.userId != userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recurso',
      )
    }
    return await this.ordersService.update(id, updateOrderDto)
  }

  /**
   * @description Elimina un pedido
   * @param idOrder Id del pedido
   * @param userId Id del usuario
   */
  async removeOrder(idOrder: string, userId: string) {
    this.logger.log(`removeOrder: ${idOrder}`)
    const order = await this.ordersService.findOne(idOrder)
    if (order.userId != userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recurso',
      )
    }
    return await this.ordersService.remove(idOrder)
  }

  /**
   * @description Comprueba que el pedido sea correcto
   * @param email Email del usuario
   * @private Método privado
   */
  private async findByEmail(email: string) {
    this.logger.log(`findByEmail: ${email}`)
    return await this.usersRepository.findOneBy({ email })
  }
}
