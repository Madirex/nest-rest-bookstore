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
    Put, Req, UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import {CacheInterceptor, CacheKey, CacheTTL} from "@nestjs/cache-manager";
import {BooksService} from "../../books/service/books.service";
import {Paginate, PaginateQuery} from "nestjs-paginate";
import {CreateBookDto} from "../../books/dto/create-book.dto";
import {UpdateBookDto} from "../../books/dto/update-book.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {Util} from "../../util/util";
import {extname} from "path";
import {Request} from "express";
import {PublishersService} from "../service/publishers.service";
import {CreatePublisherDto} from "../dto/create-publisher.dto";
import {UpdatePublisherDto} from "../dto/update-publisher.dto";

@Controller('publishers')
@UseInterceptors(CacheInterceptor)
export class PublishersController {
    private readonly logger = new Logger(PublishersController.name)

    /**
     * Constructor
     * @param publishersService Servicio de Publisher
     */
    constructor(private readonly publishersService: PublishersService) {}

    /**
     * Obtiene todos los Publishers
     * @param query Query de paginación
     */
    @Get()
    @CacheKey('all_publishers')
    @CacheTTL(30)
    @HttpCode(200)
    async findAll(@Paginate() query: PaginateQuery) {
        this.logger.log('Obteniendo todos los Publishers')
        return await this.publishersService.findAll(query)
    }

    /**
     * Obtiene un Publisher dado el ID
     * @param id Identificador del Publisher
     * @returns Publisher encontrado
     */
    @Get(':id')
    @HttpCode(200)
    async findOne(@Param('id') id: number) {
        this.logger.log(`Obteniendo Publisher por id: ${id}`)
        return await this.publishersService.findOne(id)
    }

    /**
     * Crea un Publisher
     * @param createPublisherDto DTO de creación de Publisher
     * @returns Publisher
     */
    @Post()
    @HttpCode(201)
    async create(@Body() createPublisherDto: CreatePublisherDto) {
        this.logger.log(`Creando Publisher con datos: ${JSON.stringify(createPublisherDto)}`)
        return await this.publishersService.create(createPublisherDto)
    }

    /**
     * Actualiza un Publisher dado el ID
     * @param id Identificador del Publisher
     * @param updatePublisherDto DTO de actualización de Publisher
     * @returns Publisher
     */
    @Put(':id')
    @HttpCode(200)
    async update(@Param('id') id: number, @Body() updatePublisherDto: UpdatePublisherDto) {
        this.logger.log(
            `Actualizando Publisher ${id} con datos: ${JSON.stringify(updatePublisherDto)}`,
        )
        return await this.publishersService.update(id, updatePublisherDto)
    }

    /**
     * Elimina un Publisher dado el ID
     * @param id Identificador del Publisher
     * @returns Publisher
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: number) {
        this.logger.log(`Eliminando Publisher con id: ${id}`)
        return await this.publishersService.remove(id)
    }

    /**
     * Actualiza la imagen de un Publisher
     * @param id Id del Publisher
     * @param file Archivo de imagen
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
        this.logger.log(`Actualizando imagen al Publisher con id ${id}:  ${file}`)

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
        return await this.publishersService.updateImage(id, file, req, false)
    }
}