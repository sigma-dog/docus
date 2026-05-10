import { type FC, useState } from 'react';
import { LuEllipsis, LuShield, LuTrash2 } from 'react-icons/lu';
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

import type { OrgMember } from 'shared/types';

import type { EditableOrgRole } from './constants';
import { editableRoles, roleLabels } from './constants';

type MemberActionsMenuProps = {
    member: OrgMember;
    isOwner: boolean;
    isCurrentUser: boolean;
    isRemoving: boolean;
    isUpdatingRole: boolean;
    onRemove: () => Promise<void>;
    onChangeRole: (role: EditableOrgRole) => Promise<void>;
};

export const MemberActionsMenu: FC<MemberActionsMenuProps> = ({
    member,
    isOwner,
    isCurrentUser,
    isRemoving,
    isUpdatingRole,
    onRemove,
    onChangeRole,
}) => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);

    const canManageMember = !isOwner;

    const handleRemove = async () => {
        await onRemove();
        setIsDeleteOpen(false);
    };

    const handleRoleChange = async (role: EditableOrgRole) => {
        await onChangeRole(role);
        setIsRoleOpen(false);
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
                                value={`change-role-${member.id}`}
                                disabled={!canManageMember}
                                onClick={() => setIsRoleOpen(true)}
                            >
                                <LuShield />
                                Изменить права доступа
                            </Menu.Item>
                            <Menu.Item
                                value={`remove-member-${member.id}`}
                                disabled={!canManageMember}
                                color="fg.error"
                                _hover={{
                                    bg: 'bg.error',
                                    color: 'fg.error',
                                }}
                                onClick={() => setIsDeleteOpen(true)}
                            >
                                <LuTrash2 />
                                Удалить из организации
                            </Menu.Item>
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
                                        Выберите новую роль для участника.
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
                                                isUpdatingRole ||
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
                                            {role === 'ADMIN'
                                                ? 'Расширенный доступ'
                                                : 'Базовый доступ'}
                                        </Button>
                                    ))}
                                    {isCurrentUser && (
                                        <Text color="fg.muted" fontSize="xs">
                                            Вы изменяете собственные права
                                            доступа.
                                        </Text>
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
                                    Удалить участника из организации
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text>
                                    Удалить{' '}
                                    <Text as="span" fontWeight="semibold">
                                        {member.user.username}
                                    </Text>{' '}
                                    из организации?
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
                                    loading={isRemoving}
                                    onClick={handleRemove}
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
