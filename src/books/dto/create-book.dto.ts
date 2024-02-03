import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO para crear un libro
 */
export class CreateBookDto {
  @ApiProperty({
    example: 'La mansión de las pesadillas',
    description: 'Nombre del libro',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe de ser un String' })
  @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
  name: string

  @ApiProperty({
    example: 'Madirex',
    description: 'Autor del libro',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El autor no puede estar vacío' })
  @IsString({ message: 'El nombre del autor debe de ser un String' })
  @MaxLength(255, {
    message: 'El nombre del autor no puede tener más de 255 caracteres',
  })
  author: string

  @ApiProperty({
    example: 1,
    description: 'ID del Publisher',
  })
  @IsNotEmpty({ message: 'Publisher no puede ser nulo' })
  @IsNumber({}, { message: 'ID del Publisher debe ser un número' })
  @Min(0, { message: 'ID del Publisher no puede estar en negativo' })
  publisherId: number

  @ApiProperty({
    example: 10,
    description: 'Precio del libro',
  })
  @Min(0, { message: 'El precio no puede estar en negativo' })
  @Max(1000000, { message: 'El precio no debe de ser mayor a 1000000' })
  @IsNotEmpty({ message: 'El precio no puede ser nulo' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsOptional()
  price?: number

  @ApiProperty({
    example: 10,
    description: 'Stock del libro',
  })
  @IsNotEmpty({ message: 'El stock no puede estar vacío' })
  @IsInt({ message: 'El stock debe de ser un número entero' })
  @Min(0, { message: 'El stock no puede estar en negativo' })
  @Max(1000000, { message: 'El stock no debe de ser mayor a 1000000' })
  @IsOptional()
  stock?: number

  @ApiProperty({
    example: 'https://www.example.com/image.jpg',
    description: 'URL de la imagen del libro',
    maxLength: 1020,
  })
  @IsNotEmpty({ message: 'La imagen no puede estar vacía' })
  @IsString({ message: 'La imagen debe de ser un String' })
  @MaxLength(1020, {
    message: 'La imagen no puede tener más de 1020 caracteres',
  })
  @IsOptional()
  image?: string

  @ApiProperty({
    example: 'Libro de terror y suspenso',
    description: 'Descripción del libro',
    maxLength: 510,
  })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @IsString({ message: 'La descripción debe de ser un String' })
  @MaxLength(510, {
    message: 'La descripción no puede tener más de 510 caracteres',
  })
  @IsOptional()
  description?: string

  @ApiProperty({
    example: 'Terror',
    description: 'Categoría del libro',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'La categoría no puede estar vacía' })
  @IsString({ message: 'La categoría debe de ser un String' })
  @MaxLength(255, {
    message: 'El nombre de la categoría no puede tener más de 255 caracteres',
  })
  @IsOptional()
  category?: string | ''
}
