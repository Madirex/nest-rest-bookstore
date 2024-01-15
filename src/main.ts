import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { config } from 'dotenv'

/*
 * Función principal de la aplicación
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')
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
bootstrap()
