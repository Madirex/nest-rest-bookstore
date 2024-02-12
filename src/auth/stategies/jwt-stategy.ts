import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { User } from '../../users/entities/user.entity'
import { AuthService } from '../services/auth.service'

/**
 * @description Estrategia de autenticación con JWT
 */
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  /**
   * @description Constructor del servicio
   * @param authService Servicio de autenticación
   */
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(
        process.env.TOKEN_SECRET ||
          'secret_wepogu093jprgmrekl_34piu80gehriotg4',
        'utf-8',
      ).toString('base64'),
    })
  }

  /**
   * @description Valida el token
   * @param payload Payload
   */
  async validate(payload: User) {
    const id = payload.id
    return await this.authService.validateUser(id)
  }
}
