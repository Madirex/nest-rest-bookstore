import { Test, TestingModule } from '@nestjs/testing'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { Role } from '../../users/entities/user-role.entity'
import { AuthMapper } from './auth.mapper'

describe('AuthMapper', () => {
  let authMapper: AuthMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthMapper],
    }).compile()

    authMapper = module.get<AuthMapper>(AuthMapper)
  })

  it('should be defined', () => {
    expect(authMapper).toBeDefined()
  })

  describe('toCreateDto', () => {
    it('should map UserSignUpDto to CreateUserDto', () => {
      // Arrange
      const userSignUpDto: UserSignUpDto = {
        name: 'John',
        surname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securePassword',
      }

      // Act
      const createUserDto = authMapper.toCreateDto(userSignUpDto)

      // Assert
      expect(createUserDto).toBeDefined()
      expect(createUserDto.name).toEqual(userSignUpDto.name)
      expect(createUserDto.surname).toEqual(userSignUpDto.surname)
      expect(createUserDto.username).toEqual(userSignUpDto.username)
      expect(createUserDto.email).toEqual(userSignUpDto.email)
      expect(createUserDto.password).toEqual(userSignUpDto.password)
      expect(createUserDto.roles).toEqual([Role.USER])
    })
  })
})
