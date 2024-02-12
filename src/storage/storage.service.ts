import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { join } from 'path'

/**
 * Servicio de almacenamiento de ficheros
 */
@Injectable()
export class StorageService {
  private readonly uploadsDir = process.env.UPLOADS_DIR || './storage-dir'
  private readonly isDev = process.env.NODE_ENV === 'dev'
  private readonly logger = new Logger(StorageService.name)

  /**
   * Elimina los ficheros de la carpeta de subida de archivos
   */
  async onModuleInit() {
    if (this.isDev) {
      if (fs.existsSync(this.uploadsDir)) {
        this.logger.log(`Eliminando ficheros de ${this.uploadsDir}`)
        fs.readdirSync(this.uploadsDir).forEach((file) => {
          fs.unlinkSync(path.join(this.uploadsDir, file))
        })
      } else {
        this.logger.log(
          `Creando directorio de subida de archivos en ${this.uploadsDir}`,
        )
        fs.mkdirSync(this.uploadsDir)
      }
    }
  }

  /**
   * Busca un fichero en la carpeta de subida de archivos
   * @param filename Nombre del fichero
   */
  findFile(filename: string): string {
    this.logger.log(`Buscando fichero ${filename}`)
    const file = join(
      process.cwd(),
      process.env.UPLOADS_DIR || './storage-dir',
      filename,
    )
    if (fs.existsSync(file)) {
      this.logger.log(`Fichero encontrado ${file}`)
      return file
    } else {
      throw new NotFoundException(`El fichero ${filename} no existe.`)
    }
  }

  /**
   * Obtiene el nombre del fichero sin la URL
   * @param fileUrl URL del fichero
   */
  getFileNameWithoutUrl(fileUrl: string): string {
    try {
      const url = new URL(fileUrl)
      const pathname = url.pathname
      const segments = pathname.split('/')
      return segments[segments.length - 1]
    } catch (error) {
      this.logger.error(error)
      return fileUrl
    }
  }

  /**
   * Elimina un fichero de la carpeta de subida de archivos
   * @param filename Nombre del fichero
   */
  removeFile(filename: string): void {
    this.logger.log(`Eliminando fichero ${filename}`)
    const file = join(
      process.cwd(),
      process.env.UPLOADS_DIR || './storage-dir',
      filename,
    )
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    } else {
      throw new NotFoundException(`El fichero ${filename} no existe.`)
    }
  }
}
