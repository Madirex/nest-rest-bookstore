import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { OrdersOrderByValues } from '../services/orders.service'

@Injectable()
export class OrderByValidatePipe implements PipeTransform {
  transform(value: any) {
    // Lógica para verificar si el orderBy es válido: meter aquí la lógica
    value = value || OrdersOrderByValues[0]
    if (!OrdersOrderByValues.includes(value)) {
      throw new BadRequestException(
        `No se ha especificado un campo para ordenar válido: ${OrdersOrderByValues.join(
          ', ',
        )}`,
      )
    }
    return value
  }
}
