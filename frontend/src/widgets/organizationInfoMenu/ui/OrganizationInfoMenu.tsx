import { type FC, type FormEvent, useMemo, useState } from 'react';
import { LuBuilding2, LuEllipsis } from 'react-icons/lu';
import {
    CloseButton,
    DataList,
    Drawer,
    IconButton,
    Menu,
    Portal,
    Separator,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';

import {
    useCreateInviteMutation,
    useGetOrganizationQuery,
    useRemoveOrganizationAvatarMutation,
    useRemoveOrgMemberMutation,
    useUpdateOrganizationMutation,
    useUpdateOrgMemberRoleMutation,
    useUploadOrganizationAvatarMutation,
} from 'shared/api';
import { getUserInfo } from 'shared/lib/userUtils';
import type { Organization, OrgMember } from 'shared/types';
import { toaster } from 'shared/ui/chakra/toaster';

import type { EditableOrgRole } from './constants';
import { InviteMemberDialog } from './InviteMemberDialog';
import { OrganizationMembersSection } from './OrganizationMembersSection';
import { OrganizationProfileSection } from './OrganizationProfileSection';
import { formatDate } from './utils';

type OrganizationInfoMenuProps = {
    organization: Organization;
    triggerAriaLabel?: string;
};

export const OrganizationInfoMenu: FC<OrganizationInfoMenuProps> = ({
    organization,
    triggerAriaLabel = 'Действия с организацией',
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [inviteRole, setInviteRole] = useState<EditableOrgRole>('MEMBER');
    const [inviteCode, setInviteCode] = useState('');
    const [name, setName] = useState(organization.name);
    const [description, setDescription] = useState(
        organization.description ?? ''
    );
    const {
        data: organizationDetails,
        isFetching,
        isError,
    } = useGetOrganizationQuery(organization.slug, {
        skip: !isDrawerOpen,
        refetchOnMountOrArgChange: true,
    });
    const [updateOrganization, { isLoading: isSaving }] =
        useUpdateOrganizationMutation();
    const [uploadOrganizationAvatar, { isLoading: isUploadingAvatar }] =
        useUploadOrganizationAvatarMutation();
    const [removeOrganizationAvatar, { isLoading: isRemovingAvatar }] =
        useRemoveOrganizationAvatarMutation();
    const [removeOrgMember, { isLoading: isRemovingMember }] =
        useRemoveOrgMemberMutation();
    const [updateOrgMemberRole, { isLoading: isUpdatingRole }] =
        useUpdateOrgMemberRoleMutation();
    const [createInvite, { isLoading: isCreatingInvite }] =
        useCreateInviteMutation();
    const currentUser = getUserInfo();

    const members = useMemo(
        () => organizationDetails?.members ?? [],
        [organizationDetails?.members]
    );
    const filteredMembers = useMemo(() => {
        const query = memberSearch.trim().toLowerCase();

        if (!query) {
            return members;
        }

        return members.filter((member) =>
            member.user.username.toLowerCase().includes(query)
        );
    }, [memberSearch, members]);
    const currentMember = useMemo(
        () => members.find((member) => member.userId === currentUser?.id),
        [currentUser?.id, members]
    );
    const canManageMembers = useMemo(() => {
        if (!currentUser || !organizationDetails) {
            return false;
        }

        if (organizationDetails.ownerId === currentUser.id) {
            return true;
        }

        return currentMember?.role === 'ADMIN';
    }, [currentMember?.role, currentUser, organizationDetails]);
    const canEditOrganization = canManageMembers;
    const isUpdatingAvatar = isUploadingAvatar || isRemovingAvatar;

    const handleDrawerOpenChange = (open: boolean) => {
        setIsDrawerOpen(open);

        if (open) {
            return;
        }

        setIsEditingName(false);
        setIsEditingDescription(false);
        setIsInviteOpen(false);
        setMemberSearch('');
        setInviteRole('MEMBER');
        setInviteCode('');
        setName(organization.name);
        setDescription(organization.description ?? '');
    };

    const handleStartEditingName = () => {
        setName(organizationDetails?.name ?? organization.name);
        setIsEditingName(true);
    };

    const handleStartEditingDescription = () => {
        setDescription(
            organizationDetails?.description ?? organization.description ?? ''
        );
        setIsEditingDescription(true);
    };

    const resetName = () => {
        setName(organizationDetails?.name ?? organization.name);
        setIsEditingName(false);
    };

    const resetDescription = () => {
        setDescription(
            organizationDetails?.description ?? organization.description ?? ''
        );
        setIsEditingDescription(false);
    };

    const handleNameSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        try {
            await updateOrganization({
                slug: organization.slug,
                body: { name: trimmedName },
            }).unwrap();
            setIsEditingName(false);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось обновить организацию',
            });
        }
    };

    const handleDescriptionSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedDescription = description.trim();

        try {
            await updateOrganization({
                slug: organization.slug,
                body: {
                    description: trimmedDescription || undefined,
                },
            }).unwrap();
            setIsEditingDescription(false);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось обновить описание организации',
            });
        }
    };

    const handleAvatarChange = async (file: File | null) => {
        if (!file) {
            return;
        }

        try {
            await uploadOrganizationAvatar({
                slug: organization.slug,
                file,
            }).unwrap();
            toaster.create({
                type: 'success',
                title: 'Аватар обновлён',
            });
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось загрузить аватар организации',
            });
        }
    };

    const handleAvatarReject = () => {
        toaster.create({
            type: 'error',
            title: 'Неподходящий файл',
            description: 'Поддерживаются JPG, PNG, WEBP и GIF до 5 МБ',
        });
    };

    const handleAvatarRemove = async () => {
        try {
            await removeOrganizationAvatar({
                slug: organization.slug,
            }).unwrap();
            toaster.create({
                type: 'success',
                title: 'Аватар удалён',
            });
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось удалить аватар организации',
            });
        }
    };

    const handleCreateInvite = async () => {
        try {
            const invite = await createInvite({
                slug: organization.slug,
                role: inviteRole,
            }).unwrap();
            setInviteCode(invite.code);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось создать инвайт-код',
            });
        }
    };

    const handleCopyInviteCode = async () => {
        if (!inviteCode) {
            return;
        }

        try {
            await navigator.clipboard.writeText(inviteCode);
            toaster.create({
                type: 'success',
                title: 'Код скопирован',
                description: 'Инвайт-код добавлен в буфер обмена',
            });
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось скопировать код',
            });
        }
    };

    const handleRemoveMember = async (member: OrgMember) => {
        try {
            await removeOrgMember({
                slug: organization.slug,
                userId: member.userId,
            }).unwrap();
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось удалить участника из организации',
            });
        }
    };

    const handleRoleChange = async (
        member: OrgMember,
        role: EditableOrgRole
    ) => {
        try {
            await updateOrgMemberRole({
                slug: organization.slug,
                userId: member.userId,
                body: { role },
            }).unwrap();
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось изменить права доступа',
            });
        }
    };

    const handleCloseInvite = () => {
        setIsInviteOpen(false);
        setInviteCode('');
        setInviteRole('MEMBER');
    };

    return (
        <>
            <Menu.Root positioning={{ placement: 'bottom-end' }}>
                <Menu.Trigger asChild>
                    <IconButton
                        aria-label={triggerAriaLabel}
                        variant="ghost"
                        size="sm"
                    >
                        <LuEllipsis />
                    </IconButton>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content minW="180px">
                            <Menu.Item
                                value="organization-info"
                                onClick={() => setIsDrawerOpen(true)}
                            >
                                <LuBuilding2 />
                                Об организации
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>

            <Drawer.Root
                lazyMount
                open={isDrawerOpen}
                placement="start"
                size={{ base: 'full', md: 'lg' }}
                onOpenChange={(details) => handleDrawerOpenChange(details.open)}
            >
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content pt={6}>
                            {/* <Drawer.Header>
                                {/* <Drawer.Title>
                                    <Text lineClamp={1} w="full">
                                        Организация{' '}
                                        {organizationDetails?.name ??
                                            organization.name}
                                    </Text>
                                </Drawer.Title> */}
                            {/* </Drawer.Header> */}

                            <Drawer.Body pb={6}>
                                {isFetching && !organizationDetails ? (
                                    <Stack py={10} align="center">
                                        <Spinner size="sm" />
                                        <Text color="fg.muted">
                                            Загружаем данные организации...
                                        </Text>
                                    </Stack>
                                ) : isError || !organizationDetails ? (
                                    <Text color="fg.muted">
                                        Не удалось загрузить информацию об
                                        организации.
                                    </Text>
                                ) : (
                                    <Stack gap={6}>
                                        <OrganizationProfileSection
                                            name={organizationDetails.name}
                                            slug={organizationDetails.slug}
                                            description={
                                                organizationDetails.description
                                            }
                                            avatarUrl={
                                                organizationDetails.avatarUrl
                                            }
                                            canEditOrganization={
                                                canEditOrganization
                                            }
                                            editingName={name}
                                            editingDescription={description}
                                            isEditingName={isEditingName}
                                            isEditingDescription={
                                                isEditingDescription
                                            }
                                            isSaving={isSaving}
                                            isUpdatingAvatar={isUpdatingAvatar}
                                            onNameChange={setName}
                                            onDescriptionChange={setDescription}
                                            onStartEditingName={
                                                handleStartEditingName
                                            }
                                            onStartEditingDescription={
                                                handleStartEditingDescription
                                            }
                                            onResetName={resetName}
                                            onResetDescription={
                                                resetDescription
                                            }
                                            onAvatarChange={handleAvatarChange}
                                            onAvatarReject={handleAvatarReject}
                                            onAvatarRemove={handleAvatarRemove}
                                            onSubmitName={handleNameSubmit}
                                            onSubmitDescription={
                                                handleDescriptionSubmit
                                            }
                                        />

                                        <DataList.Root orientation="horizontal">
                                            <DataList.Item>
                                                <DataList.ItemLabel>
                                                    Участников
                                                </DataList.ItemLabel>
                                                <DataList.ItemValue>
                                                    {organizationDetails._count
                                                        ?.members ??
                                                        members.length}
                                                </DataList.ItemValue>
                                            </DataList.Item>
                                            <DataList.Item>
                                                <DataList.ItemLabel>
                                                    Пространств
                                                </DataList.ItemLabel>
                                                <DataList.ItemValue>
                                                    {organizationDetails._count
                                                        ?.spaces ?? 0}
                                                </DataList.ItemValue>
                                            </DataList.Item>
                                            <DataList.Item>
                                                <DataList.ItemLabel>
                                                    Создана
                                                </DataList.ItemLabel>
                                                <DataList.ItemValue>
                                                    {formatDate(
                                                        organizationDetails.createdAt
                                                    )}
                                                </DataList.ItemValue>
                                            </DataList.Item>
                                        </DataList.Root>

                                        <Separator />

                                        <OrganizationMembersSection
                                            members={members}
                                            filteredMembers={filteredMembers}
                                            ownerId={
                                                organizationDetails.ownerId
                                            }
                                            currentUserId={currentUser?.id}
                                            canManageMembers={canManageMembers}
                                            memberSearch={memberSearch}
                                            isRemovingMember={isRemovingMember}
                                            isUpdatingRole={isUpdatingRole}
                                            onMemberSearchChange={
                                                setMemberSearch
                                            }
                                            onOpenInvite={() =>
                                                setIsInviteOpen(true)
                                            }
                                            onRemoveMember={handleRemoveMember}
                                            onChangeRole={handleRoleChange}
                                        />
                                    </Stack>
                                )}
                            </Drawer.Body>

                            <Drawer.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Drawer.CloseTrigger>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>

            <InviteMemberDialog
                isOpen={isInviteOpen}
                inviteRole={inviteRole}
                inviteCode={inviteCode}
                isCreatingInvite={isCreatingInvite}
                onClose={handleCloseInvite}
                onInviteRoleChange={setInviteRole}
                onCreateInvite={handleCreateInvite}
                onCopyInviteCode={handleCopyInviteCode}
            />
        </>
    );
};
