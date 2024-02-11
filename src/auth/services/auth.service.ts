import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { UserSignInDto } from '../dto/user-sign.in.dto'
import { UsersService } from '../../users/services/users.service'
import { JwtService } from '@nestjs/jwt'
import { AuthMapper } from '../mappers/auth.mapper'

/**
 * @description Servicio de autenticación
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  /**
   * @description Constructor del servicio
   * @param usersService Servicio de usuarios
   * @param authMapper Mapeador de autenticación
   * @param jwtService Servicio de JWT
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly authMapper: AuthMapper,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @description Registra un usuario
   * @param userSignUpDto DTO de registro de usuario
   */
  async singUp(userSignUpDto: UserSignUpDto) {
    this.logger.log(`singUp ${userSignUpDto.username}`)
    const user = await this.usersService.create(
      this.authMapper.toCreateDto(userSignUpDto),
    )
    return this.getAccessToken(user.id)
  }

  /**
   * @description Loguea un usuario
   * @param userSignInDto DTO de login de usuario
   */
  async singIn(userSignInDto: UserSignInDto) {
    this.logger.log(`singIn ${userSignInDto.username}`)
    const user = await this.usersService.findByUsername(userSignInDto.username)
    if (!user) {
      throw new BadRequestException('el usuario o la contraseña no son válidos')
    }
    const isValidPassword = await this.usersService.validatePassword(
      userSignInDto.password,
      user.password,
    )
    if (!isValidPassword) {
      throw new BadRequestException('el usuario o la contraseña no son válidos')
    }
    return this.getAccessToken(user.id)
  }

  /**
   * @description Valida un usuario
   * @param id Identificador del usuario
   */
  async validateUser(id: string) {
    this.logger.log(`validateUser ${id}`)
    return await this.usersService.findOne(id)
  }

  /**
   * @description Genera un token de acceso
   * @param userId Identificador del usuario
   * @private Método privado
   */
  private getAccessToken(userId: string) {
    this.logger.log(`getAccessToken ${userId}`)
    try {
      const payload = {
        id: userId,
      }
      const access_token = this.jwtService.sign(payload)
      return {
        access_token,
      }
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException('Error al generar el token')
    }
  }
}
