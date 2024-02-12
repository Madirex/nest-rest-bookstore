import {INestApplication} from "@nestjs/common";
import {CreateClientDto} from "../../../src/client/dto/create-client.dto";
import {UpdateClientDto} from "../../../src/client/dto/update-client.dto";
import {Client} from "../../../src/client/entities/client.entity";
import {Address} from "../../../src/common/address.entity";
import {Test, TestingModule} from "@nestjs/testing";
import {CACHE_MANAGER, CacheInterceptor, CacheModule} from "@nestjs/cache-manager";
import {ClientController} from "../../../src/client/controller/client.controller";
import {ClientService} from "../../../src/client/service/client.service";
import * as request from 'supertest'
import {JwtAuthGuard} from "../../../src/auth/guards/jwt-auth.guard";
import {RolesAuthGuard} from "../../../src/auth/guards/roles-auth.guard";

describe('ClientsController (e2e)', () => {
    let app: INestApplication
    let cacheManager: Cache
    const endpoint = '/client'
    const simulatedDate = new Date('2021-01-01T00:00:00.000Z')

    const address: Address = {
        street: 'street',
        number: '2',
        city: 'city',
        province: 'province',
        country: 'country',
        postalCode: '28970',
    }


    const testClients: Client[] = []
    const client = new Client()
    client.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
    client.name = 'name'
    client.surname = 'surname'
    client.email = 'email@gmail.com'
    client.phone = '644441297'
    client.address = address
    testClients.push(client)

    const createClientDto: CreateClientDto = new CreateClientDto()
    createClientDto.name = 'name'
    createClientDto.surname = 'surname'
    createClientDto.email = 'email@gmail.com'
    createClientDto.phone = '644441297'
    createClientDto.address = address


    const updateClientDto: UpdateClientDto = new UpdateClientDto()
    updateClientDto.name = 'name'
    updateClientDto.surname = 'surname'
    updateClientDto.email = 'email@gmail.com'
    updateClientDto.phone = '644441297'
    updateClientDto.address = address


    const mockClientsService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        updateImage: jest.fn(),
    }

    const cacheManagerMock = {
        get: jest.fn(() => Promise.resolve()),
        set: jest.fn(() => Promise.resolve()),
        store: {
        keys: jest.fn(() => []),
        },
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [CacheModule.register()],
        controllers: [ClientController],
        providers: [
            {
            provide: ClientService,
            useValue: mockClientsService,
            },
            {
            provide: CACHE_MANAGER,
            useValue: cacheManagerMock,
            },
        ],
        })

            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideInterceptor(CacheInterceptor)
            .useValue({}).compile()

        app = moduleFixture.createNestApplication()
        cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER)
        await app.init()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(app).toBeDefined()
    })

    afterAll(async () => {
        await app.close()
    })

    describe('GET /clients', () => {
        it('should return an array of clients', async () => {
        mockClientsService.findAll.mockResolvedValue(testClients)

        const response = await request(app.getHttpServer()).get(endpoint).expect(200)

        expect(response.status).toBe(200)
        expect(response.body).toEqual(testClients)
        })
    })

    describe('GET /clients/:id', () => {
        it('should return a client', async () => {
        mockClientsService.findOne.mockResolvedValue(testClients[0])

        const response = await request(app.getHttpServer()).get(`${endpoint}/${testClients[0].id}`).expect(200)

        expect(response.status).toBe(200)
        expect(response.body).toEqual(testClients[0])
        })
    })

    describe('POST /clients', () => {
        it('should create a client', async () => {
        mockClientsService.create.mockResolvedValue(testClients[0])

        const response = await request(app.getHttpServer()).post(endpoint).send(createClientDto).expect(201)

        expect(response.status).toBe(201)
        expect(response.body).toEqual(testClients[0])
        })
    })

    describe('PUT /clients/:id', () => {
        it('should update a client', async () => {
        mockClientsService.update.mockResolvedValue(testClients[0])

        const response = await request(app.getHttpServer()).put(`${endpoint}/${testClients[0].id}`).send(updateClientDto).expect(200)

        expect(response.status).toBe(200)
        expect(response.body).toEqual(testClients[0])
        })
    })

    describe('DELETE /clients/:id', () => {
        it('should delete a client', async () => {
        mockClientsService.remove.mockResolvedValue(testClients[0])

        const response = await request(app.getHttpServer()).delete(`${endpoint}/${testClients[0].id}`).expect(200)

        expect(response.status).toBe(200)
        expect(response.body).toEqual(testClients[0])
        })
    })

    describe('GET /clients/email/:email', () => {
        it('should return a client', async () => {
        mockClientsService.findByEmail.mockResolvedValue(testClients[0])

        const response = await request(app.getHttpServer()).get(`${endpoint}/email/${testClients[0].email}`).expect(200)

        expect(response.status).toBe(200)
        expect(response.body).toEqual(testClients[0])
        })
    })

    describe('PATCH /clients/image/:id', () => {
        it('debería dar error porque la imagen es un jpg falso', async () => {
            const file = Buffer.from('file')

            const response = await request(app.getHttpServer())
            .patch(`${endpoint}/image/${testClients[0].id}`)
            .attach('file', file, 'image.jpg')
            .set('Content-Type', 'multipart/form-data')
            .expect(400)
        })
    })
})