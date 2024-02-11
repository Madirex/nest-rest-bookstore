import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { OrdersOrderByValues } from '../services/orders.service'

/**
 * Pipe que verifica si el pedido especificado es válido
 */
@Injectable()
export class OrderByValidatePipe implements PipeTransform {
  /**
   * Verifica si el pedido especificado es válido
   * @param value El valor a transformar
   */
  transform(value: any) {
    value = value || OrdersOrderByValues[0]
    if (!OrdersOrderByValues.includes(value)) {
      throw new BadRequestException(
        `No se ha especificado un pedido válido: ${OrdersOrderByValues.join(
          ', ',
        )}`,
      )
    }
    return value
  }
}
