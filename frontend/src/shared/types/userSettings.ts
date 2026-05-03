export const editorWidthValues = {
    fullWidth: 'FULL_WIDTH',
    compact: 'COMPACT',
} as const;

export type EditorWidth =
    (typeof editorWidthValues)[keyof typeof editorWidthValues];

export type UserSettings = {
    editorWidth: EditorWidth;
};
