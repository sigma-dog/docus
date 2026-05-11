import { type FC, type FormEvent, useState } from 'react';
import { LuInfo } from 'react-icons/lu';
import {
    CloseButton,
    DataList,
    Drawer,
    IconButton,
    Portal,
    Separator,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';

import {
    useGetSpaceQuery,
    useRemoveSpaceAvatarMutation,
    useRemoveSpaceMemberMutation,
    useUploadSpaceAvatarMutation,
    useUpdateSpaceMemberMutation,
    useUpdateSpaceMutation,
} from 'shared/api';
import { getUserInfo } from 'shared/lib/userUtils';
import type { Space } from 'shared/types';
import { toaster } from 'shared/ui/chakra/toaster';

import type { EditableSpaceRole } from './constants';
import { SpaceMembersSection } from './SpaceMembersSection';
import { SpaceProfileSection } from './SpaceProfileSection';
import { formatDate } from './utils';

type SpaceInfoMenuProps = {
    space: Space;
    organizationSlug: string;
    triggerAriaLabel?: string;
    triggerProps?: React.ComponentProps<typeof IconButton>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    withTrigger?: boolean;
};

export const SpaceInfoMenu: FC<SpaceInfoMenuProps> = ({
    space,
    organizationSlug,
    triggerAriaLabel = 'Информация о пространстве',
    triggerProps,
    open,
    onOpenChange,
    withTrigger = true,
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [name, setName] = useState(space.name);
    const [description, setDescription] = useState(space.description ?? '');
    const currentUser = getUserInfo();
    const isDrawerOpen = open ?? internalOpen;
    const {
        data: spaceDetails,
        isFetching,
        isError,
    } = useGetSpaceQuery(
        {
            key: space.key,
            organizationSlug,
        },
        {
            skip: !isDrawerOpen,
            refetchOnMountOrArgChange: true,
        }
    );
    const [updateSpace, { isLoading: isSaving }] = useUpdateSpaceMutation();
    const [uploadSpaceAvatar, { isLoading: isUploadingAvatar }] =
        useUploadSpaceAvatarMutation();
    const [removeSpaceAvatar, { isLoading: isRemovingAvatar }] =
        useRemoveSpaceAvatarMutation();
    const [updateSpaceMember, { isLoading: isUpdatingRole }] =
        useUpdateSpaceMemberMutation();
    const [removeSpaceMember] = useRemoveSpaceMemberMutation();
    const currentAccessMember = spaceDetails?.accessMembers?.find(
        (member) => member.userId === currentUser?.id
    );
    const canManageMembers = Boolean(
        currentAccessMember &&
        currentAccessMember.role === 'ADMIN' &&
        currentAccessMember.source !== 'organization_member'
    );
    const isUpdatingAvatar = isUploadingAvatar || isRemovingAvatar;

    const handleDrawerOpenChange = (open: boolean) => {
        if (onOpenChange) {
            onOpenChange(open);
        } else {
            setInternalOpen(open);
        }

        if (open) {
            setName(spaceDetails?.name ?? space.name);
            setDescription(
                spaceDetails?.description ?? space.description ?? ''
            );
            return;
        }

        setIsEditingName(false);
        setIsEditingDescription(false);
        setName(space.name);
        setDescription(space.description ?? '');
    };

    const handleStartEditingName = () => {
        setName(spaceDetails?.name ?? space.name);
        setIsEditingName(true);
    };

    const handleStartEditingDescription = () => {
        setDescription(spaceDetails?.description ?? space.description ?? '');
        setIsEditingDescription(true);
    };

    const resetName = () => {
        setName(spaceDetails?.name ?? space.name);
        setIsEditingName(false);
    };

    const resetDescription = () => {
        setDescription(spaceDetails?.description ?? space.description ?? '');
        setIsEditingDescription(false);
    };

    const handleNameSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        try {
            await updateSpace({
                key: space.key,
                organizationSlug,
                body: { name: trimmedName },
            }).unwrap();
            setIsEditingName(false);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось обновить пространство',
            });
        }
    };

    const handleDescriptionSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedDescription = description.trim();

        try {
            await updateSpace({
                key: space.key,
                organizationSlug,
                body: { description: trimmedDescription || undefined },
            }).unwrap();
            setIsEditingDescription(false);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось обновить описание пространства',
            });
        }
    };

    const handleAvatarChange = async (file: File | null) => {
        if (!file) {
            return;
        }

        try {
            await uploadSpaceAvatar({
                key: space.key,
                organizationSlug,
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
                description: 'Не удалось загрузить аватар пространства',
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
            await removeSpaceAvatar({
                key: space.key,
                organizationSlug,
            }).unwrap();
            toaster.create({
                type: 'success',
                title: 'Аватар удалён',
            });
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось удалить аватар пространства',
            });
        }
    };

    const handleChangeRole = async (
        member: NonNullable<Space['accessMembers']>[number],
        role: EditableSpaceRole
    ) => {
        try {
            await updateSpaceMember({
                key: space.key,
                organizationSlug,
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

    const handleResetToInherited = async (
        member: NonNullable<Space['accessMembers']>[number]
    ) => {
        try {
            await updateSpaceMember({
                key: space.key,
                organizationSlug,
                userId: member.userId,
                body: { inherit: true },
            }).unwrap();
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось вернуть наследование от организации',
            });
        }
    };

    const handleRemoveFromSpace = async (
        member: NonNullable<Space['accessMembers']>[number]
    ) => {
        try {
            await removeSpaceMember({
                key: space.key,
                organizationSlug,
                userId: member.userId,
            }).unwrap();
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось удалить доступ к пространству',
            });
        }
    };

    return (
        <Drawer.Root
            lazyMount
            open={isDrawerOpen}
            placement="start"
            size={{ base: 'full', md: 'md' }}
            onOpenChange={(details) => handleDrawerOpenChange(details.open)}
        >
            {withTrigger && (
                <Drawer.Trigger asChild>
                    <IconButton
                        aria-label={triggerAriaLabel}
                        variant="ghost"
                        size="2xs"
                        {...triggerProps}
                    >
                        <LuInfo />
                    </IconButton>
                </Drawer.Trigger>
            )}

            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content>
                        <Drawer.Header>
                            <Drawer.Title>
                                <Text lineClamp={1} w="full">
                                    Пространство{' '}
                                    {spaceDetails?.name ?? space.name}
                                </Text>
                            </Drawer.Title>
                        </Drawer.Header>

                        <Drawer.Body pb={6}>
                            {isFetching && !spaceDetails ? (
                                <Stack py={10} align="center">
                                    <Spinner size="sm" />
                                    <Text color="fg.muted">
                                        Загружаем данные пространства...
                                    </Text>
                                </Stack>
                            ) : isError || !spaceDetails ? (
                                <Text color="fg.muted">
                                    Не удалось загрузить информацию о
                                    пространстве.
                                </Text>
                            ) : (
                                <Stack gap={6}>
                                    <SpaceProfileSection
                                        name={spaceDetails.name}
                                        spaceKey={spaceDetails.key}
                                        description={spaceDetails.description}
                                        avatarUrl={spaceDetails.avatarUrl}
                                        canEditSpace={canManageMembers}
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
                                        onResetDescription={resetDescription}
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
                                                Страниц
                                            </DataList.ItemLabel>
                                            <DataList.ItemValue>
                                                {spaceDetails._count?.pages ??
                                                    0}
                                            </DataList.ItemValue>
                                        </DataList.Item>
                                        <DataList.Item>
                                            <DataList.ItemLabel>
                                                Участников
                                            </DataList.ItemLabel>
                                            <DataList.ItemValue>
                                                {spaceDetails.accessMembers
                                                    ?.length ??
                                                    spaceDetails._count
                                                        ?.members ??
                                                    spaceDetails.members
                                                        ?.length ??
                                                    0}
                                            </DataList.ItemValue>
                                        </DataList.Item>
                                        <DataList.Item>
                                            <DataList.ItemLabel>
                                                Создано
                                            </DataList.ItemLabel>
                                            <DataList.ItemValue>
                                                {formatDate(
                                                    spaceDetails.createdAt
                                                )}
                                            </DataList.ItemValue>
                                        </DataList.Item>
                                    </DataList.Root>

                                    <Separator />

                                    <SpaceMembersSection
                                        members={
                                            spaceDetails.accessMembers ?? []
                                        }
                                        canManageMembers={canManageMembers}
                                        isUpdatingRole={isUpdatingRole}
                                        onChangeRole={handleChangeRole}
                                        onResetToInherited={
                                            handleResetToInherited
                                        }
                                        onRemoveFromSpace={
                                            handleRemoveFromSpace
                                        }
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
    );
};
