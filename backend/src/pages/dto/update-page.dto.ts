import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Min,
    MinLength,
} from 'class-validator';

export class UpdatePageDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsBoolean()
    isFolder?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;
}
