import type { FC } from 'react';
import { LuHistory, LuPencil } from 'react-icons/lu';
import { Button, HStack } from '@chakra-ui/react';

import type { Page } from 'shared/types';

import { TitleRename } from './TitleRename';
import { LastEdited } from '../lastEdited/LastEdited';

type HeaderProps = {
    page: Page;
    isEditing: boolean;
    isShowingHistory: boolean;
    handleRenameTitle: (title: string) => void;
    setIsEditing: (value: boolean) => void;
    setIsShowingHistory: (value: boolean) => void;
};

export const Header: FC<HeaderProps> = ({
    page,
    isEditing,
    isShowingHistory,
    handleRenameTitle,
    setIsEditing,
    setIsShowingHistory,
}) => {
    return (
        <HStack justify="space-between" mb={6} w="full">
            <TitleRename title={page.title} onRename={handleRenameTitle} />
            {!isEditing && (
                <HStack gap={3} flexShrink={0}>
                    <LastEdited page={page} />
                    <Button
                        size="sm"
                        variant={isShowingHistory ? 'solid' : 'subtle'}
                        colorPalette={isShowingHistory ? 'blue' : undefined}
                        onClick={() => setIsShowingHistory(!isShowingHistory)}
                    >
                        <LuHistory />
                        История
                    </Button>
                    <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => setIsEditing(true)}
                    >
                        <LuPencil />
                        Редактировать
                    </Button>
                </HStack>
            )}
        </HStack>
    );
};
