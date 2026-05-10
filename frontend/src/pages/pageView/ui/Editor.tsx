import type { FC } from 'react';
import { Button, HStack } from '@chakra-ui/react';
import type { useEditor } from '@tiptap/react';

import type { EditorWidth } from 'shared/types';
import { RichTextEditor, RichTextEditorControl } from 'shared/ui';

import { CompactMoreControls } from './CompactMoreControls';

type EditorProps = {
    editor: ReturnType<typeof useEditor> | null;
    editorWidth: EditorWidth;
    isEditing: boolean;
    isSaving: boolean;
    handleSave: () => void;
    handleCancel: () => void;
};

export const Editor: FC<EditorProps> = ({
    editor,
    editorWidth,
    isEditing,
    isSaving,
    handleSave,
    handleCancel,
}) => {
    const isCompact = editorWidth === 'COMPACT';

    return (
        <RichTextEditor.Root
            editor={editor}
            bg="bg.panel"
            rounded="lg"
            w={isCompact ? '960px' : 'full'}
            css={{
                // '--content-min-height': '400px',
                '--content-padding-x': 'spacing.6',
                '--content-padding-y': 'spacing.6',
            }}
        >
            {isEditing && (
                <RichTextEditor.Toolbar
                    variant="sticky"
                    stickyOffset="-33px"
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
                        <RichTextEditorControl.CodeBlock />
                        {!isCompact && (
                            <>
                                <RichTextEditorControl.InsertImageControl />
                                <RichTextEditorControl.CodeBlockLanguage />
                            </>
                        )}
                    </RichTextEditor.ControlGroup>
                    {!isCompact && (
                        <RichTextEditor.ControlGroup>
                            <RichTextEditorControl.AlignLeft />
                            <RichTextEditorControl.AlignCenter />
                            <RichTextEditorControl.AlignRight />
                        </RichTextEditor.ControlGroup>
                    )}
                    {!isCompact && (
                        <RichTextEditor.ControlGroup>
                            <RichTextEditorControl.Link />
                            <RichTextEditorControl.Unlink />
                        </RichTextEditor.ControlGroup>
                    )}
                    <RichTextEditor.ControlGroup>
                        <RichTextEditorControl.Undo />
                        <RichTextEditorControl.Redo />
                        {isCompact && <CompactMoreControls editor={editor} />}
                    </RichTextEditor.ControlGroup>
                    <HStack gap={2} ms="auto">
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
