import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, NotFoundException } from '@nestjs/common'
import * as request from 'supertest'
import { CacheModule } from '@nestjs/cache-manager'
import { UsersController } from '../../../src/users/controllers/users.controller'
import { UsersService } from '../../../src/users/services/users.service'
import { JwtAuthGuard } from '../../../src/auth/guards/jwt-auth.guard'
import { RolesAuthGuard } from '../../../src/auth/guards/roles-auth.guard'

describe('UsersController (e2e)', () => {
  let app: INestApplication
  const usersServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }
  const userId = '123e4567-e89b-12d3-a456-426614174000'
  const user = {
    id: userId,
    name: 'Nombre',
    surname: 'Apellido',
    email: 'correo@ejemplo.com',
    username: 'nombreusuario',
    password: 'contraseña',
    createdAt: '2023-02-10T00:00:00.000Z',
    updatedAt: '2023-02-10T00:00:00.000Z',
    isDeleted: false,
    roles: [{ role: 'Admin' }, { role: 'User' }],
  }
  const updatedUser = {
    name: 'John',
    surname: 'Doe',
    username: 'johndoe',
    email: 'example@example.com',
    roles: ['admin', 'user'],
    password: 'Password123',
    isDeleted: true,
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: () => true },
        },
        {
          provide: RolesAuthGuard,
          useValue: { canActivate: () => true },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Esto permite que todas las solicitudes pasen el JwtAuthGuard
      .overrideGuard(RolesAuthGuard)
      .useValue({ canActivate: () => true }) // Esto permite que todas las solicitudes pasen el RolesAuthGuard
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /users', () => {
    it('debería retornar todos los usuarios', async () => {
      const testUsers = [{ id: '1', name: 'User Test' }]
      usersServiceMock.findAll.mockResolvedValue(testUsers)

      await request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect(testUsers)
    })
  })
  describe('POST /users', () => {
    it('debería crear un nuevo usuario', async () => {
      const createUserDto = { name: 'New User', email: 'new@example.com' }
      const createdUser = { id: '2', ...createUserDto }
      usersServiceMock.create.mockResolvedValue(createdUser)

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect(createdUser)
    })
  })
  describe('GET /users/:id', () => {
    it('debería retornar un usuario por su ID', async () => {
      usersServiceMock.findOne.mockResolvedValue(user)

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect(user)
    })
  })
  it('debería retornar un error 400 si el usuario no es valido', async () => {
    const userId = null
    usersServiceMock.findOne.mockResolvedValue(null)
    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(400)
  })

  describe('PUT /users/:id', () => {
    it('debería actualizar un usuario', async () => {

      usersServiceMock.update.mockResolvedValue(updatedUser)

      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updatedUser)
        .expect(200)
        .expect(updatedUser)
    })

    it('debería retornar un error 400 si el usuario no es valido', async () => {
      const userId = null
      usersServiceMock.update.mockResolvedValue(null)

      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updatedUser)
        .expect(400)
    })
  })

  describe('DELETE /users/:id', () => {
    it('debería eliminar un usuario', async () => {
      usersServiceMock.remove.mockResolvedValue(userId)

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204)
    })

    it('debería retornar un error 404 si el usuario a eliminar no existe', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174110'
      usersServiceMock.remove.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(404)
    })
  })
})
