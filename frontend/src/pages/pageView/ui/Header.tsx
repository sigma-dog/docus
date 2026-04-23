import type { FC } from 'react';
import { LuPencil } from 'react-icons/lu';
import { Button, HStack } from '@chakra-ui/react';

import type { Page } from 'shared/types';

import { TitleRename } from './TitleRename';

type HeaderProps = {
    page: Page;
    isEditing: boolean;
    isSaving: boolean;
    handleSave: () => void;
    handleCancel: () => void;
    handleRenameTitle: (title: string) => void;
    setIsEditing: (value: boolean) => void;
};

export const Header: FC<HeaderProps> = ({
    page,
    isEditing,
    isSaving,
    handleSave,
    handleCancel,
    handleRenameTitle,
    setIsEditing,
}) => {
    return (
        <HStack justify="space-between" mb={6}>
            <TitleRename title={page.title} onRename={handleRenameTitle} />
            <HStack gap={2} flexShrink={0}>
                {isEditing ? (
                    <>
                        <Button
                            size="sm"
                            colorPalette="blue"
                            onClick={handleSave}
                            loading={isSaving}
                        >
                            Сохранить
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            Отмена
                        </Button>
                    </>
                ) : (
                    <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => setIsEditing(true)}
                    >
                        <LuPencil />
                        Редактировать
                    </Button>
                )}
            </HStack>
        </HStack>
    );
};
