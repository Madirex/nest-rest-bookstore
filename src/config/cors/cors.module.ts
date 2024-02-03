import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

/**
 * @description Módulo para configurar CORS
 */
@Module({})
export class CorsConfigModule implements NestModule {
  /**
   * @description Configuración de CORS
   * @param consumer Middleware consumer
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept',
        )
        next()
      })
      .forRoutes('*')
  }
}
