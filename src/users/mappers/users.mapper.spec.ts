import { Test, TestingModule } from '@nestjs/testing'

import { v4 as uuidv4 } from 'uuid'
import { UsersMapper } from './users.mapper'
import { User } from '../entities/user.entity'
import { UserDto } from '../dto/user-response.dto'
import { Role, UserRole } from '../entities/user-role.entity'
import { CreateUserDto } from '../dto/create-user.dto'

describe('UsersMapper', () => {
  let usersMapper: UsersMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersMapper],
    }).compile()

    usersMapper = module.get<UsersMapper>(UsersMapper)
  })

  it('should be defined', () => {
    expect(usersMapper).toBeDefined()
  })

  describe('toResponseDto', () => {
    it('should map User to UserDto', () => {
      // Arrange
      const user: User = {
        id: uuidv4(),
        name: 'Madi',
        surname: 'Land',
        username: 'madirexland',
        email: 'madi@madirex.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        password: 'password',
        roleNames: [],
        roles: [],
      }

      // Act
      const userDto: UserDto = usersMapper.toResponseDto(user)

      // Assert
      expect(userDto).toBeDefined()
      expect(userDto.id).toEqual(user.id)
      expect(userDto.name).toEqual(user.name)
      expect(userDto.surname).toEqual(user.surname)
      expect(userDto.username).toEqual(user.username)
      expect(userDto.email).toEqual(user.email)
      expect(userDto.createdAt).toEqual(user.createdAt)
      expect(userDto.updatedAt).toEqual(user.updatedAt)
      expect(userDto.isDeleted).toEqual(user.isDeleted)
      expect(userDto.roles).toEqual([])
    })
  })

  describe('toResponseDtoWithRoles', () => {
    it('should map User to UserDto with roles', () => {
      // Arrange
      const user: User = {
        id: uuidv4(),
        name: 'Madi23',
        surname: 'lan3d',
        username: 'Madi32',
        email: '24fmad@madirex.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        password: 'password',
        roleNames: ['ADMIN', 'USER'],
        roles: [],
      }

      const roles: UserRole[] = [
        {
          id: uuidv4(),
          role: Role.USER,
          user: user,
        },
        {
          id: uuidv4(),
          role: Role.ADMIN,
          user: user,
        },
      ]

      // Act
      const userDto: UserDto = usersMapper.toResponseDtoWithRoles(user, roles)

      // Assert
      expect(userDto).toBeDefined()
      expect(userDto.id).toEqual(user.id)
      expect(userDto.name).toEqual(user.name)
      expect(userDto.surname).toEqual(user.surname)
      expect(userDto.username).toEqual(user.username)
      expect(userDto.email).toEqual(user.email)
      expect(userDto.createdAt).toEqual(user.createdAt)
      expect(userDto.updatedAt).toEqual(user.updatedAt)
      expect(userDto.isDeleted).toEqual(user.isDeleted)
      expect(userDto.roles).toEqual(['USER', 'ADMIN'])
    })
  })

  describe('toEntity', () => {
    it('should map CreateUserDto to User', () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Madirex',
        surname: 'Land',
        username: 'MadirexLand',
        email: 'Madirex@madirex.com',
        password: '32p9ufjirenk',
        roles: [],
      }

      // Act
      const user: User = usersMapper.toEntity(createUserDto)

      // Assert
      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.name).toEqual(createUserDto.name)
      expect(user.surname).toEqual(createUserDto.surname)
      expect(user.email).toEqual(createUserDto.email)
      expect(user.username).toEqual(createUserDto.username)
      expect(user.password).toEqual(createUserDto.password)
      expect(user.createdAt).toBeDefined()
      expect(user.updatedAt).toBeDefined()
      expect(user.isDeleted).toEqual(false)
    })
  })
})
