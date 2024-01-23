import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { CreateClientDto } from '../dto/create-client.dto'
import { UpdateClientDto } from '../dto/update-client.dto'
import { ClientService } from '../service/client.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { Util } from '../../util/util'
import { extname } from 'path'
import { Request } from 'express'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

/**
 * Controlador de Client
 */
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /**
   * Obtiene todos los Client
   * @param query
   * @returns Arreglo con todos los Client
   * @example http://localhost:3000/v1/client
   */
  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.clientService.findAll(query)
  }

  /**
   * Obtiene un Client dado el ID
   * @param id Identificador del Client
   * @returns Client encontrado
   * @example http://localhost:3000/v1/client/1
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientService.findOne(id)
  }

  /**
   * Obtiene un Client dado el email
   * @param email Email del Client
   * @returns Client encontrado
   * @example http://localhost:3000/v1/client/email/1
   */
  @Get('/email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.clientService.findByEmail(email)
  }

  /**
   * Crea un nuevo Client
   * @param createClientDto Datos del Client a crear
   * @returns Client creado
   * @example http://localhost:3000/v1/client
   */
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto)
  }

  /**
   * Actualiza la imagen de un Client
   * @param id Identificador del Client
   * @param file Archivo de imagen
   * @param req Request
   * @returns Client actualizado
   * @example http://localhost:3000/v1/client/image/{uuid}
   */
  @Patch('/image/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const dateTime = Util.getCurrentDateTimeString()
          const uuid = req.params.id
          const fileName = `${uuid}-${dateTime}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
    }),
  )
  async updateImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const allowedMimes = ['image/jpeg', 'image/png']
    const maxFileSizeInBytes = 1024 * 1024 // 1 megabyte
    if (file === undefined) throw new BadRequestException('Fichero no enviado')
    else if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Fichero no soportado. No es del tipo imagen válido',
      )
    } else if (file.mimetype != Util.detectFileType(file)) {
      throw new BadRequestException(
        'Fichero no soportado. No es del tipo imagen válido',
      )
    } else if (file.size > maxFileSizeInBytes) {
      throw new BadRequestException(
        `El tamaño del archivo no puede ser mayor a ${maxFileSizeInBytes} bytes.`,
      )
    }

    return await this.clientService.updateImage(id, file, req, false)
  }

  /**
   * Actualiza un Client dado el ID
   * @param id Identificador del Client
   * @param updateClientDto Datos del Client a actualizar
   * @returns Client actualizado
   * @example http://localhost:3000/v1/client/1
   */
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.update(id, updateClientDto)
  }

  /**
   * Elimina un Client dado el ID
   * @param id Identificador del Client
   * @returns Client eliminado
   * @example http://localhost:3000/v1/client/1
   */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientService.remove(id)
  }
}