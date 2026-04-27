import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Center, Spinner, Stack, Text } from '@chakra-ui/react';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { all, createLowlight } from 'lowlight';

import { useGetPageQuery, useUpdatePageMutation } from 'shared/api';

import { Header } from './header/Header';
import { Breadcrumbs } from './Breadcrumbs';
import { Editor } from './Editor';

const lowlight = createLowlight(all);

export const PageView = () => {
    const { orgSlug, spaceKey, pageId } = useParams<{
        orgSlug: string;
        spaceKey: string;
        pageId: string;
    }>();

    const [isEditing, setIsEditing] = useState(false);

    const { data: page, isLoading } = useGetPageQuery(
        { spaceKey: spaceKey!, pageId: pageId! },
        { skip: !spaceKey || !pageId }
    );

    const [updatePage, { isLoading: isSaving }] = useUpdatePageMutation();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: { openOnClick: false },
                codeBlock: false,
            }),
            CodeBlockLowlight.configure({ lowlight }),
            TextAlign.configure({ types: ['paragraph', 'heading'] }),
            TextStyleKit,
            Underline,
            Subscript,
            Superscript,
            Highlight.configure({ multicolor: true }),
            Color,
            Link.configure({ openOnClick: false }),
        ],
        content: '',
        editable: false,
        shouldRerenderOnTransaction: true,
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && page) {
            editor.commands.setContent(page.content ?? '');
        }
    }, [editor, page]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditing);
        }
    }, [editor, isEditing]);

    const handleSave = async () => {
        if (!editor || !spaceKey || !pageId) {
            return;
        }
        await updatePage({
            spaceKey,
            pageId,
            body: { content: editor.getHTML() },
        });
        setIsEditing(false);
    };

    const handleRenameTitle = async (title: string) => {
        if (!spaceKey || !pageId) {
            return;
        }
        await updatePage({ spaceKey, pageId, body: { title } });
    };

    const handleCancel = () => {
        if (editor && page) {
            editor.commands.setContent(page.content ?? '');
        }
        setIsEditing(false);
    };

    if (!orgSlug || !spaceKey || !pageId) {
        return null;
    }

    if (isLoading) {
        return (
            <Center flex="1" h="100%">
                <Spinner size="lg" />
            </Center>
        );
    }

    if (!page) {
        return (
            <Center flex="1" h="100%">
                <Text color="fg.muted">Страница не найдена</Text>
            </Center>
        );
    }

    return (
        <Box flex="1" overflowY="auto" bg="bg.subtle" p={8}>
            <Stack gap={6}>
                <Breadcrumbs
                    orgSlug={orgSlug}
                    spaceKey={spaceKey}
                    pageId={pageId}
                />

                <Stack gap={2}>
                    <Header
                        page={page}
                        isEditing={isEditing}
                        handleRenameTitle={handleRenameTitle}
                        setIsEditing={setIsEditing}
                    />

                    <Editor
                        editor={editor}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        handleSave={handleSave}
                        handleCancel={handleCancel}
                    />
                </Stack>
            </Stack>
        </Box>
    );
};
