import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

/*
 * Función principal de la aplicación
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.API_PORT || 3000)
}
bootstrap()
