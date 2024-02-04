import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  Matches,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * @description DTO para crear un usuario
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'El nombre del usuario',
  })
  @IsNotEmpty({ message: 'Nombre no puede estar vacío' })
  name: string

  @ApiProperty({
    example: 'Doe',
    description: 'Los apellidos del usuario',
  })
  @IsNotEmpty({ message: 'Apellidos no puede estar vacío' })
  surname: string

  @ApiProperty({
    example: 'johndoe',
    description: 'El nombre de usuario',
  })
  @IsNotEmpty({ message: 'Username no puede estar vacío' })
  username: string

  @ApiProperty({
    example: 'example@example.com',
    description: 'El email del usuario',
  })
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email no puede estar vacío' })
  email: string

  @ApiProperty({
    example: ['admin', 'user'],
    description: 'Los roles del usuario',
    type: [String],
  })
  @IsArray({ message: 'Roles debe ser un array' })
  @ArrayNotEmpty({ message: 'Roles no puede estar vacío' })
  roles: string[]

  @ApiProperty({
    example: 'Password123',
    description: 'La contraseña del usuario',
  })
  @IsNotEmpty({ message: 'Password no puede estar vacío' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password no es válido, debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  })
  password: string
}
