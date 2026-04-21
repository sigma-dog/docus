import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @IsString()
    @Matches(/^[a-z0-9-]{2,50}$/, {
        message: 'slug must be 2–50 lowercase letters, digits, or hyphens (e.g. my-org)',
    })
    slug: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
