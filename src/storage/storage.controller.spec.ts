import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'
import { Response as ExpressResponse } from 'express'

describe('StorageController', () => {
  let storageController: StorageController
  let storageService: StorageService
  let mockResponse: jest.Mocked<ExpressResponse>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [StorageService],
    }).compile()

    storageController = module.get<StorageController>(StorageController)
    storageService = module.get<StorageService>(StorageService)

    mockResponse = {
      sendFile: jest.fn(),
    } as unknown as jest.Mocked<ExpressResponse>
  })

  describe('storeFile', () => {
    it('debería subir el archivo correctamente', async () => {
      const file: any = {
        originalname: 'test.jpg',
        filename: 'test-1234.jpg',
        size: 1024,
        mimetype: 'image/jpeg',
        path: '/path/to/file',
      }
      const loggerSpy = jest.spyOn(Logger.prototype, 'log')
      const result = storageController.storeFile(file)

      expect(loggerSpy).toHaveBeenCalledWith(`Subiendo archivo:  ${file}`)
      expect(result.originalname).toBe(file.originalname)
      expect(result.filename).toBe(file.filename)
      expect(result.size).toBe(file.size)
      expect(result.mimetype).toBe(file.mimetype)
      expect(result.path).toBe(file.path)
      expect(result.url).toContain(``)
    })
  })

  describe('getFile', () => {
    it('debería retornar el fichero correctamente', async () => {
      const filePath = '/path/to/file'
      storageService.findFile = jest.fn().mockReturnValue(filePath)

      const loggerSpy = jest.spyOn(Logger.prototype, 'log')
      await storageController.getFile('test-1234.jpg', mockResponse)

      expect(loggerSpy).toHaveBeenCalledWith('Buscando fichero test-1234.jpg')
      expect(storageService.findFile).toHaveBeenCalledWith('test-1234.jpg')
      expect(mockResponse.sendFile).toHaveBeenCalledWith(filePath)
    })
  })
})
