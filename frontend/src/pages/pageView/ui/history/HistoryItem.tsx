import type { Dispatch, FC, SetStateAction } from 'react';
import { LuClock, LuEye, LuRotateCcw, LuUser } from 'react-icons/lu';
import { Avatar, Badge, Box, HStack, IconButton, Text } from '@chakra-ui/react';

import type { Page, PageHistoryEntry } from 'shared/types';

import type { DiffTarget, VersionState } from '../../lib/types';
import { formatDate, getActionLabel } from '../../lib/utils';

type HistoryItemProps = {
    entry: PageHistoryEntry;
    history: PageHistoryEntry[];
    index: number;
    page: Page;
    canEdit: boolean;
    setDiffTarget: Dispatch<SetStateAction<DiffTarget | null>>;
    setRestoreTarget: Dispatch<SetStateAction<PageHistoryEntry | null>>;
};

export const HistoryItem: FC<HistoryItemProps> = ({
    entry,
    index,
    page,
    history,
    canEdit,
    setDiffTarget,
    setRestoreTarget,
}) => {
    const currentVersionState: VersionState = {
        title: page.title,
        content: page.content,
    };

    const nextVersionState: VersionState = {
        title: index > 0 ? history[index - 1].title : currentVersionState.title,
        content:
            index > 0
                ? history[index - 1].content
                : currentVersionState.content,
    };

    const previousVersionState: VersionState = {
        title: entry.title,
        content: entry.content,
    };

    const olderVersions = history.slice(index + 1).map((item) => ({
        title: item.title,
        content: item.content,
    }));

    const actionLabel = getActionLabel(
        previousVersionState,
        nextVersionState,
        olderVersions
    );

    const isCurrent = index === 0;

    const openDiff = (entry: PageHistoryEntry, index: number) => {
        const next = index > 0 ? (history?.[index - 1] ?? null) : null;
        setDiffTarget({
            entry,
            next,
            currentTitle: page.title,
            currentContent: page.content,
        });
    };

    return (
        <Box
            w="full"
            key={entry.id}
            role="group"
            position="relative"
            borderWidth="1px"
            borderColor={isCurrent ? 'blue.200' : 'border.emphasized'}
            bg={isCurrent ? 'blue.50' : 'bg'}
            rounded="xl"
            px={4}
            py={3}
        >
            <HStack align="start" gap={3} w="full">
                <Avatar.Root size="sm" shape="full">
                    {entry.author.avatarUrl ? (
                        <Avatar.Image src={entry.author.avatarUrl} />
                    ) : null}
                    <Avatar.Fallback name={entry.author.username} />
                </Avatar.Root>
                <Box flex="1" minW="0">
                    <HStack gap={2} wrap="wrap" align="center">
                        <Text fontSize="sm" fontWeight="semibold">
                            {actionLabel}
                        </Text>
                        {isCurrent && (
                            <Badge
                                size="sm"
                                colorPalette="blue"
                                variant="subtle"
                            >
                                Текущая
                            </Badge>
                        )}
                    </HStack>

                    <HStack
                        gap={2}
                        color="fg.muted"
                        mt={2}
                        fontSize="xs"
                        wrap="wrap"
                    >
                        <LuUser size={12} />
                        <Text>{entry.author.username}</Text>
                        <Text>·</Text>
                        <LuClock size={12} />
                        <Text>{formatDate(entry.createdAt)}</Text>
                    </HStack>
                </Box>
                <HStack gap={1} transition="opacity 0.2s ease">
                    <IconButton
                        size="2xs"
                        variant="ghost"
                        colorPalette="blue"
                        aria-label="Посмотреть изменения"
                        title="Посмотреть изменения"
                        onClick={() => openDiff(entry, index)}
                    >
                        <LuEye />
                    </IconButton>
                    {canEdit && (
                        <IconButton
                            size="2xs"
                            variant="ghost"
                            colorPalette="orange"
                            aria-label="Откатить к этой версии"
                            disabled={isCurrent}
                            onClick={() => setRestoreTarget(entry)}
                            title={
                                isCurrent
                                    ? 'Это уже текущая версия'
                                    : 'Откатить к этой версии'
                            }
                        >
                            <LuRotateCcw />
                        </IconButton>
                    )}
                </HStack>
            </HStack>
        </Box>
    );
};
