import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AuthController } from '../../../src/auth/controllers/auth.controller'
import { AuthService } from '../../../src/auth/services/auth.service'
import { UserSignUpDto } from '../../../src/auth/dto/user-sign.up.dto'
import { UserSignInDto } from '../../../src/auth/dto/user-sign.in.dto'
import { BadRequestException, INestApplication } from '@nestjs/common'

describe('AuthController (e2e)', () => {
  let app: INestApplication

  const signupDto: UserSignUpDto = {
    name: 'Madi',
    surname: 'Land',
    username: 'Madirex',
    email: '',
    password: 'Test1234sfsdg',
  }

  const signinDto: UserSignInDto = {
    username: 'Madirex',
    password: 'Test1234sfsdg',
  }

  const mockAuthService = {
    singUp: jest.fn().mockResolvedValue(Promise.resolve()),
    singIn: jest.fn().mockResolvedValue(Promise.resolve()),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /auth/signup', () => {
    it('should create a new user', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201)

      expect(mockAuthService.singUp).toHaveBeenCalledWith(signupDto)
    })
  })

  describe('POST /auth/signin', () => {
    it('should authenticate a user', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(signinDto)
        .expect(201)

      expect(mockAuthService.singIn).toHaveBeenCalledWith(signinDto)
    })

    it('should handle incorrect credentials', async () => {
      mockAuthService.singIn.mockRejectedValue(new BadRequestException())

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(signinDto)
        .expect(400)

      expect(mockAuthService.singIn).toHaveBeenCalledWith(signinDto)
    })
  })
})
