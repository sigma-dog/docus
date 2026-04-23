import type { FC } from 'react';
import { LuPencil } from 'react-icons/lu';
import { Button, HStack } from '@chakra-ui/react';

import type { Page } from 'shared/types';

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
                <Button
                    size="sm"
                    variant="subtle"
                    flexShrink={0}
                    onClick={() => setIsEditing(true)}
                >
                    <LuPencil />
                    Редактировать
                </Button>
            )}
        </HStack>
    );
};
