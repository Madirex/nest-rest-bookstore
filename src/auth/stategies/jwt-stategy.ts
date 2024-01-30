import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../auth.service'
import { Usuario } from '../../users/entities/user.entity'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(
        process.env.TOKEN_SECRET || 'secret',
        'utf-8',
      ).toString('base64'),
    })
  }

  // Si se valida obtenemos el role
  async validate(payload: Usuario) {
    const id = payload.id
    return await this.authService.validateUser(id)
  }
}
