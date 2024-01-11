import * as fs from 'fs'
import { BadRequestException } from '@nestjs/common'

/**
 * Clase Util
 */
export class Util {
  /**
   * Obtiene la fecha y hora actual en formato string
   */
  static getCurrentDateTimeString(): string {
    const date = new Date()
    const year = this.addLeadingZero(date.getFullYear().toString())
    const month = this.addLeadingZero((date.getMonth() + 1).toString())
    const day = this.addLeadingZero(date.getDate().toString())
    const hour = this.addLeadingZero(date.getHours().toString())
    const minute = this.addLeadingZero(date.getMinutes().toString())
    const second = this.addLeadingZero(date.getSeconds().toString())
    const millisecond = date.getMilliseconds().toString()
    return `${year}-${month}-${day}-${hour}-${minute}-${second}-${millisecond}`
  }

  /**
   * Añade un cero delante de un valor si es necesario
   * @param value Valor a comprobar
   * @private Método privado
   */
  private static addLeadingZero(value: string): string {
    return value.length === 1 ? `0${value}` : value
  }

  /**
   * Detecta el tipo de archivo a partir de los bytes
   * @param file Fichero
   */
  static detectFileType(file: Express.Multer.File): string {
    try {
      const fileContent = fs.readFileSync(file.path)
      const bytes = new Uint8Array(fileContent.subarray(0, 8))

      if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
        return 'image/jpeg'
      } else if (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      ) {
        return 'image/png'
      } else {
        throw new BadRequestException('Tipo de archivo no soportado.')
      }
    } catch (error) {
      throw new BadRequestException('Error al leer el contenido del archivo.')
    }
  }
}
