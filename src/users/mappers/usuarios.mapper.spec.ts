import { UsuariosMapper } from './usuarios.mapper'
import { Test, TestingModule } from '@nestjs/testing'

describe('UsuariosMapper', () => {
  let usuariosMapper: UsuariosMapper

  const usuario = {
    id: 1,
    nombre: 'Juan',
    apellidos: 'Pérez',
    email: 'juan.perez@example.com',
    username: 'juanperez',
    password: 'passwordSeguro123',
    createdAt: '2024-02-10T00:00:00.000Z',
    updatedAt: '2024-02-10T00:00:00.000Z',
    isDeleted: false,
    roles: [
      {
        id: 1,
        role: 'USER',
        usuario: 1,
      },
      {
        id: 2,
        role: 'ADMIN',
        usuario: 1,
      },
    ],
  }
  const createUsuarioDto = {
    nombre: 'Juan',
    apellidos: 'Pérez',
    username: 'juanperez',
    email: 'juan.perez@example.com',
    roles: ['USER', 'ADMIN'],
    password: 'Password123',
  }

  // const updateUsuarioDto = {
  //   nombre: 'Juan',
  //   apellidos: 'Pérez',
  //   username: 'juanperez',
  //   email: 'juan.perez@example.com',
  //   roles: ['USER', 'ADMIN'],
  //   password: 'Password123',
  // }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosMapper],
    }).compile()

    usuariosMapper = module.get<UsuariosMapper>(UsuariosMapper)
  })
  it('debe de estar definido', () => {
    expect(usuariosMapper).toBeDefined()
  })
  describe('toEntity', () => {
    it('debe de mapear un createUsuarioDto a un usuario', () => {
      const usuario = usuariosMapper.toEntity(createUsuarioDto)
      expect(usuario.nombre).toEqual(createUsuarioDto.nombre)
      expect(usuario.apellidos).toEqual(createUsuarioDto.apellidos)
      expect(usuario.email).toEqual(createUsuarioDto.email)
    })
  })
  describe('toResponseDto', () => {
    it('debe de mapear un usuario a un UserDto', () => {
      const userDto = usuariosMapper.toResponseDto(usuario as any)
      expect(userDto.nombre).toEqual(usuario.nombre)
      expect(userDto.apellidos).toEqual(usuario.apellidos)
      expect(userDto.email).toEqual(usuario.email)
    })
  })
  describe('toResponseDtoWithRoles', () => {
    it('debe de mapear un usuario y sus roles a un UserDto', () => {
      const userDto = usuariosMapper.toResponseDtoWithRoles(
        usuario as any,
        usuario.roles as any,
      )
      expect(userDto.nombre).toEqual(usuario.nombre)
      expect(userDto.apellidos).toEqual(usuario.apellidos)
      expect(userDto.email).toEqual(usuario.email)
      expect(userDto.roles).toEqual(['USER', 'ADMIN'])
    })
  })
})
