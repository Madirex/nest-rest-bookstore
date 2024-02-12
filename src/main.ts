import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { config } from 'dotenv'
import { setupSwagger } from './config/swagger/swagger.config'
import { getSSLOptions } from './config/ssl/ssl.config'

/*
 * Función principal de la aplicación
 */
async function bootstrap() {
  if (process.env.NODE_ENV === 'dev') {
    console.log('🛠️ Iniciando Nestjs Modo desarrollo 🛠️')
  } else {
    console.log('🚗 Iniciando Nestjs Modo producción 🚗')
  }

  const httpsOptions = getSSLOptions()
  const app = await NestFactory.create(AppModule, { httpsOptions })
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')

  if (process.env.NODE_ENV === 'dev') {
    setupSwagger(app)
  }

  app.useGlobalPipes(new ValidationPipe())

  const banner = `
\u001b[97m ____              _     ____  _                     \u001b[93m   _____
\u001b[97m| __ )  ___   ___ | | __/ ___|| |_ ___  _ __ ___   \u001b[93m    /    /|_
\u001b[97m|  _ \\ / _ \\ / _ \\| |/ /\\___ \\| __/ _ \\| '__/ _ \\ \u001b[93m    /    // /|
\u001b[97m| |_) | (_) | (_) |   <  ___) | || (_) | | |  __/  \u001b[93m  (====|/ //
\u001b[97m|____/ \\___/ \\___/|_|\\_\\|____/ \\__\\___/|_|  \\___| \u001b[93m   (=====|/)

           \u001b[96m    \u001b[94m    \u001b[97m.--.\u001b[96m       \u001b[94m    \u001b[91m   \u001b[95m  \u001b[96m  \u001b[92m   \u001b[32m.---.\u001b[96m
           \u001b[96m    \u001b[94m.---\u001b[97m|__|\u001b[96m       \u001b[94m    \u001b[91m.-.\u001b[95m  \u001b[96m  \u001b[92m   \u001b[32m|~~~|\u001b[96m
           \u001b[96m.-- \u001b[94m|===\u001b[97m|-\u001b[96m       \u001b[94m    \u001b[91m|_|\u001b[95m  \u001b[96m  \u001b[92m   \u001b[32m|~~~|\u001b[96m--.
           \u001b[96m|   \u001b[94m|===\u001b[97m|  \u001b[94m'\u001b[97m     \u001b[94m.---\u001b[91m!~|\u001b[95m  \u001b[96m.--\u001b[92m|   |\u001b[96m--|
           \u001b[96m|%% \u001b[94m|   \u001b[97m|  \u001b[94m'\u001b[97m     \u001b[94m|===\u001b[91m| |\u001b[95m--\u001b[96m|%%\u001b[92m|   |\u001b[96m  |
           \u001b[96m|%% \u001b[94m|   \u001b[97m|  \u001b[94m'\u001b[97m.\u001b[94m    \u001b[94m|   \u001b[91m|===\u001b[92m| |==\u001b[96m|%%\u001b[92m|~~~|\u001b[96m  |
           \u001b[96m|   \u001b[94m|   \u001b[97m|  \u001b[94m'\u001b[97m.\u001b[94m    \u001b[94m|   \u001b[91m|_|__\u001b[92m|  \u001b[96m|~~~|\u001b[92m__|
           \u001b[96m|   \u001b[94m|===\u001b[97m|-\u001b[96m   \u001b[94m.\u001b[97m'\\ \u001b[94m|===\u001b[91m|~|\u001b[95m--\u001b[96m|%%\u001b[92m|~~~|\u001b[96m--|
           \u001b[96m^-- \u001b[94m^---\u001b[97m'--^\u001b[94m    \u001b[97m\`-'\u001b[94m\`---\u001b[91m^-^\u001b[95m--\u001b[96m^--\u001b[92m^---'\u001b[96m--'

 \u001b[93mPowered by NEST

 NULLERS Team`

  await app.listen(process.env.API_PORT || 3000)

  console.log(banner)
}

config()
bootstrap().then(() =>
  console.log(
    `🟢 Servidor abierto en puerto: ${process.env.API_PORT || 3000} y perfil: ${
      process.env.NODE_ENV
    } 🚀\``,
  ),
)
