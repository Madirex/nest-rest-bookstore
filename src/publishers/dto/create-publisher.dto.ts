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

export class CreatePublisherDto {
    @IsNotEmpty({message: 'El nombre no puede estar vacío'})
    @IsString({message: 'El nombre debe de ser un String'})
    @MaxLength(255, {message: 'El nombre no puede tener más de 255 caracteres'})
    name: string

    @IsNotEmpty({ message: 'La imagen no puede estar vacía' })
    @IsString({ message: 'La imagen debe de ser un String' })
    @MaxLength(255, {
        message: 'La imagen no puede tener más de 255 caracteres',
    })
    @IsOptional()
    image?: string

}