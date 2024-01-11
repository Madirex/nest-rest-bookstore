import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { BooksService } from '../service/books.service'
import { CreateBookDto } from '../dto/create-book.dto'
import { UpdateBookDto } from '../dto/update-book.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { Request } from 'express'
import { Util } from '../../util/util'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'

/**
 * Controlador de Books
 */
@Controller('books')
@UseInterceptors(CacheInterceptor)
export class BooksController {
  private readonly logger = new Logger(BooksController.name)

  /**
   * Constructor
   * @param booksService Servicio de Books
   */
  constructor(private readonly booksService: BooksService) {}

  /**
   * Obtiene todos los Books
   * @returns Arreglo con todos los Books
   * @example http://localhost:3000/v1/books
   */
  @Get()
  @CacheKey('all_books')
  @CacheTTL(30)
  @HttpCode(200)
  async findAll() {
    this.logger.log('Obteniendo todos los Books')
    return await this.booksService.findAll()
  }

  /**
   * Obtiene un Book dado el ID
   * @param id Identificador del Book
   * @returns Book encontrado
   * @example http://localhost:3000/v1/books/1
   */
  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: number) {
    this.logger.log(`Obteniendo Book por id: ${id}`)
    return await this.booksService.findOne(id)
  }

  /**
   * Crea un Book
   * @param createBookDto DTO de creación de Book
   * @returns Book creado
   * @example http://localhost:3000/v1/books
   */
  @Post()
  @HttpCode(201)
  async create(@Body() createBookDto: CreateBookDto) {
    this.logger.log(`Creando Book con datos: ${JSON.stringify(createBookDto)}`)
    return await this.booksService.create(createBookDto)
  }

  /**
   * Actualiza un Book dado el ID
   * @param id Identificador del Book
   * @param updateBookDto DTO de actualización de Book
   * @returns Book actualizado
   * @example http://localhost:3000/v1/books/1
   */
  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: number, @Body() updateBookDto: UpdateBookDto) {
    this.logger.log(
      `Actualizando Book ${id} con datos: ${JSON.stringify(updateBookDto)}`,
    )
    return await this.booksService.update(id, updateBookDto)
  }

  /**
   * Elimina un Book dado el ID
   * @param id Identificador del Book
   * @returns Book eliminado
   * @example http://localhost:3000/v1/books/1
   */
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    this.logger.log(`Eliminando Book con id: ${id}`)
    return await this.booksService.remove(id)
  }

  /**
   * Actualiza la imagen de un Book
   * @param id Identificador del Book
   * @param file Fichero de imagen
   * @param req Request
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
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    this.logger.log(`Actualizando imagen al Book con id ${id}:  ${file}`)

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
    return await this.booksService.updateImage(id, file, req, true)
  }
}
