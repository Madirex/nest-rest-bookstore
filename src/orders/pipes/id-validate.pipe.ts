import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { ObjectId } from 'mongodb'

/**
 * Pipe que verifica si el ID especificado es válido
 */
@Injectable()
export class IdValidatePipe implements PipeTransform {
  /**
   * Verifica si el ID especificado es válido
   * @param value El valor a transformar
   */
  transform(value: any) {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException(
        'El id especificado no es válido o no tiene el formato correcto',
      )
    }
    return value
  }
}
