import {
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
    MinLength,
} from 'class-validator';

export class AskAiDto {
    @IsString()
    @MinLength(1)
    question!: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    topK?: number;
}
