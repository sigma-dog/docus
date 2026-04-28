import type { FC } from 'react';
import { useState } from 'react';
import { LuClock, LuUser } from 'react-icons/lu';
import {
    Box,
    Button,
    Center,
    Dialog,
    HStack,
    Spinner,
    Stack,
    Text,
    Timeline,
} from '@chakra-ui/react';

import { useGetPageHistoryQuery } from 'shared/api';
import type { Page, PageHistoryEntry } from 'shared/types';

import { DiffViewer } from './diffViewer/DiffViewer';
import { LastEdited } from '../lastEdited/LastEdited';

type Props = {
    orgSlug: string;
    spaceKey: string;
    page: Page;
};

type DiffTarget = {
    entry: PageHistoryEntry;
    next: PageHistoryEntry | null;
    currentContent: string | null;
};

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
}

export const HistoryPanel: FC<Props> = ({ orgSlug, spaceKey, page }) => {
    const { data: history, isLoading } = useGetPageHistoryQuery({
        orgSlug,
        spaceKey,
        pageId: page.id,
    });

    const [diffTarget, setDiffTarget] = useState<DiffTarget | null>(null);

    if (isLoading) {
        return (
            <Center py={8}>
                <Spinner />
            </Center>
        );
    }

    if (!history || history.length === 0) {
        return (
            <Center py={8}>
                <Text color="fg.muted">История изменений пуста</Text>
            </Center>
        );
    }

    const openDiff = (entry: PageHistoryEntry, index: number) => {
        // entry is the snapshot *before* this edit
        // next snapshot (index - 1) is what it became, or current page content if it's the latest
        const next = index > 0 ? history[index - 1] : null;
        setDiffTarget({ entry, next, currentContent: page.content });
    };

    // The "new" content for the diff: next snapshot's content, or current page if newest
    const getDiffNew = (target: DiffTarget): string => {
        if (target.next) {
            return target.next.content ?? '';
        }
        return target.currentContent ?? '';
    };

    return (
        <>
            <Box px={6} py={4}>
                <Timeline.Root>
                    {history.map((entry, index) => (
                        <Timeline.Item key={entry.id}>
                            <Timeline.Connector>
                                <Timeline.Separator />
                                <Timeline.Indicator>
                                    <LuClock size={12} />
                                </Timeline.Indicator>
                            </Timeline.Connector>
                            <Timeline.Content pb={6}>
                                <Stack gap={1}>
                                    <Text fontSize="sm" fontWeight="medium">
                                        {entry.title}
                                    </Text>
                                    <HStack gap={2} color="fg.muted">
                                        <LuUser size={12} />
                                        <Text fontSize="xs">
                                            {entry.author.username}
                                        </Text>
                                        <Text fontSize="xs">·</Text>
                                        <Text fontSize="xs">
                                            {formatDate(entry.createdAt)}
                                        </Text>
                                    </HStack>
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        colorPalette="blue"
                                        alignSelf="flex-start"
                                        mt={1}
                                        onClick={() => openDiff(entry, index)}
                                    >
                                        Посмотреть изменения
                                    </Button>
                                </Stack>
                            </Timeline.Content>
                        </Timeline.Item>
                    ))}
                </Timeline.Root>
            </Box>

            <Dialog.Root
                open={diffTarget !== null}
                onOpenChange={({ open }) => {
                    if (!open) {
                        setDiffTarget(null);
                    }
                }}
                size="cover"
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content display="flex" flexDirection="column">
                        <Dialog.Header
                            borderBottomWidth="1px"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Dialog.Title>
                                {diffTarget
                                    ? `История: ${diffTarget.entry.title}`
                                    : ''}
                            </Dialog.Title>

                            <LastEdited page={page} />
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body flex="1" overflow="hidden" p={4}>
                            {diffTarget && (
                                <DiffViewer
                                    oldHtml={diffTarget.entry.content ?? ''}
                                    newHtml={getDiffNew(diffTarget)}
                                />
                            )}
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
};
