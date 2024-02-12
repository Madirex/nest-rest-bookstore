import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

/**
 * @description Guardia para validar el token
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * @description Valida el token
   * @param context Contexto
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context)
  }
}
