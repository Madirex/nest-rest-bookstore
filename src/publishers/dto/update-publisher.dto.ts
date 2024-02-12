import {ApiProperty, PartialType} from '@nestjs/swagger'
import { CreatePublisherDto } from './create-publisher.dto'
import {IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator";

/**
 * DTO para actualizar un Publisher
 */
export class UpdatePublisherDto {
    @ApiProperty({
        example: 'Editorial Planeta',
        description: 'El nombre del Publisher',
        maxLength: 255,
    })
    @IsString({ message: 'El nombre debe de ser un String' })
    @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    name: string

    @ApiProperty({
        example: 'https://www.planetadelibros.com/image.png',
        description: 'La imagen del Publisher',
    })
    @IsString({ message: 'La imagen debe de ser un String' })
    @MaxLength(1020, {
        message: 'La imagen no puede tener más de 1020 caracteres',
    })
    @IsOptional()
    image?: string
}
