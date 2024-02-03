import { Injectable } from '@nestjs/common'
import { User } from '../entities/user.entity'
import { UserDto } from '../dto/user-response.dto'
import { CreateUserDto } from '../dto/create-user.dto'
import { UserRole } from '../entities/user-role.entity'
import { v4 as uuidv4 } from 'uuid'

/**
 * @description Mapeador de usuarios
 */
@Injectable()
export class UsersMapper {
  /**
   * @description Mapea un usuario a un DTO
   * @param user Usuario
   */
  toResponseDto(user: User): UserDto {
    const userDto = new UserDto()
    userDto.id = user.id
    userDto.name = user.name
    userDto.surname = user.surname
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.roles = user.roles.map((role) => role.role)
    return userDto
  }

  /**
   * @description Mapea un usuario a un DTO con roles
   * @param user Usuario
   * @param roles Roles del usuario
   */
  toResponseDtoWithRoles(user: User, roles: UserRole[]): UserDto {
    const userDto = new UserDto()
    userDto.id = user.id
    userDto.name = user.name
    userDto.surname = user.surname
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.roles = roles.map((role) => role.role)
    return userDto
  }

  /**
   * @description Mapea un DTO a un usuario
   * @param createUserDto DTO para crear un usuario
   */
  toEntity(createUserDto: CreateUserDto): User {
    const user = new User()
    user.id = uuidv4()
    user.name = createUserDto.name
    user.surname = createUserDto.surname
    user.email = createUserDto.email
    user.username = createUserDto.username
    user.password = createUserDto.password
    user.createdAt = new Date()
    user.updatedAt = new Date()
    user.isDeleted = false
    return user
  }
}
