import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from '../services/auth.service'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { UserSignInDto } from '../dto/user-sign.in.dto'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService

  const authServiceMock = {
    singUp: jest.fn(),
    singIn: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('singUp', () => {
    it('should call authService.singUp with the provided userSignUpDto', async () => {
      const userSignUpDto: UserSignUpDto = {
        name: 'Madi',
        surname: 'Land',
        username: 'madirex',
        email: 'madirex@madirex.com',
        password: 'Password123',
      }

      jest.spyOn(authService, 'singUp').mockResolvedValue(Promise.resolve(null))

      await controller.singUp(userSignUpDto)

      expect(authService.singUp).toHaveBeenCalledWith(userSignUpDto)
    })
  })

  describe('singIn', () => {
    it('should call authService.singIn with the provided userSignInDto', async () => {
      const userSignInDto: UserSignInDto = {
        username: 'madirex',
        password: 'Password123',
      }

      jest.spyOn(authService, 'singIn').mockResolvedValue(Promise.resolve(null))

      await controller.singIn(userSignInDto)

      expect(authService.singIn).toHaveBeenCalledWith(userSignInDto)
    })
  })
})
