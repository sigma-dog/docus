import {
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateSpaceDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @IsString()
    @Matches(/^[A-Z0-9]{2,10}$/, {
        message:
            'key must be 2–10 uppercase letters or digits (e.g. PROJ, TEAM1)',
    })
    key!: string;

    @IsString()
    organizationSlug!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
