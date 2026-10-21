
import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
    @IsString()
    @MaxLength(20)
    name: string;

    @IsEmail()
    @MaxLength(40)
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    company?: string;

}
