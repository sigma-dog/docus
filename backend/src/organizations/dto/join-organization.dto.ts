import { IsString } from 'class-validator';

export class JoinOrganizationDto {
    @IsString()
    code: string;
}
