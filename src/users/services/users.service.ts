import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Usuario } from '../entities/user.entity'
import { UsuariosMapper } from '../mappers/usuarios.mapper'
import { CreateUserDto } from '../dto/create-user.dto'
import { Role, UserRole } from '../entities/user-role.entity'
import { BcryptService } from './bcrypt.service'
import { UpdateUserDto } from '../dto/update-user.dto'
import { OrdersService } from '../../orders/services/orders.service'
import { CreateOrderDto } from '../../orders/dto/CreateOrderDto'
import { UpdateOrderDto } from '../../orders/dto/UpdateOrderDto'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly pedidosService: OrdersService,
    private readonly usuariosMapper: UsuariosMapper,
    private readonly bcryptService: BcryptService,
  ) {}

  async findAll() {
    this.logger.log('findAll')
    return (await this.usuariosRepository.find()).map((u) =>
      this.usuariosMapper.toResponseDto(u),
    )
  }

  async findOne(id: number) {
    this.logger.log(`findOne: ${id}`)

    const user = await this.usuariosRepository.findOneBy({ id })

    if (!user) {
      throw new NotFoundException(`User #${id} not found`)
    }

    return this.usuariosMapper.toResponseDto(user)
  }

  async create(createUserDto: CreateUserDto) {
    this.logger.log('create')
    const existingUser = await Promise.all([
      this.findByUsername(createUserDto.username),
      this.findByEmail(createUserDto.email),
    ])
    if (existingUser[0]) {
      throw new BadRequestException('username already exists')
    }

    if (existingUser[1]) {
      throw new BadRequestException('email already exists')
    }
    const hashPassword = await this.bcryptService.hash(createUserDto.password)

    const usuario = this.usuariosMapper.toEntity(createUserDto)
    usuario.password = hashPassword
    const user = await this.usuariosRepository.save(usuario)
    const roles = createUserDto.roles || [Role.USER]
    const userRoles = roles.map((role) => ({ usuario: user, role: Role[role] }))
    const savedUserRoles = await this.userRoleRepository.save(userRoles)

    return this.usuariosMapper.toResponseDtoWithRoles(user, savedUserRoles)
  }

  validateRoles(roles: string[]): boolean {
    return roles.every((role) => Role[role])
  }

  async findByUsername(username: string) {
    this.logger.log(`findByUsername: ${username}`)
    return await this.usuariosRepository.findOneBy({ username })
  }

  async validatePassword(password: string, hashPassword: string) {
    this.logger.log(`validatePassword`)
    return await this.bcryptService.isMatch(password, hashPassword)
  }

  async deleteById(idUser: number) {
    this.logger.log(`deleteUserById: ${idUser}`)
    const user = await this.usuariosRepository.findOneBy({ id: idUser })
    if (!user) {
      throw new NotFoundException(`User not found with id ${idUser}`)
    }
    const existsPedidos = await this.pedidosService.userExists(user.id)
    if (existsPedidos) {
      user.updatedAt = new Date()
      user.isDeleted = true
      return await this.usuariosRepository.save(user)
    } else {
      for (const userRole of user.roles) {
        await this.userRoleRepository.remove(userRole)
      }
      return await this.usuariosRepository.delete({ id: user.id })
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    updateRoles: boolean = false,
  ) {
    this.logger.log(
      `updateUserProfileById: ${id} with ${JSON.stringify(updateUserDto)}`,
    )
    const user = await this.usuariosRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User not found with id ${id}`)
    }
    if (updateUserDto.username) {
      const existingUser = await this.findByUsername(updateUserDto.username)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('username already exists')
      }
    }
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('email already exists')
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
        usuario: user,
        role: Role[role],
      }))
      user.roles = await this.userRoleRepository.save(userRoles)
    } else {
      user.roles = rolesBackup
    }

    const updatedUser = await this.usuariosRepository.save(user)

    return this.usuariosMapper.toResponseDto(updatedUser)
  }

  async getPedidos(id: number) {
    return await this.pedidosService.findByIdUser(id)
  }

  async getPedido(idUser: number, idPedido: string) {
    const pedido = await this.pedidosService.findOne(idPedido)
    console.log(pedido.idUser)
    console.log(idUser)
    if (pedido.idUser != idUser) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recursos',
      )
    }
    return pedido
  }

  async createPedido(createPedidoDto: CreateOrderDto, userId: number) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    if (createPedidoDto.idUser != userId) {
      throw new BadRequestException(
        'El id del IdUsuario debe ser el mismo que el del usuario autenticado',
      )
    }
    return await this.pedidosService.create(createPedidoDto)
  }

  async updatePedido(
    id: string,
    updatePedidoDto: UpdateOrderDto,
    userId: number,
  ) {
    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(updatePedidoDto)}`,
    )
    if (updatePedidoDto.idUser != userId) {
      throw new BadRequestException(
        'El id del IdUsuario debe ser el mismo que el del usuario autenticado.',
      )
    }
    const pedido = await this.pedidosService.findOne(id)
    if (pedido.idUser != userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recursos',
      )
    }
    return await this.pedidosService.update(id, updatePedidoDto)
  }

  async removePedido(idPedido: string, userId: number) {
    this.logger.log(`removePedido: ${idPedido}`)
    const pedido = await this.pedidosService.findOne(idPedido)
    if (pedido.idUser != userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recursos',
      )
    }
    return await this.pedidosService.remove(idPedido)
  }

  private async findByEmail(email: string) {
    this.logger.log(`findByEmail: ${email}`)
    return await this.usuariosRepository.findOneBy({ email })
  }
}
