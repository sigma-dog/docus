import type { FC } from 'react';
import { LuHistory, LuPencil } from 'react-icons/lu';
import { Button, HStack } from '@chakra-ui/react';

import type { EditorWidth, Page } from 'shared/types';

import { TitleRename } from './TitleRename';
import { LastEdited } from '../lastEdited/LastEdited';

type HeaderProps = {
    page: Page;
    canEdit: boolean;
    isEditing: boolean;
    isShowingHistory: boolean;
    handleRenameTitle: (title: string) => void;
    setIsEditing: (value: boolean) => void;
    setIsShowingHistory: (value: boolean) => void;
    editorWidth: EditorWidth;
};

export const Header: FC<HeaderProps> = ({
    page,
    canEdit,
    isEditing,
    isShowingHistory,
    handleRenameTitle,
    setIsEditing,
    setIsShowingHistory,
    editorWidth,
}) => {
    const isCompact = editorWidth === 'COMPACT';

    return (
        <HStack
            justify="space-between"
            mb={6}
            minW={0}
            gap={4}
            width={isCompact ? '960px' : 'full'}
        >
            <TitleRename
                title={page.title}
                onRename={handleRenameTitle}
                canEdit={canEdit}
            />
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
                    {canEdit && (
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
            )}
        </HStack>
    );
};
