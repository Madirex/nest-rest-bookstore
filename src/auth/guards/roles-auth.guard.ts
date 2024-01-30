import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesAuthGuard implements CanActivate {
  private readonly logger = new Logger(RolesAuthGuard.name)

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    this.logger.log(`Roles: ${roles}`)
    if (!roles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user
    this.logger.log(`User roles: ${user.roles}`)
    const hasRole = () => user.roles.some((role) => roles.includes(role))
    return user && user.roles && hasRole()
  }
}
export const Roles = (...roles: string[]) => SetMetadata('roles', roles)
