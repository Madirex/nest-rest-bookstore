import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { PublisherService } from '../services/publishers.service'
import { CreatePublisherDto } from '../dto/create-publisher.dto'
import { UpdatePublisherDto } from '../dto/update-publisher.dto'
import { Util } from '../../util/util'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../../auth/guards/roles-auth.guard'
import { Request } from 'express'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

/**
 * Controlador de Publishers
 */
@Controller('publishers')
export class PublishersController {
  /**
   * Constructor del controlador
   * @param publisherService Servicio de Publishers
   */
  constructor(private readonly publisherService: PublisherService) {}

  /**
   * Obtiene todas las editoriales
   * @param query Query con los parámetros de paginación
   */
  @ApiResponse({
    status: 200,
    description: 'Lista de editoriales',
  })
  @ApiQuery({
    description: 'Filtro por límite por página',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por página',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de búsqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de búsqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  @Roles('USER', 'ADMIN')
  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.publisherService.findAll(query)
  }

  /**
   * Crea una nueva editorial
   * @param createPublisherDto DTO de creación de la editorial
   */
  @ApiResponse({
    status: 201,
    description: 'La editorial ha sido creada',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la editorial',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Editorial no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la editorial no es válido',
  })
  @HttpCode(201)
  @Roles('ADMIN')
  @Post()
  create(@Body() createPublisherDto: CreatePublisherDto) {
    return this.publisherService.create(createPublisherDto)
  }

  /**
   * Obtiene una editorial dado el ID
   * @param id Identificador de la editorial
   */
  @ApiResponse({
    status: 200,
    description: 'Editorial encontrada',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la editorial',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Editorial no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la editorial no es válido',
  })
  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.publisherService.findOne(+id)
  }

  /**
   * Actualiza una editorial
   * @param id Identificador de la editorial
   * @param updatePublisherDto DTO de actualización de la editorial
   */
  @ApiResponse({
    status: 200,
    description: 'Editorial actualizada',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la editorial',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Editorial no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la editorial no es válido',
  })
  @HttpCode(200)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePublisherDto: UpdatePublisherDto,
  ) {
    return this.publisherService.update(+id, updatePublisherDto)
  }

  /**
   * Elimina una editorial
   * @param id Identificador de la editorial
   */
  @ApiResponse({
    status: 200,
    description: 'Editorial eliminada',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la editorial',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Editorial no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la editorial no es válido',
  })
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.publisherService.remove(+id)
  }

  /**
   * Actualiza la imagen de la editorial
   * @param id Identificador de la editorial
   * @param file Archivo de imagen
   * @param req Request
   */
  @ApiResponse({
    status: 200,
    description: 'Imagen de la editorial actualizada',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la editorial',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Editorial no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'El id de la editorial no es válido',
  })
  @Patch('/image/:id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const dateTime = Util.getCurrentDateTimeString()
          const uuid = req.params.id
          const fileName = `publisher-${uuid}-${dateTime}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
    }),
  )
  async updateImage(
    @Param('id') id: number,
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
    } else if (file.size > maxFileSizeInBytes) {
      throw new BadRequestException(
        `El tamaño del archivo no puede ser mayor a ${maxFileSizeInBytes} bytes.`,
      )
    }

    return await this.publisherService.updateImage(id, file, req, false)
  }
}
