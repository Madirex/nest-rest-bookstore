import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

/**
 * @description Servicio para encriptar contraseñas
 */
@Injectable()
export class BcryptService {
  private ROUNDS = 12

  /**
   * @description Encripta una contraseña
   * @param password Contraseña
   */
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.ROUNDS)
  }

  /**
   * @description Compara una contraseña con un hash
   * @param password Contraseña
   * @param hash Hash
   */
  async isMatch(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }
}
