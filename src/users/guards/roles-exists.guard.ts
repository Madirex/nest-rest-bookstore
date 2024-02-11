import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { UsersService } from '../services/users.service'

/**
 * @description Guard para verificar que los roles de un usuario existen
 */
@Injectable()
export class RolesExistsGuard implements CanActivate {
  /**
   * @description Constructor del guard
   * @param usersService Servicio de usuarios
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * @description Método para verificar si los roles de un usuario existen
   * @param context Contexto de ejecución
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const roles = request.body.roles

    if (!roles || roles.length === 0) {
      throw new BadRequestException('El usuario debe tener al menos un rol')
    }

    if (!this.usersService.validateRoles(roles)) {
      throw new BadRequestException('El usuario tiene roles inválidos')
    }

    return true
  }
}
