import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from '../services/auth.service'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { UserSignInDto } from '../dto/user-sign.in.dto'

/**
 * @description Controlador de autenticación
 */
@Controller('auth')
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
  async singUp(@Body() userSignUpDto: UserSignUpDto) {
    return await this.authService.singUp(userSignUpDto)
  }

  /**
   * @description usado para iniciar sesión
   * @param userSignInDto DTO de login de usuario
   */
  @Post('signin')
  async singIn(@Body() userSignInDto: UserSignInDto) {
    return await this.authService.singIn(userSignInDto)
  }
}
