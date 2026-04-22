import type { FC } from 'react';
import type { useEditor } from '@tiptap/react';

import { RichTextEditor, RichTextEditorControl } from 'shared/ui';

type EditorProps = {
    editor: ReturnType<typeof useEditor> | null;
    isEditing: boolean;
};

export const Editor: FC<EditorProps> = ({ editor, isEditing }) => {
    return (
        <RichTextEditor.Root
            editor={editor}
            bg="white"
            rounded="lg"
            shadow="sm"
            css={{
                '--content-min-height': '400px',
                '--content-padding-x': 'spacing.6',
                '--content-padding-y': 'spacing.6',
            }}
        >
            {isEditing && (
                <RichTextEditor.Toolbar variant="sticky">
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
                </RichTextEditor.Toolbar>
            )}
            <RichTextEditor.Content />
        </RichTextEditor.Root>
    );
};
