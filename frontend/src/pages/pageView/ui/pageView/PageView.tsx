import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useCurrentSpacePermissions } from 'shared/lib';

import { isPageContentEmpty } from './utils';
import { extractTocHeadings } from './utils';
import { Breadcrumbs } from '../Breadcrumbs';
import { Editor } from '../Editor';
import { EmptyPageState } from '../EmptyPageState';
import { Header } from '../header/Header';
import { HistoryPanel } from '../history/HistoryPanel';
import { TableOfContents } from '../TableOfContents';

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
    const { canEdit } = useCurrentSpacePermissions();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const { data: page, isLoading } = useGetPageQuery(
        { orgSlug: orgSlug!, spaceKey: spaceKey!, pageId: pageId! },
        { skip: !orgSlug || !spaceKey || !pageId }
    );

    const [updatePage, { isLoading: isSaving }] = useUpdatePageMutation();
    const isEmptyPage = isPageContentEmpty(page?.content ?? null);
    const effectiveIsEditing = isEditing && canEdit;
    const tocHeadings = useMemo(
        () => extractTocHeadings(page?.content ?? null),
        [page?.content]
    );

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
        if (!contentRef.current) {
            return;
        }

        const headingElements = contentRef.current.querySelectorAll(
            'h1, h2, h3, h4, h5, h6'
        );

        headingElements.forEach((heading, index) => {
            const tocHeading = tocHeadings[index];

            if (!(heading instanceof HTMLElement)) {
                return;
            }

            if (!tocHeading) {
                heading.removeAttribute('data-toc-id');
                return;
            }

            heading.setAttribute('data-toc-id', tocHeading.id);
            heading.style.scrollMarginTop = '24px';
        });
    }, [tocHeadings, page?.content]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(effectiveIsEditing);
        }
    }, [editor, effectiveIsEditing]);

    const handleSave = async () => {
        if (!editor || !orgSlug || !spaceKey || !pageId) {
            return;
        }
        if (!canEdit) {
            return;
        }
        await updatePage({
            orgSlug,
            spaceKey,
            pageId,
            body: { content: editor.getHTML() },
        });
        setIsEditing(false);
    };

    const handleRenameTitle = async (title: string) => {
        if (!orgSlug || !spaceKey || !pageId) {
            return;
        }
        if (!canEdit) {
            return;
        }
        await updatePage({ orgSlug, spaceKey, pageId, body: { title } });
    };

    const handleCancel = () => {
        if (editor && page) {
            editor.commands.setContent(page.content ?? '');
        }
        setIsEditing(false);
    };

    const handleTocSelect = (headingId: string) => {
        if (!scrollContainerRef.current || !contentRef.current) {
            return;
        }

        const heading = contentRef.current.querySelector(
            `[data-toc-id="${headingId}"]`
        );

        if (!(heading instanceof HTMLElement)) {
            return;
        }

        const scrollContainer = scrollContainerRef.current;
        const offset = 24;
        const top =
            scrollContainer.scrollTop +
            heading.getBoundingClientRect().top -
            scrollContainer.getBoundingClientRect().top -
            offset;

        scrollContainer.scrollTo({
            top,
            behavior: 'smooth',
        });
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

    const isCompact = userSettings?.editorWidth === 'COMPACT';

    return (
        <Grid
            flex="1"
            templateColumns={{
                base: '1fr',
                xl: isShowingHistory ? 'minmax(0, 1fr) 320px' : '1fr',
            }}
            h="100%"
            overflow="hidden"
        >
            <GridItem
                ref={scrollContainerRef}
                overflowY="auto"
                bg="bg.subtle"
                p={8}
            >
                <Stack gap={6}>
                    <Breadcrumbs
                        orgSlug={orgSlug}
                        spaceKey={spaceKey}
                        pageId={pageId}
                    />

                    <Grid
                        w="full"
                        templateColumns={{
                            base: '1fr',
                            xl:
                                tocHeadings.length > 0
                                    ? '240px minmax(0, 1fr)'
                                    : '1fr',
                        }}
                        gap={6}
                        alignItems="start"
                    >
                        {tocHeadings.length > 0 && (
                            <GridItem
                                display={{ base: 'none', xl: 'block' }}
                                position="sticky"
                                top="-30px"
                                alignSelf="start"
                            >
                                <TableOfContents
                                    headings={tocHeadings}
                                    onSelect={handleTocSelect}
                                />
                            </GridItem>
                        )}

                        <Center w="full">
                            <Stack
                                gap={2}
                                alignItems="center"
                                w={isCompact ? '960px' : 'full'}
                            >
                                <Header
                                    canEdit={canEdit}
                                    editorWidth={
                                        userSettings?.editorWidth ?? 'COMPACT'
                                    }
                                    page={page}
                                    isEditing={effectiveIsEditing}
                                    isShowingHistory={isShowingHistory}
                                    handleRenameTitle={handleRenameTitle}
                                    setIsEditing={setIsEditing}
                                    setIsShowingHistory={setIsShowingHistory}
                                />

                                {isEmptyPage && !effectiveIsEditing ? (
                                    <EmptyPageState
                                        canEdit={canEdit}
                                        editorWidth={
                                            userSettings?.editorWidth ??
                                            'COMPACT'
                                        }
                                        onStartEditing={
                                            canEdit
                                                ? () => setIsEditing(true)
                                                : undefined
                                        }
                                    />
                                ) : (
                                    <Editor
                                        editor={editor}
                                        editorWidth={
                                            userSettings?.editorWidth ??
                                            'COMPACT'
                                        }
                                        contentRef={contentRef}
                                        isEditing={effectiveIsEditing}
                                        isSaving={isSaving}
                                        handleSave={handleSave}
                                        handleCancel={handleCancel}
                                    />
                                )}
                            </Stack>
                        </Center>
                    </Grid>
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
