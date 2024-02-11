import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

/**
 * Configuración de Swagger
 * @param app Aplicación NestJS
 */
export function setupSwagger(app: INestApplication) {
  /**
   * Configuración de Swagger
   */
  const config = new DocumentBuilder()
    .setTitle('API REST Bookstore Nestjs')
    .setDescription(
      'API Rest para la gestión de una librería con NestJS, TypeORM, MongoDB, Mongoose, JWT, Passport, Websockets, etc.',
    )
    .setContact(
      'NULLERS',
      'https://github.com/Madirex/nest-rest-bookstore',
      'contact@madirex.com',
    )
    .setExternalDoc(
      'Documentación de la API',
      'https://github.com/Madirex/nest-rest-bookstore',
    )
    .setLicense('CC BY-NC-SA 4.0', 'https://www.madirex.com/p/license.html')
    .setVersion('1.0.0')
    .addTag('Books', 'Operaciones con Libros')
    .addTag('Storage', 'Operaciones con almacenamiento')
    .addTag('Auth', 'Operaciones de autenticación')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}
