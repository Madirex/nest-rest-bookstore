import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { StorageService } from './storage.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { Request, Response } from 'express'
import { Util } from '../util/util'

/**
 * Controlador de Storage
 */
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name)

  /**
   * Constructor
   * @param storageService Servicio de Storage
   */
  constructor(private readonly storageService: StorageService) {}

  /**
   * Sube un fichero
   * @param file Fichero
   * @param req Petición
   */
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const dateTime = Util.getCurrentDateTimeString()
          const uuid = req.params.uuid
          const fileExt = extname(file.originalname)
          cb(null, `${uuid}-${dateTime}${fileExt}`)
        },
      }),
      // Validación de archivos
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new BadRequestException('Fichero no soportado.'), false)
        } else {
          cb(null, true)
        }
      },
    }),
  )
  storeFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    this.logger.log(`Subiendo archivo:  ${file}`)

    if (!file) {
      throw new BadRequestException('Fichero no encontrado.')
    }

    const apiVersion = process.env.API_VERSION
      ? `/${process.env.API_VERSION}`
      : '/v1'
    const url = `${req.protocol}://${req.get('host')}${apiVersion}/storage/${
      file.filename
    }`
    return {
      originalname: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      url: url,
    }
  }

  /**
   * Obtiene un fichero
   * @param filename Nombre del fichero
   * @param res Respuesta
   */
  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    this.logger.log(`Buscando fichero ${filename}`)
    const filePath = this.storageService.findFile(filename)
    this.logger.log(`Fichero encontrado ${filePath}`)
    res.sendFile(filePath)
  }
}
