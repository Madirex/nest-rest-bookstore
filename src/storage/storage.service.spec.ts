import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    storageService = module.get<StorageService>(StorageService);
  });

  describe('findFile', () => {
    it('debería saltar NotFoundException si el archivo no existe', () => {
      const filename = 'nonexistent-file.jpg';

      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      expect(() => storageService.findFile(filename)).toThrow(NotFoundException);
    });

    it('debería retornar el path del archivo si el archivo existe', () => {
      const filename = 'existing-file.jpg';
      path.join(storageService['uploadsDir'], filename);
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = storageService.findFile(filename);

      expect(result).toContain('storage-dir');
      expect(result).toContain('existing-file.jpg');
    });
  });

  describe('removeFile', () => {
    it('debería saltar NotFoundException si el archivo no existe', () => {
      const filename = 'nonexistent-file.jpg';

      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      expect(() => storageService.removeFile(filename)).toThrow(NotFoundException);
    });
  });

  describe('getFileNameWithoutUrl', () => {
    it('debería retornar el nombre del archivo sin la URL', () => {
      const fileUrl = 'http://example.com/uploads/filename.jpg';
      const result = storageService.getFileNameWithoutUrl(fileUrl);

      expect(result).toEqual('filename.jpg');
    });

    it('debería retornar la URL original del archivo si el parseo falla', () => {
      const invalidUrl = 'invalid-url';
      const result = storageService.getFileNameWithoutUrl(invalidUrl);

      expect(result).toEqual(invalidUrl);
    });
  });
});
