# Rest-BookStore
<p align="center">
  <img src="https://i.imgur.com/L8JoB88.png?maxwidth=300"/>
</p>

## Configuración
Hay que crear un archivo .env en la raíz del proyecto con las siguientes variables de entorno:
```API_VERSION=v1
API_VERSION=v1
API_PORT=3000
API_HTTPS=true
NODE_ENV=dev

# Postgres
POSTGRES_HOST=localhost
DATABASE_USER=admin
DATABASE_PASSWORD=password123
POSTGRES_DATABASE=BOOKSTORE_DB
POSTGRES_PORT=5432

# Mongo
MONGO_HOST=localhost
MONGO_DATABASE=shop
MONGO_PORT=27017

# Cert
SSL_KEY=./cert/keystore.p12
SSL_CERT=./cert/cert.pem

# JWT
JWT_SECRET=secret_wepogu093jprgmrekl_34piu80gehriotg4
JWT_EXPIRATION_TIME=3600
```

Para el archivo de producción, se crea un archivo .env.prod en la raíz del proyecto con las siguientes variables de entorno:
```API_VERSION=v1
API_PORT=3000
API_HTTPS=true
NODE_ENV=dev

# Postgres
POSTGRES_HOST=postgres-db
DATABASE_USER=admin
DATABASE_PASSWORD=password123
POSTGRES_DATABASE=BOOKSTORE_DB
POSTGRES_PORT=5432

# Mongo
MONGO_HOST=mongo-db
MONGO_DATABASE=shop
MONGO_PORT=27017

# Cert
SSL_KEY=./cert/keystore.p12
SSL_CERT=./cert/cert.pem

# JWT
JWT_SECRET=secret_wepogu093jprgmrekl_34piu80gehriotg4
JWT_EXPIRATION_TIME=3600
```


## Arquitectura
<p align="center">
  <img src="https://i.imgur.com/4r1PwDf_d.webp?maxwidth=1000"/>
</p>

## Diagrama UML
<p align="center">
  <img src="https://i.imgur.com/H4yEED8.png"/>
</p>

<p align="center">
  <img src="https://i.imgur.com/T9f62Df.png"/>
</p>

# NULLERS BOOKS API

**Por NULLERS - 4 de diciembre de 2023**

## Descripción

Bienvenido a la API REST de NULLERS BOOKS, una tienda de libros en línea que te permite realizar diversas operaciones, como consultar libros, gestionar usuarios, administrar tiendas y realizar orders. Nuestra API está diseñada para ser segura, eficiente y escalable, proporcionando una interfaz robusta para interactuar con la plataforma de comercio de libros.

### Estructura del Proyecto

- **Controllers:** Manejan las solicitudes HTTP y devuelven las respuestas correspondientes.
- **Models:** Define los objetos utilizados en la aplicación.
- **Repositories:** Realiza operaciones con la base de datos.
- **Services:** Realiza operaciones necesarias para que el controlador pueda devolver la respuesta.
- **Utils:** Define las clases útiles que se utilizan en la aplicación.

## Infraestructura

El usuario tiene un UserRole, el cual define el tipo de usuario (si es Admin o User). Dependiendo del tipo de rol, se le otorgará la posibilidad de realizar ciertas peticiones. Los usuarios pueden realizar consultas GET en libros, tiendas o editoriales, pero no pueden realizar peticiones de actualización o eliminación. Los usuarios administradores tienen control para poder realizar estas peticiones.

El usuario cuenta con un email y un username, el cuál no se puede repetir. Utilizamos el borrado lógico en isDeleted para la conservación de los usuarios.

Una tienda tiene una dirección y una lista de libros y clientes. Un cliente también tiene una dirección.

Un Libro tiene asignada una categoría y una editorial. Las editoriales tienen de 0 a muchos libros. La editorial, el libro y el cliente cuentan con una imagen.

El libro cuenta con un stock y un precio del libro, así como cada uno de los elementos que componen al libro: nombre, autor, descripción…

## Elección de Tecnologías para el Modelo de Datos

### Modelo relacional:

Hemos utilizado un modelo relacional para los orders y líneas de order.

### SQL:

Para el resto de entidades, hemos utilizado SQL.

La elección de utilizar un modelo relacional para los orders y líneas de order, y SQL para el resto de entidades, se basa en consideraciones específicas relacionadas con la estructura y las operaciones previstas en el sistema.

### Modelo Relacional para Orders y Líneas de OrderSchema:

**Relaciones Complejas:**
El modelo relacional es especialmente adecuado cuando existen relaciones complejas entre las entidades. En el caso de los orders y líneas de order, donde se pueden tener múltiples libros asociados a un solo order, el modelo relacional proporciona una representación clara y eficiente de estas relaciones.

**Consistencia y Normalización:**
La normalización inherente al modelo relacional ayuda a mantener la consistencia y la integridad de los datos. Al gestionar orders, donde es crucial mantener la coherencia de la información, la normalización contribuye a evitar redundancias y posibles incongruencias.

### SQL para el Resto de Entidades:

**Versatilidad y Escalabilidad:**
El uso de SQL permite gestionar de manera eficiente una variedad de operaciones en las diferentes entidades del sistema, desde usuarios y tiendas hasta libros y categorías. SQL es conocido por su versatilidad y escalabilidad, lo que facilita la manipulación y consulta de datos en un amplio espectro de situaciones.

**Consulta y Manipulación de Datos:**
SQL proporciona un lenguaje poderoso para la consulta y manipulación de datos. Esto es esencial para operaciones como la obtención de información del perfil de un usuario, la actualización de datos de una tienda o la gestión de libros y categorías.

## Dependencias

- **@nestjs/cache-manager:** Proporciona una capa de caché para mejorar el rendimiento de la aplicación al almacenar en caché resultados de operaciones costosas.

- **@nestjs/common:** Proporciona funcionalidades comunes para aplicaciones NestJS, como la inyección de dependencias y la creación de controladores.

- **@nestjs/config:** Permite la gestión de la configuración de la aplicación de forma sencilla y flexible.

- **@nestjs/core:** Proporciona la base fundamental para la ejecución de aplicaciones NestJS.

- **@nestjs/jwt:** Ofrece funcionalidades para la generación y validación de tokens JWT para la autenticación y autorización de usuarios.

- **@nestjs/mapped-types:** Proporciona herramientas para la manipulación y transformación de tipos de datos en aplicaciones NestJS.

- **@nestjs/mongoose:** Facilita la integración de MongoDB con NestJS para el acceso a datos utilizando Mongoose.

- **@nestjs/passport:** Ofrece integración con Passport para la autenticación de usuarios en aplicaciones NestJS.

- **@nestjs/platform-express:** Proporciona integración con Express, permitiendo la creación de servidores HTTP robustos.

- **@nestjs/platform-socket.io:** Ofrece soporte para la comunicación en tiempo real a través de WebSockets utilizando Socket.IO.

- **@nestjs/swagger:** Permite la generación automática de documentación OpenAPI (anteriormente Swagger) para la API de la aplicación.

- **@nestjs/typeorm:** Facilita la integración de TypeORM con NestJS para el acceso a bases de datos relacionales.

- **@nestjs/websockets:** Proporciona funcionalidades para la implementación de WebSockets en aplicaciones NestJS.

- **@types/multer:** Proporciona definiciones de tipos para la biblioteca Multer, utilizada para el manejo de archivos en aplicaciones Node.js.

- **bcryptjs:** Ofrece funcionalidades para el cifrado de contraseñas utilizando el algoritmo bcrypt.

- **cache-manager:** Proporciona una capa de caché para Node.js que soporta múltiples almacenes de caché.

- **chalk:** Permite la coloración de texto en la consola para una mejor legibilidad de los mensajes.

- **class-transformer y class-validator:** Facilitan la validación y transformación de objetos en aplicaciones NestJS.

- **cross-env:** Proporciona una forma de establecer variables de entorno de forma consistente en diferentes plataformas.

- **mongoose y mongoose-paginate-v2:** Ofrecen herramientas para trabajar con MongoDB de forma sencilla y eficiente, incluyendo paginación de resultados.

- **nestjs-paginate:** Proporciona funcionalidades de paginación para aplicaciones NestJS.

- **nestjs-pino:** Ofrece integración con Pino para el registro de eventos y seguimiento en aplicaciones NestJS.

- **passport y passport-jwt:** Proporcionan soporte para la autenticación basada en tokens JWT utilizando Passport.

- **pg:** Cliente PostgreSQL para Node.js.

- **reflect-metadata:** Proporciona una API para el acceso a los metadatos de los objetos en tiempo de ejecución.

- **rxjs:** Biblioteca reactiva para JavaScript.

- **typeorm:** ORM para Node.js que soporta múltiples bases de datos relacionales.

## Autores
- [Madirex](https://github.com/Madirex/)
- [Jaimesalcedo1](https://github.com/jaimesalcedo1/)
- [Danniellgm03](https://github.com/Danniellgm03)
- [Binweiwang](https://github.com/Binweiwang)
- [Alexdor11](https://github.com/alexdor11)
