import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class MovePageDto {
    /** null — переместить на корневой уровень пространства */
    @IsOptional()
    @IsString()
    parentId?: string | null;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;
}
