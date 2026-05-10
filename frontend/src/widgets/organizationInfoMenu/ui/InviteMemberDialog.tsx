import type { FC } from 'react';
import { LuCopy } from 'react-icons/lu';
import {
    Button,
    CloseButton,
    Dialog,
    Field,
    HStack,
    Input,
    Portal,
    Select,
    Stack,
    Text,
} from '@chakra-ui/react';

import type { EditableOrgRole } from './constants';
import { inviteRoleOptions } from './constants';

type InviteMemberDialogProps = {
    isOpen: boolean;
    inviteRole: EditableOrgRole;
    inviteCode: string;
    isCreatingInvite: boolean;
    onClose: () => void;
    onInviteRoleChange: (role: EditableOrgRole) => void;
    onCreateInvite: () => void;
    onCopyInviteCode: () => void;
};

export const InviteMemberDialog: FC<InviteMemberDialogProps> = ({
    isOpen,
    inviteRole,
    inviteCode,
    isCreatingInvite,
    onClose,
    onInviteRoleChange,
    onCreateInvite,
    onCopyInviteCode,
}) => {
    return (
        <Dialog.Root
            lazyMount
            open={isOpen}
            placement="center"
            onOpenChange={(details) => {
                if (!details.open) {
                    onClose();
                }
            }}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Добавить участника</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap={4}>
                                <Text color="fg.muted" fontSize="sm">
                                    Сгенерируйте инвайт-код и отправьте его
                                    пользователю, которого хотите добавить в
                                    организацию.
                                </Text>

                                <Field.Root>
                                    <Field.Label>Права доступа</Field.Label>
                                    <Select.Root
                                        collection={inviteRoleOptions}
                                        value={[inviteRole]}
                                        onValueChange={(details) => {
                                            const value = details.value[0];
                                            if (
                                                value === 'ADMIN' ||
                                                value === 'MEMBER'
                                            ) {
                                                onInviteRoleChange(value);
                                            }
                                        }}
                                    >
                                        <Select.Control>
                                            <Select.Trigger>
                                                <Select.ValueText placeholder="Выберите роль" />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Select.Positioner>
                                            <Select.Content>
                                                {inviteRoleOptions.items.map(
                                                    (item) => (
                                                        <Select.Item
                                                            key={item.value}
                                                            item={item}
                                                        >
                                                            {item.label}
                                                        </Select.Item>
                                                    )
                                                )}
                                            </Select.Content>
                                        </Select.Positioner>
                                    </Select.Root>
                                </Field.Root>

                                {inviteCode ? (
                                    <Field.Root>
                                        <Field.Label>Инвайт-код</Field.Label>
                                        <HStack>
                                            <Input
                                                value={inviteCode}
                                                readOnly
                                                fontFamily="mono"
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={onCopyInviteCode}
                                            >
                                                <LuCopy />
                                                Копировать
                                            </Button>
                                        </HStack>
                                    </Field.Root>
                                ) : null}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="outline" onClick={onClose}>
                                Закрыть
                            </Button>
                            <Button
                                colorPalette="blue"
                                loading={isCreatingInvite}
                                onClick={onCreateInvite}
                            >
                                {inviteCode
                                    ? 'Создать новый код'
                                    : 'Сгенерировать код'}
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
