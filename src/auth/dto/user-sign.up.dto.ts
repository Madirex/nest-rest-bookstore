import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * @description DTO para registrar usuario
 */
export class UserSignUpDto {
  @ApiProperty({ example: 'Ángel', description: 'Nombre' })
  @IsNotEmpty({ message: 'Nombre no puede estar vacío' })
  @IsString({ message: 'Nombre no es válido' })
  name: string

  @ApiProperty({ example: 'Madi', description: 'Apellidos' })
  @IsNotEmpty({ message: 'Apellidos no puede estar vacío' })
  @IsString({ message: 'Apellidos no es válido' })
  surname: string

  @ApiProperty({ example: 'Madi32', description: 'Nombre de usuario' })
  @IsNotEmpty({ message: 'Username no puede estar vacío' })
  @IsString({ message: 'Username no es válido' })
  username: string

  @ApiProperty({ example: 'contact@example.com', description: 'Correo' })
  @IsEmail({}, { message: 'Email no es válido' })
  @IsNotEmpty({ message: 'Email no puede estar vacío' })
  email: string

  @ApiProperty({ example: 'Password123', description: 'Contraseña' })
  @IsString({ message: 'Password no es válido' })
  @IsNotEmpty({ message: 'Password no puede estar vacío' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password no es válido, debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  })
  password: string
}
