import {Test, TestingModule} from "@nestjs/testing";
import {ClientController} from "./client.controller";
import {ClientService} from "../service/client.service";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Client} from "../entities/client.entity";
import {ResponseClientDto} from "../dto/response-client.dto";
import {Address} from "../../common/address.entity";
import {Paginated} from "nestjs-paginate";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {CreateClientDto} from "../dto/create-client.dto";
import {UpdateClientDto} from "../dto/update-client.dto";


describe('ClientController', () => {
    let controller: ClientController
    let service: ClientService


    const address: Address = {
        street: 'street',
        number: '2',
        city: 'city',
        province: 'province',
        country: 'country',
        postalCode: '28970',
    }

    let mockClientService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        updateImage: jest.fn()
    }


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClientController],
            providers: [
                {provide: ClientService, useValue: mockClientService},
                {
                    provide: CACHE_MANAGER,
                    useValue: {},
                }
            ],
        }).compile()

        controller = module.get<ClientController>(ClientController)
        service = module.get<ClientService>(ClientService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })


    describe('findAll', () => {
        const clients: ResponseClientDto[] = []
        const clientDto = new ResponseClientDto()


        beforeEach(() => {
            clientDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
            clientDto.name = 'name'
            clientDto.surname = 'surname'
            clientDto.email = 'email@gmail.com'
            clientDto.phone = '644441297'
            clientDto.address = address
            clients.push(clientDto)
        })

        it('should return an array of clients', async () => {
            const resTest = new Paginated<ResponseClientDto>()
            resTest.data = clients

            const paginatedOptions = {
                page: 1,
                limit: 10,
                path: 'client'
            }

            jest.spyOn(service, 'findAll').mockResolvedValue(resTest)

            const result : any = await controller.findAll(paginatedOptions)
            expect(result.data[0].id).toBe(clientDto.id)
            expect(result.data[0].name).toBe(clientDto.name)
            expect(result.data[0].surname).toBe(clientDto.surname)
            expect(result.data[0].email).toBe(clientDto.email)
            expect(result.data[0].phone).toBe(clientDto.phone)
            expect(result.data[0].address).toBe(clientDto.address)
        })
    })

    describe('findOne', () => {
        const clientDto = new ResponseClientDto()
        const id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'

        beforeEach(() => {
            clientDto.id = id
            clientDto.name = 'name'
            clientDto.surname = 'surname'
            clientDto.email = 'email@gmail.com'
            clientDto.phone = '644441297'
            clientDto.address = address
        })


        it('should return a client', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(clientDto)
            const result: any = await controller.findOne(id)

            expect(result.id).toBe(clientDto.id)
            expect(result.name).toBe(clientDto.name)
            expect(result.surname).toBe(clientDto.surname)
            expect(result.email).toBe(clientDto.email)
            expect(result.phone).toBe(clientDto.phone)
            expect(result.address).toBe(clientDto.address)
        })

        it('should return notfound exception', async () => {
            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())

            const result: any = controller.findOne(id)

            await expect(result).rejects.toThrow(NotFoundException)
        })
    })

    describe('findOneByEmail', () => {
        const clientDto = new ResponseClientDto()
        const email = 'email@gmail.com'

        beforeEach(() => {
            clientDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
            clientDto.name = 'name'
            clientDto.surname = 'surname'
            clientDto.email = email
            clientDto.phone = '644441297'
            clientDto.address = address
        })

        it('should return a client', async () => {
            jest.spyOn(service, 'findByEmail').mockResolvedValue(clientDto)
            const result: any = await controller.findOneByEmail(email)

            expect(result.id).toBe(clientDto.id)
            expect(result.name).toBe(clientDto.name)
            expect(result.surname).toBe(clientDto.surname)
            expect(result.email).toBe(clientDto.email)
            expect(result.phone).toBe(clientDto.phone)
            expect(result.address).toBe(clientDto.address)
        })

        it('should return notfound exception', async () => {
            jest.spyOn(service, 'findByEmail').mockRejectedValue(new NotFoundException())

            const result: any = controller.findOneByEmail(email)

            await expect(result).rejects.toThrow(NotFoundException)
        })
    })

    describe('create', () => {
        const clientDto = new ResponseClientDto()
        const createClientDto = new CreateClientDto()

        beforeEach(() => {
            clientDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
            clientDto.name = 'name'
            clientDto.surname = 'surname'
            clientDto.email = 'email@gmail.com'
            clientDto.phone = '644441297'
            clientDto.address = address

            createClientDto.name = 'name'
            createClientDto.surname = 'surname'
            createClientDto.email = 'email@gmail.com'
            createClientDto.phone = '644441297'
            createClientDto.address = address
        })

        it('should create a client', async () => {
            jest.spyOn(service, 'create').mockResolvedValue(clientDto)
            const result: any = await controller.create(createClientDto)

            expect(result.id).toBe(clientDto.id)
            expect(result.name).toBe(clientDto.name)
            expect(result.surname).toBe(clientDto.surname)
            expect(result.email).toBe(clientDto.email)
            expect(result.phone).toBe(clientDto.phone)
            expect(result.address).toBe(clientDto.address)
        })

        it('should return AlreadyExist', async () => {
            jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())

            const result: any = controller.create(createClientDto)

            await expect(result).rejects.toThrow(BadRequestException)
        })
    })

    describe('update', () => {
        const clientDto = new ResponseClientDto()
        const id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
        const updateClientDto = new UpdateClientDto()

        beforeEach(() => {
            clientDto.id = id
            clientDto.name = 'name'
            clientDto.surname = 'surname'
            clientDto.email = 'email@gmai.com'
            clientDto.phone = '644441297'
            clientDto.address = address

            updateClientDto.name = 'name'
            updateClientDto.surname = 'surname'
            updateClientDto.email = 'email@gmai.com'
            updateClientDto.phone = '644441297'
            updateClientDto.address = address
        })

        it('should update a client', async () => {
            jest.spyOn(service, 'update').mockResolvedValue(clientDto)
            const result: any = await controller.update(id, updateClientDto)

            expect(result.id).toBe(clientDto.id)
            expect(result.name).toBe(clientDto.name)
            expect(result.surname).toBe(clientDto.surname)
            expect(result.email).toBe(clientDto.email)
            expect(result.phone).toBe(clientDto.phone)
            expect(result.address).toBe(clientDto.address)
        })

        it('should return notfound exception client', async () => {
            jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())

            const result: any = controller.update(id, updateClientDto)

            await expect(result).rejects.toThrow(NotFoundException)
        })

        it('should return AlreadyExist', async () => {
            jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException())

            const result: any = controller.update(id, updateClientDto)

            await expect(result).rejects.toThrow(BadRequestException)
        })

    })

    describe('remove', () => {
        const id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'


        it('should remove a client', async () => {
            jest.spyOn(service, 'remove').mockResolvedValue()
            const result: any = await controller.remove(id)

            expect(result).toBe(undefined)
        })

        it('should return notfound exception client', async () => {
            jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())

            const result: any = controller.remove(id)

            await expect(result).rejects.toThrow(NotFoundException)
        })
    })


    describe('updateImage', () => {
        const id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
        const file = {
            originalname: 'file.png',
            mimetype: 'image/png',
            buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        } as Express.Multer.File;
        const mockReq = {} as any;

        it('should throw BadRequestException for unsupported file type', async () => {
            const invalidFile = {
                originalname: 'test.exe',
                mimetype: 'image/exe',
                buffer: Buffer.from([0x4d, 0x5a]), // Mocking an EXE file
            } as Express.Multer.File;

            jest.spyOn(service, 'updateImage').mockRejectedValue(new BadRequestException());

            await expect(controller.updateImage(id, invalidFile, mockReq)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException for file size exceeding limit', async () => {
            const largeFile = {
                originalname: 'large.png',
                mimetype: 'image/png',
                buffer: Buffer.alloc(1024 * 1024 + 1), // Creating a buffer larger than 1MB
            } as Express.Multer.File;

            jest.spyOn(service, 'updateImage').mockRejectedValue(new BadRequestException());

            await expect(controller.updateImage(id, largeFile, mockReq)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException for undefined file', async () => {
            jest.spyOn(service, 'updateImage').mockRejectedValue(new BadRequestException());

            await expect(controller.updateImage(id, undefined, mockReq)).rejects.toThrow(BadRequestException);
        });
    })


})