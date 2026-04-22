import type { FC } from 'react';
import { LuPencil } from 'react-icons/lu';
import { Button, HStack, Text } from '@chakra-ui/react';

import type { Page } from 'shared/types';

type HeaderProps = {
    page: Page;
    isEditing: boolean;
    isSaving: boolean;
    handleSave: () => void;
    handleCancel: () => void;
    setIsEditing: (value: boolean) => void;
};

export const Header: FC<HeaderProps> = ({
    page,
    isEditing,
    isSaving,
    handleSave,
    handleCancel,
    setIsEditing,
}) => {
    return (
        <HStack justify="space-between" mb={6}>
            <Text fontSize="2xl" fontWeight="bold">
                {page.title}
            </Text>
            <HStack gap={2}>
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
