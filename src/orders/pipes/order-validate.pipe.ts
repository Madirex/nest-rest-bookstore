import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { OrdersOrderValues } from '../services/orders.service'

/**
 * Pipe que verifica si el pedido especificado es válido
 */
@Injectable()
export class OrderValidatePipe implements PipeTransform {
  /**
   * Verifica si el pedido especificado es válido
   * @param value El valor a transformar
   */
  transform(value: any) {
    value = value || OrdersOrderValues[0]
    if (!OrdersOrderValues.includes(value)) {
      throw new BadRequestException(
        `No se ha especificado un pedido válido: ${OrdersOrderValues.join(
          ', ',
        )}`,
      )
    }
    return value
  }
}
