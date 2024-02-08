import {BadRequestException, Inject, Injectable, Logger, NotFoundException, Param} from "@nestjs/common";
import {BooksService} from "../../books/service/books.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Book} from "../../books/entities/book.entity";
import {Repository} from "typeorm";
import {StorageService} from "../../storage/storage.service";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager";
import {Publisher} from "../entities/publisher.entity";
import {PublisherMapper} from "../mappers/publisher.mapper";
import {FilterOperator, FilterSuffix, paginate, Paginated, PaginateQuery} from "nestjs-paginate";
import {hash} from "typeorm/util/StringUtils";
import {ResponsePublisherDto} from "../dto/response-publisher.dto";
import {NotificationType, WsNotification} from "../../websockets/notifications/notification.model";
import {CreatePublisherDto} from "../dto/create-publisher.dto";
import {PublishersNotificationsGateway} from "../../websockets/notifications/publishers-notification.gateway";
import {UpdatePublisherDto} from "../dto/update-publisher.dto";
import {Request} from "express";

@Injectable()
export class PublishersService {
    private readonly logger = new Logger(BooksService.name)

    constructor(
        @InjectRepository(Publisher)
        private readonly publisherRepository: Repository<Publisher>,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
        private readonly publisherMapper: PublisherMapper,
        private readonly storageService: StorageService,
        private readonly publishersNotificationsGateway: PublishersNotificationsGateway,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async findAll(query: PaginateQuery) {
        this.logger.log('Obteniendo todos los Publishers')

        // check cache
        const cache = await this.cacheManager.get(
            `all_publishers_page_${hash(JSON.stringify(query))}`,
        )
        if (cache) {
            this.logger.log('Cache hit')
            return cache
        }

        const queryBuilder = this.publisherRepository
            .createQueryBuilder('publisher')
            .leftJoinAndSelect('publisher.name', 'name')

        let pagination: Paginated<Publisher>
        try {
            pagination = await paginate(query, queryBuilder, {
                sortableColumns: ['name'],
                defaultSortBy: [['name', 'ASC']],
                searchableColumns: ['name'],
                filterableColumns: {
                    name: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
                    isActive: [FilterOperator.ILIKE, FilterSuffix.NOT, FilterOperator.EQ],
                },
            })
        } catch (error) {
            throw new BadRequestException(error.message)
        }

        const res = {
            data: (pagination.data ?? []).map((publisher) =>
                this.publisherMapper.toResponseDto(publisher),
            ),
            meta: pagination.meta,
            links: pagination.links,
        }

        // Guardamos en caché
        await this.cacheManager.set(
            `all_publishers_page_${hash(JSON.stringify(query))}`,
            res,
            60,
        )
        return res
    }

    async findOne(@Param('id') id: number): Promise<ResponsePublisherDto> {
        this.logger.log(`Obteniendo Publisher por id: ${id}`)

        // Caché
        const cache: ResponsePublisherDto = await this.cacheManager.get(`publisher_${id}`)
        if (cache) {
            console.log('Cache hit')
            this.logger.log('Cache hit')
            return cache
        }

        const isNumeric = !isNaN(Number(id))
        if (!id || !isNumeric) {
            throw new BadRequestException('ID no válido')
        }
        const publisher = await this.publisherRepository.findOne({
            where: { id }
        })

        if (!publisher) {
            throw new NotFoundException(`Publisher con ID: ${id} no encontrado`)
        }

        const res = this.publisherMapper.toResponseDto(publisher)

        // Se guarda en caché
        await this.cacheManager.set(`publisher_${id}`, res, 60)

        return res
    }

    async create(createPublisherDto: CreatePublisherDto): Promise<ResponsePublisherDto> {
        this.logger.log(`Creando Publisher con datos: ${JSON.stringify(createPublisherDto)}`)
        if (createPublisherDto.name) {
            const publisher = await this.getByName(createPublisherDto.name.trim())

            if (publisher) {
                this.logger.log(`El Publisher con nombre: ${publisher.name} ya existe`)
                throw new BadRequestException(
                    `El Publisher con el nombre ${publisher.name} ya existe`,
                )
            }
        }

        const publisher = this.publisherMapper.toEntity(createPublisherDto)

        const dto = this.publisherMapper.toResponseDto(publisher)
        this.onChange(NotificationType.CREATE, dto)


        const res = await this.publisherRepository.save({
            ...publisher,
        })

        // caché
        await this.invalidateCacheKey('all_publishers')

        return this.publisherMapper.toResponseDto(res)
    }

    async update(
        @Param('id') id: number,
        updatePublisherDto: UpdatePublisherDto,
    ): Promise<
        {
            id: number
            name: string
            image: string
            books: Book[]
            createdAt: Date
            updatedAt: Date
            isActive: boolean
        } & ResponsePublisherDto
    > {
        this.logger.log(
            `Actualizando Publisher con datos: ${JSON.stringify(updatePublisherDto)}`,
        )

        const isNumeric = !isNaN(Number(id))

        if (!id || !isNumeric) {
            throw new BadRequestException('ID no válido')
        }

        await this.findOne(id)
        const publisherToUpdate = await this.publisherRepository.findOne({
            where: { id },
        })

        if (!publisherToUpdate) {
            throw new NotFoundException(`Publisher con ID: ${id} no encontrado`)
        }

        if (publisherToUpdate.name) {
            const publisher = await this.getByName(updatePublisherDto.name.trim())

            if (publisher && publisher.id !== id) {
                this.logger.log(`Publisher con nombre: ${publisher.name} ya existe`)
                throw new BadRequestException(
                    `El Publisher con el nombre ${publisher.name} ya existe`,
                )
            }
        }

        const publisher = this.publisherMapper.updateToEntity(
            updatePublisherDto,
            publisherToUpdate,
        )

        const dto = this.publisherMapper.toResponseDto(publisher)

        this.onChange(NotificationType.UPDATE, dto)

        const res = await this.publisherRepository.save({
            ...publisherToUpdate,
            ...publisher,
        })

        // invalidar caché
        await this.invalidateCacheKey(`publisher_${id}`)
        await this.invalidateCacheKey('all_publishers')

        return this.publisherMapper.toResponseDto(res)
    }

    async remove(@Param('id') id: number): Promise<ResponsePublisherDto> {
        this.logger.log(`Eliminando Publisher con id: ${id}`)
        const isNumeric = !isNaN(Number(id))
        if (!id || !isNumeric) {
            throw new BadRequestException('ID no válido')
        }
        await this.findOne(id)
        const publisherToRemove = await this.publisherRepository.findOne({
            where: { id },
            relations: ['category'],
        })

        const dto = this.publisherMapper.toResponseDto(publisherToRemove)

        this.onChange(NotificationType.DELETE, dto)

        const res = await this.publisherRepository.save({
            ...publisherToRemove,
            isActive: false,
        })

        // invalidar caché
        await this.invalidateCacheKey(`publisher_${id}`)
        await this.invalidateCacheKey('all_publishers')

        return this.publisherMapper.toResponseDto(res)
    }

    async getByName(name: string) {
        const publisherOp = await this.publisherRepository
            .createQueryBuilder()
            .where('LOWER(name) = LOWER(:name)', {
                name: name.toLowerCase(),
            })
            .getOne()
        return this.publisherMapper.toResponseDto(publisherOp)
    }

    private onChange(type: NotificationType, data: ResponsePublisherDto) {
        const notification = new WsNotification<ResponsePublisherDto>(
            'Publishers',
            type,
            data,
            new Date(),
        )
        this.publishersNotificationsGateway.sendMessage(notification)
    }

    public async updateImage(
        id: number,
        file: Express.Multer.File,
        req: Request,
        withUrl: boolean = false,
    ) {
        this.logger.log(`Actualizando imagen Publisher por id: ${id}`)
        await this.findOne(id)
        const publisherToUpdate = await this.publisherRepository.findOne({
            where: { id },
        })

        if (publisherToUpdate.image !== Publisher.IMAGE_DEFAULT) {
            this.logger.log(`Borrando imagen ${publisherToUpdate.image}`)
            let imagePath = publisherToUpdate.image
            if (withUrl) {
                imagePath = this.storageService.getFileNameWithoutUrl(
                    publisherToUpdate.image,
                )
            }
            try {
                this.storageService.removeFile(imagePath)
            } catch (error) {
                this.logger.error(error)
            }
        }

        if (!file) {
            throw new BadRequestException('Fichero no encontrado.')
        }

        let filePath: string

        if (withUrl) {
            this.logger.log(`Generando url para ${file.filename}`)
            const apiVersion = process.env.API_VERSION
                ? `/${process.env.API_VERSION}`
                : '/v1'
            filePath = `${req.protocol}://${req.get('host')}${apiVersion}/storage/${
                file.filename
            }`
        } else {
            filePath = file.filename
        }

        publisherToUpdate.image = filePath

        const dto = this.publisherMapper.toResponseDto(publisherToUpdate)

        this.onChange(NotificationType.UPDATE, dto)

        const res = await this.publisherRepository.save(publisherToUpdate)

        // invalidar caché
        await this.invalidateCacheKey(`publisher_${id}`)
        await this.invalidateCacheKey('all_publishers')

        return this.publisherMapper.toResponseDto(res)
    }

    async invalidateCacheKey(keyPattern: string): Promise<void> {
        const cacheKeys = await this.cacheManager.store.keys()
        const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
        const promises = keysToDelete.map((key) => this.cacheManager.del(key))
        await Promise.all(promises)
    }
}
