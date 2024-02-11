import { ApiProperty } from '@nestjs/swagger'

/**
 * User response DTO
 */
export class UserDto {
  @ApiProperty({
    description: 'Identificador del usuario',
  })
  id: string

  @ApiProperty({
    description: 'El nombre del usuario',
  })
  name: string

  @ApiProperty({
    description: 'Los apellidos del usuario',
  })
  surname: string

  @ApiProperty({
    description: 'El email del usuario',
  })
  email: string

  @ApiProperty({
    description: 'El nombre de usuario',
  })
  username: string

  @ApiProperty({
    description: 'La fecha de creación del usuario',
  })
  createdAt: Date

  @ApiProperty({
    description: 'La fecha de actualización del usuario',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Si el usuario ha sido eliminado',
  })
  isDeleted: boolean

  @ApiProperty({
    description: 'Los roles del usuario',
  })
  roles: string[]
}
