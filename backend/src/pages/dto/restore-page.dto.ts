import { IsString, IsUUID } from 'class-validator';

export class RestorePageDto {
    @IsString()
    @IsUUID()
    historyEntryId: string;
}
