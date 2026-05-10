import { type FC } from 'react';
import { LuPlus, LuSearch, LuUsers } from 'react-icons/lu';
import {
    Avatar,
    Badge,
    Box,
    Button,
    HStack,
    Icon,
    Input,
    InputGroup,
    Stack,
    Text,
} from '@chakra-ui/react';

import type { OrgMember } from 'shared/types';

import type { EditableOrgRole } from './constants';
import { roleLabels } from './constants';
import { MemberActionsMenu } from './MemberActionsMenu';

type OrganizationMembersSectionProps = {
    members: OrgMember[];
    filteredMembers: OrgMember[];
    ownerId: string;
    currentUserId?: string;
    canManageMembers: boolean;
    memberSearch: string;
    isRemovingMember: boolean;
    isUpdatingRole: boolean;
    onMemberSearchChange: (value: string) => void;
    onOpenInvite: () => void;
    onRemoveMember: (member: OrgMember) => Promise<void>;
    onChangeRole: (member: OrgMember, role: EditableOrgRole) => Promise<void>;
};

export const OrganizationMembersSection: FC<
    OrganizationMembersSectionProps
> = ({
    members,
    filteredMembers,
    ownerId,
    currentUserId,
    canManageMembers,
    memberSearch,
    isRemovingMember,
    isUpdatingRole,
    onMemberSearchChange,
    onOpenInvite,
    onRemoveMember,
    onChangeRole,
}) => {
    return (
        <Stack gap={3}>
            <HStack justify="space-between">
                <HStack gap={2}>
                    <LuUsers />
                    <Text fontWeight="medium">Участники</Text>
                </HStack>
                <HStack gap={2}>
                    {canManageMembers && (
                        <Button
                            size="2xs"
                            variant="subtle"
                            colorPalette="blue"
                            onClick={onOpenInvite}
                        >
                            <LuPlus />
                            Добавить
                        </Button>
                    )}
                    <Badge variant="subtle" colorPalette="blue">
                        {members.length}
                    </Badge>
                </HStack>
            </HStack>

            <InputGroup
                startElement={
                    <Icon color="fg.subtle">
                        <LuSearch />
                    </Icon>
                }
            >
                <Input
                    placeholder="Поиск участника..."
                    variant="subtle"
                    size="sm"
                    value={memberSearch}
                    onChange={(event) =>
                        onMemberSearchChange(event.target.value)
                    }
                />
            </InputGroup>

            {filteredMembers.length ? (
                <Stack gap={2}>
                    {filteredMembers.map((member) => (
                        <HStack
                            key={member.id}
                            justify="space-between"
                            gap={3}
                            p={3}
                            borderWidth="1px"
                            borderColor="border.subtle"
                            borderRadius="lg"
                        >
                            <HStack gap={3} minW={0}>
                                <Avatar.Root size="sm">
                                    <Avatar.Fallback
                                        name={member.user.username}
                                    />
                                </Avatar.Root>
                                <Text
                                    fontSize="sm"
                                    fontWeight="medium"
                                    truncate
                                >
                                    {member.user.username}
                                </Text>
                            </HStack>

                            <HStack gap={2}>
                                <Badge variant="outline">
                                    {roleLabels[member.role]}
                                </Badge>
                                {canManageMembers && (
                                    <MemberActionsMenu
                                        member={member}
                                        isOwner={ownerId === member.userId}
                                        isCurrentUser={
                                            currentUserId === member.userId
                                        }
                                        isRemoving={isRemovingMember}
                                        isUpdatingRole={isUpdatingRole}
                                        onRemove={() => onRemoveMember(member)}
                                        onChangeRole={(role) =>
                                            onChangeRole(member, role)
                                        }
                                    />
                                )}
                            </HStack>
                        </HStack>
                    ))}
                </Stack>
            ) : members.length ? (
                <EmptyState message="Участники по запросу не найдены." />
            ) : (
                <EmptyState message="В организации пока нет участников." />
            )}
        </Stack>
    );
};

type EmptyStateProps = {
    message: string;
};

const EmptyState: FC<EmptyStateProps> = ({ message }) => (
    <Box
        py={6}
        px={4}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="border.muted"
        borderRadius="lg"
    >
        <Text color="fg.muted" fontSize="sm" textAlign="center">
            {message}
        </Text>
    </Box>
);
