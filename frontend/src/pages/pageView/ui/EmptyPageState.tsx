import type { FC } from 'react';
import { LuFilePenLine } from 'react-icons/lu';
import { Button, EmptyState, VStack } from '@chakra-ui/react';

import type { EditorWidth } from 'shared/types';

type EmptyPageStateProps = {
    onStartEditing: () => void;
    editorWidth: EditorWidth;
};

export const EmptyPageState: FC<EmptyPageStateProps> = ({
    onStartEditing,
    editorWidth,
}) => {
    const isCompact = editorWidth === 'COMPACT';

    return (
        <EmptyState.Root
            w={isCompact ? '960px' : 'full'}
            size="lg"
            colorPalette="blue"
            minH="420px"
        >
            <EmptyState.Content>
                <EmptyState.Indicator>
                    <LuFilePenLine />
                </EmptyState.Indicator>
                <VStack textAlign="center" gap={2}>
                    <EmptyState.Title>Эта статья еще пуста</EmptyState.Title>
                    <EmptyState.Description maxW="sm">
                        Добавьте первый текст, изображения или заметки, чтобы
                        начать наполнять страницу.
                    </EmptyState.Description>
                </VStack>
                <Button size="sm" colorPalette="blue" onClick={onStartEditing}>
                    Начать редактирование
                </Button>
            </EmptyState.Content>
        </EmptyState.Root>
    );
};
