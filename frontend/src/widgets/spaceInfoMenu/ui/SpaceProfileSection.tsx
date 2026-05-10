import { type FC, type FormEvent } from 'react';
import { LuPencil } from 'react-icons/lu';
import {
    Avatar,
    Button,
    Field,
    HStack,
    IconButton,
    Input,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react';

type SpaceProfileSectionProps = {
    name: string;
    spaceKey: string;
    description: string | null;
    editingName: string;
    editingDescription: string;
    isEditingName: boolean;
    isEditingDescription: boolean;
    isSaving: boolean;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onStartEditingName: () => void;
    onStartEditingDescription: () => void;
    onResetName: () => void;
    onResetDescription: () => void;
    onSubmitName: (event: FormEvent) => void;
    onSubmitDescription: (event: FormEvent) => void;
};

export const SpaceProfileSection: FC<SpaceProfileSectionProps> = ({
    name,
    spaceKey,
    description,
    editingName,
    editingDescription,
    isEditingName,
    isEditingDescription,
    isSaving,
    onNameChange,
    onDescriptionChange,
    onStartEditingName,
    onStartEditingDescription,
    onResetName,
    onResetDescription,
    onSubmitName,
    onSubmitDescription,
}) => {
    return (
        <HStack gap={4} align="flex-start" minW={0}>
            <Avatar.Root size="xl" shape="rounded">
                <Avatar.Fallback name={name} />
            </Avatar.Root>

            <Stack gap={3} minW={0} flex="1">
                <Stack gap={1}>
                    {isEditingName ? (
                        <form onSubmit={onSubmitName}>
                            <HStack gap={2} align="center">
                                <Input
                                    size="sm"
                                    value={editingName}
                                    onChange={(event) =>
                                        onNameChange(event.target.value)
                                    }
                                    onBlur={onResetName}
                                    autoFocus
                                    maxW="full"
                                    fontSize="md"
                                    fontWeight="semibold"
                                    h="8"
                                />
                                <Button
                                    type="submit"
                                    size="xs"
                                    colorPalette="blue"
                                    loading={isSaving}
                                    disabled={!editingName.trim()}
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                >
                                    Сохранить
                                </Button>
                            </HStack>
                        </form>
                    ) : (
                        <HStack gap={2} align="center">
                            <Text
                                fontSize="xl"
                                fontWeight="semibold"
                                lineHeight="short"
                                lineClamp={1}
                                maxW="full"
                            >
                                {name}
                            </Text>
                            <IconButton
                                aria-label="Редактировать название пространства"
                                variant="ghost"
                                size="xs"
                                onClick={onStartEditingName}
                            >
                                <LuPencil />
                            </IconButton>
                        </HStack>
                    )}

                    <Text color="fg.muted" fontSize="sm">
                        Ключ: {spaceKey}
                    </Text>
                </Stack>

                {isEditingDescription ? (
                    <form onSubmit={onSubmitDescription}>
                        <Stack gap={3}>
                            <Field.Root>
                                <Field.Label>Описание</Field.Label>
                                <Textarea
                                    value={editingDescription}
                                    onChange={(event) =>
                                        onDescriptionChange(event.target.value)
                                    }
                                    resize="none"
                                    rows={4}
                                    placeholder="Краткое описание пространства"
                                />
                            </Field.Root>
                            <HStack justify="flex-end">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={onResetDescription}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    colorPalette="blue"
                                    loading={isSaving}
                                >
                                    Сохранить
                                </Button>
                            </HStack>
                        </Stack>
                    </form>
                ) : (
                    <HStack align="flex-start" gap={2}>
                        <Text color="fg.muted" fontSize="sm" flex="1">
                            {description || 'Описание пока не добавлено'}
                        </Text>
                        <IconButton
                            aria-label="Редактировать описание пространства"
                            variant="ghost"
                            size="xs"
                            onClick={onStartEditingDescription}
                        >
                            <LuPencil />
                        </IconButton>
                    </HStack>
                )}
            </Stack>
        </HStack>
    );
};
