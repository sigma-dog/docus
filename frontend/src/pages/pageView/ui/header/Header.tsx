import type { FC } from 'react';
import { LuPencil } from 'react-icons/lu';
import { Button, HStack } from '@chakra-ui/react';

import type { Page } from 'shared/types';

import { LastEdited } from './lastEdited/LastEdited';
import { TitleRename } from './TitleRename';

type HeaderProps = {
    page: Page;
    isEditing: boolean;
    handleRenameTitle: (title: string) => void;
    setIsEditing: (value: boolean) => void;
};

export const Header: FC<HeaderProps> = ({
    page,
    isEditing,
    handleRenameTitle,
    setIsEditing,
}) => {
    return (
        <HStack justify="space-between" mb={6}>
            <TitleRename title={page.title} onRename={handleRenameTitle} />
            {!isEditing && (
                <HStack gap={3} flexShrink={0}>
                    <LastEdited page={page} />
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
