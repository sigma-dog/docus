import { type FC, type ReactElement, useState } from 'react';
import { LuSettings } from 'react-icons/lu';
import {
    Button,
    CloseButton,
    createListCollection,
    Dialog,
    Field,
    Menu,
    Portal,
    Select,
    Skeleton,
    Stack,
} from '@chakra-ui/react';

import {
    useGetUserSettingsQuery,
    useUpdateUserSettingsMutation,
} from 'shared/api';
import { type EditorWidth, editorWidthValues } from 'shared/types';
import { toaster } from 'shared/ui/chakra/toaster';

type UserSettingsMenuProps = {
    trigger: ReactElement;
};

type UserSettingsDialogProps = {
    trigger: ReactElement;
};

type UserSettingsModalProps = {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    trigger?: ReactElement;
};

const editorWidthOptions = [
    { label: 'На всю ширину', value: editorWidthValues.fullWidth },
    { label: 'Компактный', value: editorWidthValues.compact },
] as const;

const editorWidthCollection = createListCollection({
    items: editorWidthOptions,
});

const UserSettingsModal: FC<UserSettingsModalProps> = ({
    isOpen,
    setIsOpen,
    trigger,
}) => {
    const { data: settings, isLoading } = useGetUserSettingsQuery();
    const [updateUserSettings, { isLoading: isSaving }] =
        useUpdateUserSettingsMutation();
    const [draftEditorWidth, setDraftEditorWidth] =
        useState<EditorWidth | null>(null);

    const editorWidth =
        draftEditorWidth ?? settings?.editorWidth ?? editorWidthValues.compact;

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setDraftEditorWidth(null);
        }
    };

    const handleSave = async () => {
        try {
            await updateUserSettings({ editorWidth }).unwrap();
            handleOpenChange(false);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось сохранить настройки',
            });
        }
    };

    return (
        <Dialog.Root
            lazyMount
            open={isOpen}
            placement="center"
            onOpenChange={(e) => handleOpenChange(e.open)}
        >
            {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Настройки пользователя</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            {isLoading ? (
                                <Stack gap={3}>
                                    <Skeleton h="5" w="28" />
                                    <Skeleton h="10" borderRadius="md" />
                                </Stack>
                            ) : (
                                <Stack gap={4}>
                                    <Field.Root>
                                        <Field.Label>
                                            Размер редактора
                                        </Field.Label>
                                        <Select.Root
                                            collection={editorWidthCollection}
                                            value={[editorWidth]}
                                            onValueChange={(details) =>
                                                setDraftEditorWidth(
                                                    details
                                                        .value[0] as EditorWidth
                                                )
                                            }
                                        >
                                            <Select.Control>
                                                <Select.Trigger>
                                                    <Select.ValueText placeholder="Выберите размер" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content>
                                                        {editorWidthCollection.items.map(
                                                            (item) => (
                                                                <Select.Item
                                                                    key={
                                                                        item.value
                                                                    }
                                                                    item={item}
                                                                >
                                                                    <Select.ItemText>
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </Select.ItemText>
                                                                </Select.Item>
                                                            )
                                                        )}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Portal>
                                        </Select.Root>
                                    </Field.Root>
                                </Stack>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSaving}
                            >
                                Отмена
                            </Button>
                            <Button
                                colorPalette="blue"
                                onClick={handleSave}
                                loading={isSaving}
                                disabled={isLoading}
                            >
                                Сохранить
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export const UserSettingsDialog: FC<UserSettingsDialogProps> = ({
    trigger,
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <UserSettingsModal
            isOpen={isSettingsOpen}
            setIsOpen={setIsSettingsOpen}
            trigger={trigger}
        />
    );
};

export const UserSettingsMenu: FC<UserSettingsMenuProps> = ({ trigger }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <Menu.Root>
                <Menu.Trigger asChild>{trigger}</Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content minW="180px">
                            <Menu.Item
                                value="settings"
                                onClick={() => setIsSettingsOpen(true)}
                            >
                                <LuSettings />
                                Настройки
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>

            <UserSettingsModal
                isOpen={isSettingsOpen}
                setIsOpen={setIsSettingsOpen}
            />
        </>
    );
};
