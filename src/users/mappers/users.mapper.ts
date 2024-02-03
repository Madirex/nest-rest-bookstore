import { Injectable } from '@nestjs/common'
import { User } from '../entities/user.entity'
import { UserDto } from '../dto/user-response.dto'
import { CreateUserDto } from '../dto/create-user.dto'
import { UserRole } from '../entities/user-role.entity'

@Injectable()
export class UserMapper {
  toResponseDto(user: User): UserDto {
    const userDto = new UserDto()
    userDto.id = user.id
    userDto.nombre = user.nombre
    userDto.apellidos = user.apellidos
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.roles = user.roles.map((role) => role.role)
    return userDto
  }

  toResponseDtoWithRoles(user: User, roles: UserRole[]): UserDto {
    const userDto = new UserDto()
    userDto.id = user.id
    userDto.nombre = user.nombre
    userDto.apellidos = user.apellidos
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.roles = roles.map((role) => role.role)
    return userDto
  }

  toEntity(createUserDto: CreateUserDto): User {
    const usuario = new User()
    usuario.nombre = createUserDto.name
    usuario.apellidos = createUserDto.surnames
    usuario.email = createUserDto.email
    usuario.username = createUserDto.username
    usuario.password = createUserDto.password
    usuario.createdAt = new Date()
    usuario.updatedAt = new Date()
    usuario.isDeleted = false
    return usuario
  }
}
