import { type FC, useState } from 'react';
import { LuEllipsis, LuShield, LuTrash2, LuUndo2 } from 'react-icons/lu';
import {
    Button,
    CloseButton,
    Dialog,
    IconButton,
    Menu,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react';

import type { SpaceAccessMember } from 'shared/types';

import { editableRoles, type EditableSpaceRole, roleLabels } from './constants';

type MemberActionsMenuProps = {
    member: SpaceAccessMember;
    canManageMember: boolean;
    canResetToInherited: boolean;
    canRemoveFromSpace: boolean;
    isUpdatingRole: boolean;
    onChangeRole: (role: EditableSpaceRole) => Promise<void>;
    onResetToInherited: () => Promise<void>;
    onRemoveFromSpace: () => Promise<void>;
};

export const MemberActionsMenu: FC<MemberActionsMenuProps> = ({
    member,
    canManageMember,
    canResetToInherited,
    canRemoveFromSpace,
    isUpdatingRole,
    onChangeRole,
    onResetToInherited,
    onRemoveFromSpace,
}) => {
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleRoleChange = async (role: EditableSpaceRole) => {
        await onChangeRole(role);
        setIsRoleOpen(false);
    };

    const handleResetToInherited = async () => {
        await onResetToInherited();
        setIsRoleOpen(false);
    };

    const handleRemoveFromSpace = async () => {
        await onRemoveFromSpace();
        setIsDeleteOpen(false);
    };

    return (
        <>
            <Menu.Root positioning={{ placement: 'bottom-end' }}>
                <Menu.Trigger asChild>
                    <IconButton
                        aria-label={`Действия для ${member.user.username}`}
                        variant="ghost"
                        size="xs"
                        disabled={!canManageMember}
                    >
                        <LuEllipsis />
                    </IconButton>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content minW="220px">
                            <Menu.Item
                                value={`change-role-${member.userId}`}
                                disabled={!canManageMember}
                                onClick={() => setIsRoleOpen(true)}
                            >
                                <LuShield />
                                Изменить права доступа
                            </Menu.Item>
                            {canRemoveFromSpace && (
                                <Menu.Item
                                    value={`remove-space-${member.userId}`}
                                    color="fg.error"
                                    _hover={{
                                        bg: 'bg.error',
                                        color: 'fg.error',
                                    }}
                                    onClick={() => setIsDeleteOpen(true)}
                                >
                                    <LuTrash2 />
                                    Удалить доступ к пространству
                                </Menu.Item>
                            )}
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>

            <Dialog.Root
                lazyMount
                open={isRoleOpen}
                placement="center"
                onOpenChange={(details) => setIsRoleOpen(details.open)}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    Права доступа: {member.user.username}
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Stack gap={3}>
                                    <Text color="fg.muted" fontSize="sm">
                                        Выберите роль для этого пространства.
                                    </Text>
                                    {editableRoles.map((role) => (
                                        <Button
                                            key={role}
                                            variant={
                                                member.role === role
                                                    ? 'solid'
                                                    : 'outline'
                                            }
                                            justifyContent="space-between"
                                            colorPalette={
                                                member.role === role
                                                    ? 'blue'
                                                    : undefined
                                            }
                                            disabled={
                                                isUpdatingRole &&
                                                member.role === role
                                            }
                                            loading={
                                                isUpdatingRole &&
                                                member.role !== role
                                            }
                                            onClick={() =>
                                                handleRoleChange(role)
                                            }
                                        >
                                            {roleLabels[role]}
                                        </Button>
                                    ))}
                                    {member.isOrgMember && (
                                        <Button
                                            variant="subtle"
                                            disabled={
                                                !canResetToInherited ||
                                                isUpdatingRole
                                            }
                                            onClick={handleResetToInherited}
                                        >
                                            <LuUndo2 />
                                            Наследовать от организации
                                        </Button>
                                    )}
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsRoleOpen(false)}
                                >
                                    Закрыть
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            <Dialog.Root
                lazyMount
                open={isDeleteOpen}
                placement="center"
                onOpenChange={(details) => setIsDeleteOpen(details.open)}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    Удалить доступ к пространству
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text>
                                    Удалить доступ для{' '}
                                    <Text as="span" fontWeight="semibold">
                                        {member.user.username}
                                    </Text>{' '}
                                    к этому пространству?
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteOpen(false)}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    colorPalette="red"
                                    loading={isUpdatingRole}
                                    onClick={handleRemoveFromSpace}
                                >
                                    Удалить
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};
