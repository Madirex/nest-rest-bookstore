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

/**
 * DTO para crear un libro
 */
export class CreateBookDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe de ser un String' })
  @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
  name: string

  @IsNotEmpty({ message: 'El autor no puede estar vacío' })
  @IsString({ message: 'El nombre del autor debe de ser un String' })
  @MaxLength(255, {
    message: 'El nombre del autor no puede tener más de 255 caracteres',
  })
  author: string

  @IsNotEmpty({ message: 'Publisher no puede ser nulo' })
  @IsNumber({}, { message: 'ID del Publisher debe ser un número' })
  @Min(0, { message: 'ID del Publisher no puede estar en negativo' })
  publisherId: number

  @Min(0, { message: 'El precio no puede estar en negativo' })
  @Max(1000000, { message: 'El precio no debe de ser mayor a 1000000' })
  @IsNotEmpty({ message: 'El precio no puede ser nulo' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsOptional()
  price?: number

  @IsNotEmpty({ message: 'El stock no puede estar vacío' })
  @IsInt({ message: 'El stock debe de ser un número entero' })
  @Min(0, { message: 'El stock no puede estar en negativo' })
  @Max(1000000, { message: 'El stock no debe de ser mayor a 1000000' })
  @IsOptional()
  stock?: number

  @IsNotEmpty({ message: 'La imagen no puede estar vacía' })
  @IsString({ message: 'La imagen debe de ser un String' })
  @MaxLength(1020, {
    message: 'La imagen no puede tener más de 1020 caracteres',
  })
  @IsOptional()
  image?: string

  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @IsString({ message: 'La descripción debe de ser un String' })
  @MaxLength(510, {
    message: 'La descripción no puede tener más de 510 caracteres',
  })
  @IsOptional()
  description?: string

  @IsNotEmpty({ message: 'La categoría no puede estar vacía' })
  @IsString({ message: 'La categoría debe de ser un String' })
  @MaxLength(255, {
    message: 'El nombre de la categoría no puede tener más de 255 caracteres',
  })
  @IsOptional()
  category?: string | ''
}
