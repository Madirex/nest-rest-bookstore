import { BadRequestException } from '@nestjs/common'
import { ResponseBookDto } from '../books/dto/response-book.dto'
import { Util } from './util'
import * as fs from 'fs'

describe('Util', () => {
  describe('getCurrentDateTimeString', () => {
    it('debería devolver una cadena con el formato correcto', () => {
      const result = Util.getCurrentDateTimeString()
      const pattern = /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}$/
      expect(result).toMatch(pattern)
    })
  })

  describe('detectFileType', () => {
    it('debería detectar correctamente el tipo de archivo JPEG y retornar error al leer el contenido del archivo', () => {
      const file = { path: '/ruta/a/imagen.jpg' } as Express.Multer.File

      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Simulated file read error')
      })

      const result = () => Util.detectFileType(file)

      expect(result).toThrow(BadRequestException)
      expect(result).toThrow('Error al leer el contenido del archivo.')

      jest.restoreAllMocks()
    })

    it('debería detectar correctamente el tipo de archivo PNG y retornar error al leer el contenido del archivo', () => {
      const file = { path: '/ruta/a/imagen.png' } as Express.Multer.File

      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Simulated file read error')
      })

      const result = () => Util.detectFileType(file)

      expect(result).toThrow(BadRequestException)
      expect(result).toThrow('Error al leer el contenido del archivo.')

      jest.restoreAllMocks()
    })

    it('debería lanzar una excepción BadRequest si el tipo de archivo no es soportado', () => {
      const file = { path: '/ruta/a/archivo.txt' } as Express.Multer.File
      expect(() => Util.detectFileType(file)).toThrow(BadRequestException)
    })

    it('debería lanzar una excepción BadRequest si hay un error al leer el contenido del archivo', () => {
      const file = { path: '/ruta/a/archivo.error' } as Express.Multer.File
      expect(() => Util.detectFileType(file)).toThrow(BadRequestException)
    })
  })

  describe('responseBookDtoAddPath', () => {
    it('debería agregar correctamente el path a la imagen', () => {
      const responseBookDto = { image: 'imagen.jpg' } as ResponseBookDto
      Util.responseBookDtoAddPath(responseBookDto)
      const apiVersion = process.env.API_VERSION
        ? `/${process.env.API_VERSION}`
        : '/v1'
      const apiPort = process.env.API_PORT ? `${process.env.API_PORT}` : '3000'
      const apiHost = process.env.API_HOST
        ? `${process.env.API_HOST}`
        : 'localhost'
      const isHttps = process.env.API_HTTPS ? process.env.API_HTTPS : false
      const protocol = isHttps ? 'https' : 'http'
      const expectedPath = `${protocol}://${apiHost}:${apiPort}${apiVersion}/storage/imagen.jpg`
      expect(responseBookDto.image).toBe(expectedPath)
    })

    it('no debería modificar el path si image es null o vacío', () => {
      const responseBookDto = { image: null } as ResponseBookDto
      Util.responseBookDtoAddPath(responseBookDto)
      expect(responseBookDto.image).toBeNull()
    })
  })
})
