import type { FC } from 'react';
import { LuEllipsis } from 'react-icons/lu';
import {
    HStack,
    IconButton,
    Menu,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react';
import type { useEditor } from '@tiptap/react';

import { RichTextEditorControl } from 'shared/ui';

type CompactMoreControlsProps = {
    editor: ReturnType<typeof useEditor> | null;
};

export const CompactMoreControls: FC<CompactMoreControlsProps> = ({
    editor,
}) => {
    if (!editor) {
        return null;
    }

    return (
        <Menu.Root positioning={{ placement: 'bottom-end' }}>
            <Menu.Trigger asChild>
                <IconButton
                    aria-label="Дополнительные инструменты"
                    variant="ghost"
                    size="2xs"
                >
                    <LuEllipsis />
                </IconButton>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content p={3} minW="220px">
                        <Stack gap={3}>
                            <Stack gap={2}>
                                <Text
                                    fontSize="xs"
                                    textTransform="uppercase"
                                    color="fg.muted"
                                >
                                    Вставка и код
                                </Text>
                                <HStack gap={1}>
                                    <RichTextEditorControl.InsertImageControl />
                                    <RichTextEditorControl.CodeBlockLanguage />
                                </HStack>
                            </Stack>

                            <Stack gap={2}>
                                <Text
                                    fontSize="xs"
                                    textTransform="uppercase"
                                    color="fg.muted"
                                >
                                    Выравнивание
                                </Text>
                                <HStack gap={1}>
                                    <RichTextEditorControl.AlignLeft />
                                    <RichTextEditorControl.AlignCenter />
                                    <RichTextEditorControl.AlignRight />
                                </HStack>
                            </Stack>

                            <Stack gap={2}>
                                <Text
                                    fontSize="xs"
                                    textTransform="uppercase"
                                    color="fg.muted"
                                >
                                    Ссылки
                                </Text>
                                <HStack gap={1}>
                                    <RichTextEditorControl.Link />
                                    <RichTextEditorControl.Unlink />
                                </HStack>
                            </Stack>
                        </Stack>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
};
