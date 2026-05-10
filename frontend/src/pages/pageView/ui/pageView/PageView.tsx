import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Center,
    Grid,
    GridItem,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { all, createLowlight } from 'lowlight';

import {
    useGetPageQuery,
    useGetUserSettingsQuery,
    useUpdatePageMutation,
} from 'shared/api';

import { isPageContentEmpty } from './utils';
import { Breadcrumbs } from '../Breadcrumbs';
import { Editor } from '../Editor';
import { EmptyPageState } from '../EmptyPageState';
import { Header } from '../header/Header';
import { HistoryPanel } from '../history/HistoryPanel';

const lowlight = createLowlight(all);

export const PageView = () => {
    const { orgSlug, spaceKey, pageId } = useParams<{
        orgSlug: string;
        spaceKey: string;
        pageId: string;
    }>();

    const [isEditing, setIsEditing] = useState(false);
    const [isShowingHistory, setIsShowingHistory] = useState(false);
    const { data: userSettings } = useGetUserSettingsQuery();

    const { data: page, isLoading } = useGetPageQuery(
        { orgSlug: orgSlug!, spaceKey: spaceKey!, pageId: pageId! },
        { skip: !orgSlug || !spaceKey || !pageId }
    );

    const [updatePage, { isLoading: isSaving }] = useUpdatePageMutation();
    const isEmptyPage = isPageContentEmpty(page?.content ?? null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: { openOnClick: false },
                codeBlock: false,
            }),
            CodeBlockLowlight.configure({ lowlight }),
            TextAlign.configure({ types: ['paragraph', 'heading'] }),
            TextStyleKit,
            Subscript,
            Image,
            Superscript,
            Highlight.configure({ multicolor: true }),
        ],
        content: '',
        editable: false,
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

    const handleSave = useCallback(async () => {
        if (!editor || !orgSlug || !spaceKey || !pageId) {
            return;
        }
        await updatePage({
            orgSlug,
            spaceKey,
            pageId,
            body: { content: editor.getHTML() },
        });
        setIsEditing(false);
    }, [editor, orgSlug, pageId, spaceKey, updatePage]);

    const handleRenameTitle = useCallback(
        async (title: string) => {
            if (!orgSlug || !spaceKey || !pageId) {
                return;
            }
            await updatePage({ orgSlug, spaceKey, pageId, body: { title } });
        },
        [orgSlug, pageId, spaceKey, updatePage]
    );

    const handleCancel = useCallback(() => {
        if (editor && page) {
            editor.commands.setContent(page.content ?? '');
        }
        setIsEditing(false);
    }, [editor, page]);

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

    const isCompact = userSettings?.editorWidth === 'COMPACT';

    return (
        <Grid
            flex="1"
            templateColumns={isShowingHistory ? '1fr 320px' : '1fr'}
            h="100%"
            overflow="hidden"
        >
            <GridItem overflowY="auto" bg="bg.subtle" p={8}>
                <Stack gap={6}>
                    <Breadcrumbs
                        orgSlug={orgSlug}
                        spaceKey={spaceKey}
                        pageId={pageId}
                    />

                    <Center w="full">
                        <Stack
                            gap={2}
                            alignItems="center"
                            w={isCompact ? '960px' : 'full'}
                        >
                            <Header
                                editorWidth={
                                    userSettings?.editorWidth ?? 'COMPACT'
                                }
                                page={page}
                                isEditing={isEditing}
                                isShowingHistory={isShowingHistory}
                                handleRenameTitle={handleRenameTitle}
                                setIsEditing={setIsEditing}
                                setIsShowingHistory={setIsShowingHistory}
                            />

                            {isEmptyPage && !isEditing ? (
                                <EmptyPageState
                                    editorWidth={
                                        userSettings?.editorWidth ?? 'COMPACT'
                                    }
                                    onStartEditing={() => setIsEditing(true)}
                                />
                            ) : (
                                <Editor
                                    editor={editor}
                                    editorWidth={
                                        userSettings?.editorWidth ?? 'COMPACT'
                                    }
                                    isEditing={isEditing}
                                    isSaving={isSaving}
                                    handleSave={handleSave}
                                    handleCancel={handleCancel}
                                />
                            )}
                        </Stack>
                    </Center>
                </Stack>
            </GridItem>

            {isShowingHistory && (
                <GridItem borderLeftWidth="1px" overflowY="auto" bg="bg">
                    <Box px={4} py={3} borderBottomWidth="1px">
                        <Text fontWeight="medium" fontSize="sm">
                            История изменений
                        </Text>
                    </Box>
                    <HistoryPanel
                        orgSlug={orgSlug}
                        spaceKey={spaceKey}
                        page={page}
                    />
                </GridItem>
            )}
        </Grid>
    );
};
