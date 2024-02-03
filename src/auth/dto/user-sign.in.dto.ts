import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * @description DTO para iniciar sesión
 */
export class UserSignInDto {
  @ApiProperty({ example: 'user', description: 'Nombre de usuario' })
  @IsNotEmpty({ message: 'Username no puede estar vacío' })
  username: string

  @ApiProperty({ example: 'password123', description: 'Contraseña' })
  @IsString({ message: 'Password no es válido' })
  @IsNotEmpty({ message: 'Password no puede estar vacío' })
  password: string
}
