import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersService } from '../../users/services/users.service'
import { JwtService } from '@nestjs/jwt'
import { AuthMapper } from '../mappers/auth.mapper'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { UserSignInDto } from '../dto/user-sign.in.dto'
import { User } from '../../users/entities/user.entity'
import { UserDto } from '../../users/dto/user-response.dto'

jest.mock('../../users/services/users.service')

describe('AuthService', () => {
  let authService: AuthService
  let usersService: UsersService
  let jwtService: JwtService

  const mockUser: User = {
    id: 'some_id',
    name: 'Madi',
    surname: 'Land',
    username: 'Madirex',
    email: '',
    password: '',
    roles: [],
    roleNames: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  }

  const userDto: UserDto = {
    id: 'some_id',
    name: 'Madi',
    surname: 'Land',
    username: 'Madirex',
    email: '',
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersService, JwtService, AuthMapper],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(UsersService)
    jwtService = module.get<JwtService>(JwtService)
  })

  describe('singUp', () => {
    it('should register a user and return access token', async () => {
      // Arrange
      const userSignUpDto: UserSignUpDto = {
        name: 'John',
        surname: 'Doe',
        username: 'john_doe',
        email: 'john@example.com',
        password: 'Password123',
      }

      jest.spyOn(authService['logger'], 'log')
      jest.spyOn(usersService, 'create').mockResolvedValue(userDto)
      jest.spyOn(authService as any, 'getAccessToken').mockReturnValue({
        access_token: 'mocked_token',
      })

      // Act
      const result = await authService.singUp(userSignUpDto)

      // Assert
      expect(authService['logger'].log).toHaveBeenCalled()
      expect(usersService.create).toHaveBeenCalled()
      expect(authService['getAccessToken']).toHaveBeenCalled()
      expect(result).toEqual({ access_token: 'mocked_token' })
    })
  })

  describe('singIn', () => {
    it('should log in a user and return access token', async () => {
      // Arrange
      const userSignInDto: UserSignInDto = {
        username: 'john_doe',
        password: 'Password123',
      }

      jest.spyOn(authService['logger'], 'log')
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(mockUser)
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true)
      jest.spyOn(authService as any, 'getAccessToken').mockReturnValue({
        access_token: 'mocked_token',
      })

      // Act
      const result = await authService.singIn(userSignInDto)

      // Assert
      expect(authService['logger'].log).toHaveBeenCalled()
      expect(usersService.findByUsername).toHaveBeenCalled()
      expect(usersService.validatePassword).toHaveBeenCalled()
      expect(authService['getAccessToken']).toHaveBeenCalled()
      expect(result).toEqual({ access_token: 'mocked_token' })
    })

    it('should throw BadRequestException if user is not found', async () => {
      // Arrange
      const userSignInDto: UserSignInDto = {
        username: 'john_doe',
        password: 'Password123',
      }

      jest.spyOn(authService['logger'], 'log')
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null)

      // Act & Assert
      await expect(authService.singIn(userSignInDto)).rejects.toThrowError(
        BadRequestException,
      )
      expect(authService['logger'].log).toHaveBeenCalled()
    })

    it('should throw BadRequestException if password is invalid', async () => {
      // Arrange
      const userSignInDto: UserSignInDto = {
        username: 'john_doe',
        password: 'InvalidPassword',
      }

      jest.spyOn(authService['logger'], 'log')
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(mockUser)
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false)

      // Act & Assert
      await expect(authService.singIn(userSignInDto)).rejects.toThrowError(
        BadRequestException,
      )
      expect(authService['logger'].log).toHaveBeenCalled()
    })
  })

  describe('validateUser', () => {
    it('should validate a user', async () => {
      // Arrange
      const userId = 'some_id'

      jest.spyOn(authService['logger'], 'log')
      jest.spyOn(usersService, 'findOne').mockResolvedValue(userDto)

      // Act
      const result = await authService.validateUser(userId)

      // Assert
      expect(authService['logger'].log).toHaveBeenCalled()
      expect(usersService.findOne).toHaveBeenCalledWith(userId)
      expect(result).toEqual(userDto)
    })
  })

  describe('getAccessToken', () => {
    it('should generate an access token', () => {
      // Arrange
      const userId = 'some_id'

      jest.spyOn(authService['logger'], 'log')
      jest.spyOn(jwtService, 'sign').mockReturnValue('mocked_token')

      // Act
      const result = authService['getAccessToken'](userId)

      // Assert
      expect(authService['logger'].log).toHaveBeenCalled()
      expect(jwtService.sign).toHaveBeenCalled()
      expect(result).toEqual({ access_token: 'mocked_token' })
    })

    it('should throw InternalServerErrorException if token generation fails', () => {
      // Arrange
      const userId = 'some_id'

      jest.spyOn(authService['logger'], 'log')
      jest.spyOn(jwtService, 'sign').mockImplementation(() => {
        throw new Error('Mocked error')
      })

      // Act & Assert
      expect(() => authService['getAccessToken'](userId)).toThrowError(
        InternalServerErrorException,
      )
      expect(authService['logger'].log).toHaveBeenCalled()
    })
  })
})
