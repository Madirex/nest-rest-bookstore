import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { OrdersOrderValues } from '../services/orders.service'

@Injectable()
export class OrderValidatePipe implements PipeTransform {
  transform(value: any) {
    value = value || OrdersOrderValues[0]
    if (!OrdersOrderValues.includes(value)) {
      throw new BadRequestException(
        `No se ha especificado un orden válido: ${OrdersOrderValues.join(
          ', ',
        )}`,
      )
    }
    return value
  }
}
