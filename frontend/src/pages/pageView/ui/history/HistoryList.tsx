import type { Dispatch, FC, SetStateAction } from 'react';
import { Box, Center, Stack, Text } from '@chakra-ui/react';

import type { Page, PageHistoryEntry } from 'shared/types';

import { HistoryItem } from './HistoryItem';
import type { DiffTarget } from '../../lib/types';

type HistoryListProps = {
    history: PageHistoryEntry[];
    page: Page;
    canEdit: boolean;
    setDiffTarget: Dispatch<SetStateAction<DiffTarget | null>>;
    setRestoreTarget: Dispatch<SetStateAction<PageHistoryEntry | null>>;
};

export const HistoryList: FC<HistoryListProps> = ({
    history,
    page,
    canEdit,
    setDiffTarget,
    setRestoreTarget,
}) => {
    return (
        <Box px={6} py={4} w="full">
            <Stack gap={3}>
                {!history || history.length === 0 ? (
                    <Center py={8}>
                        <Text color="fg.muted">Пока нет прошлых изменений</Text>
                    </Center>
                ) : (
                    history.map((entry, index) => (
                        <HistoryItem
                            entry={entry}
                            index={index}
                            history={history}
                            page={page}
                            canEdit={canEdit}
                            setDiffTarget={setDiffTarget}
                            setRestoreTarget={setRestoreTarget}
                        />
                    ))
                )}
            </Stack>
        </Box>
    );
};
