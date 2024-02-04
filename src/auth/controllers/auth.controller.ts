import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from '../services/auth.service'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { UserSignInDto } from '../dto/user-sign.in.dto'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

/**
 * @description Controlador de autenticación
 */
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  /**
   * @description Constructor del controlador
   * @param authService Servicio de autenticación
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * @description usado para registrar un nuevo usuario
   * @param userSignUpDto DTO de registro de usuario
   */
  @Post('signup')
  @ApiResponse({
    status: 201,
    description: 'Cuenta creada',
  })
  @ApiBody({
    description: 'Datos de la cuenta a crear',
    type: UserSignUpDto,
  })
  @ApiBadRequestResponse({
    description:
      'En algunos de los campos no es válido según la especificación del DTO',
  })
  async singUp(@Body() userSignUpDto: UserSignUpDto) {
    return await this.authService.singUp(userSignUpDto)
  }

  /**
   * @description usado para iniciar sesión
   * @param userSignInDto DTO de login de usuario
   */
  @Post('signin')
  @ApiResponse({
    status: 201,
    description: 'Inicio de sesión realizado',
  })
  @ApiBody({
    description: 'Datos de la cuenta a iniciar sesión',
    type: UserSignInDto,
  })
  @ApiBadRequestResponse({
    description:
      'Nombre o contraseña no válidos, según la especificación del DTO',
  })
  async singIn(@Body() userSignInDto: UserSignInDto) {
    return await this.authService.singIn(userSignInDto)
  }
}
