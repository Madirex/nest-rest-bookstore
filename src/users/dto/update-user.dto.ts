import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * @description DTO para actualizar un usuario
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'John',
    description: 'El nombre del usuario',
  })
  @IsOptional()
  name: string

  @ApiProperty({
    example: 'Doe',
    description: 'Los apellidos del usuario',
  })
  @IsOptional()
  surname: string

  @ApiProperty({
    example: 'johndoe',
    description: 'El nombre de usuario',
  })
  @IsOptional()
  username: string

  @ApiProperty({
    example: 'example@example.com',
    description: 'El email del usuario',
  })
  @IsOptional()
  email: string

  @ApiProperty({
    example: ['admin', 'user'],
    description: 'Los roles del usuario',
    type: [String],
  })
  @IsOptional()
  roles: string[]

  @ApiProperty({
    example: 'Password123',
    description: 'La contraseña del usuario',
  })
  @IsOptional()
  password: string

  @ApiProperty({
    example: true,
    description: 'Si el usuario ha sido eliminado',
  })
  @IsOptional()
  isDeleted: boolean
}
