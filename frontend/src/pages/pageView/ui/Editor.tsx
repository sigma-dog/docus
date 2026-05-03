import type { FC } from 'react';
import { Button, HStack, Spacer } from '@chakra-ui/react';
import type { useEditor } from '@tiptap/react';

import { RichTextEditor, RichTextEditorControl } from 'shared/ui';

type EditorProps = {
    editor: ReturnType<typeof useEditor> | null;
    isEditing: boolean;
    isSaving: boolean;
    handleSave: () => void;
    handleCancel: () => void;
};

export const Editor: FC<EditorProps> = ({
    editor,
    isEditing,
    isSaving,
    handleSave,
    handleCancel,
}) => {
    return (
        <RichTextEditor.Root
            editor={editor}
            bg="white"
            rounded="lg"
            shadow="sm"
            css={{
                // '--content-min-height': '400px',
                '--content-padding-x': 'spacing.6',
                '--content-padding-y': 'spacing.6',
            }}
        >
            {isEditing && (
                <RichTextEditor.Toolbar
                    variant="sticky"
                    stickyOffset="-40px"
                    py={2}
                >
                    <RichTextEditor.ControlGroup>
                        <RichTextEditorControl.TextStyle />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                        <RichTextEditorControl.Bold />
                        <RichTextEditorControl.Italic />
                        <RichTextEditorControl.Underline />
                        <RichTextEditorControl.Strikethrough />
                        <RichTextEditorControl.Code />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                        <RichTextEditorControl.BulletList />
                        <RichTextEditorControl.OrderedList />
                        <RichTextEditorControl.Blockquote />
                        <RichTextEditorControl.InsertImageControl />
                        <RichTextEditorControl.CodeBlock />
                        <RichTextEditorControl.CodeBlockLanguage />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                        <RichTextEditorControl.AlignLeft />
                        <RichTextEditorControl.AlignCenter />
                        <RichTextEditorControl.AlignRight />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                        <RichTextEditorControl.Link />
                        <RichTextEditorControl.Unlink />
                    </RichTextEditor.ControlGroup>
                    <RichTextEditor.ControlGroup>
                        <RichTextEditorControl.Undo />
                        <RichTextEditorControl.Redo />
                    </RichTextEditor.ControlGroup>
                    <Spacer />
                    <HStack gap={2}>
                        <Button
                            size="sm"
                            colorPalette="blue"
                            onClick={handleSave}
                            loading={isSaving}
                        >
                            Сохранить
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            Отмена
                        </Button>
                    </HStack>
                </RichTextEditor.Toolbar>
            )}
            <RichTextEditor.Content />
        </RichTextEditor.Root>
    );
};
