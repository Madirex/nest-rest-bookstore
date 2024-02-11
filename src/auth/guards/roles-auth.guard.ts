import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

/**
 * @description Guardia para validar roles
 */
@Injectable()
export class RolesAuthGuard implements CanActivate {
  private readonly logger = new Logger(RolesAuthGuard.name)

  /**
   * @description Constructor del guardia
   * @param reflector Reflector
   */
  constructor(private reflector: Reflector) {}

  /**
   * @description Valida los roles
   * @param context Contexto
   */
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    this.logger.log(`Roles: ${roles}`)
    if (!roles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user
    this.logger.log(`User roles: ${user.roles}`)
    const hasRole = () =>
      user.roles.some((role: string) => roles.includes(role))
    return user && user.roles && hasRole()
  }
}

/**
 * @description Decorador para roles
 * @param roles Roles
 * @constructor Decorador
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles)
