import { Injectable } from '@nestjs/common'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { Role } from '../../users/entities/user-role.entity'
import { CreateUserDto } from '../../users/dto/create-user.dto'

/**
 * @description Mapeador de usuarios
 */
@Injectable()
export class AuthMapper {
  /**
   * @description Mapea un DTO de registro de usuario a un DTO de creación de usuario
   * @param userSignUpDto Dto de registro de usuario
   */
  toCreateDto(userSignUpDto: UserSignUpDto): CreateUserDto {
    const userCreateDto = new CreateUserDto()
    userCreateDto.name = userSignUpDto.name
    userCreateDto.surname = userSignUpDto.surname
    userCreateDto.username = userSignUpDto.username
    userCreateDto.email = userSignUpDto.email
    userCreateDto.password = userSignUpDto.password
    userCreateDto.roles = [Role.USER]
    return userCreateDto
  }
}
