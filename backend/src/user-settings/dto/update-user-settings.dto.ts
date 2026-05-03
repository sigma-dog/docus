import { IsIn, IsOptional } from 'class-validator';

const editorWidths = ['FULL_WIDTH', 'COMPACT'] as const;

export class UpdateUserSettingsDto {
    @IsOptional()
    @IsIn(editorWidths)
    editorWidth?: (typeof editorWidths)[number];
}
