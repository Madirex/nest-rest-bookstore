import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { OrdersService } from '../services/orders.service'

/**
 * Guard que verifica si el ID del usuario existe en el sistema
 */
@Injectable()
export class UserExistsGuard implements CanActivate {
  /**
   * Inicializa el servicio de pedidos
   * @param ordersService El servicio de pedidos
   */
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Verifica si el ID del usuario existe en el sistema
   * @param context El contexto de ejecución
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const body = request.body
    const userId = body.userId

    if (!userId) {
      throw new BadRequestException('El id del usuario es obligatorio')
    }

    if (!isNaN(userId)) {
      throw new BadRequestException('El id del usuario no es válido')
    }

    return this.ordersService.userExists(userId).then((exists) => {
      if (!exists) {
        throw new BadRequestException(
          'El Id no corresponde con ningún usuario en el sistema',
        )
      }
      return true
    })
  }
}
