import { type FC } from 'react';
import { LuUsers } from 'react-icons/lu';
import { Avatar, Badge, Box, HStack, Stack, Text } from '@chakra-ui/react';

import type { SpaceAccessMember } from 'shared/types';

import type { EditableSpaceRole } from './constants';
import { roleLabels } from './constants';
import { MemberActionsMenu } from './MemberActionsMenu';

type SpaceMembersSectionProps = {
    members: SpaceAccessMember[];
    canManageMembers: boolean;
    isUpdatingRole: boolean;
    onChangeRole: (
        member: SpaceAccessMember,
        role: EditableSpaceRole
    ) => Promise<void>;
    onResetToInherited: (member: SpaceAccessMember) => Promise<void>;
    onRemoveFromSpace: (member: SpaceAccessMember) => Promise<void>;
};

export const SpaceMembersSection: FC<SpaceMembersSectionProps> = ({
    members,
    canManageMembers,
    isUpdatingRole,
    onChangeRole,
    onResetToInherited,
    onRemoveFromSpace,
}) => {
    return (
        <Stack gap={3}>
            <HStack justify="space-between">
                <HStack gap={2}>
                    <LuUsers />
                    <Text fontWeight="medium">Доступ к пространству</Text>
                </HStack>
                <Badge variant="subtle" colorPalette="blue">
                    {members.length}
                </Badge>
            </HStack>

            {members.length ? (
                <Stack gap={2}>
                    {members.map((member) => (
                        <HStack
                            key={member.userId}
                            justify="space-between"
                            gap={3}
                            p={3}
                            borderWidth="1px"
                            borderColor="border.subtle"
                            borderRadius="lg"
                        >
                            <HStack gap={3} minW={0}>
                                <Avatar.Root size="sm">
                                    {member.user.avatarUrl ? (
                                        <Avatar.Image
                                            src={member.user.avatarUrl}
                                        />
                                    ) : null}
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
                                        canManageMember={
                                            member.source !==
                                                'organization_owner' &&
                                            member.source !==
                                                'organization_admin' &&
                                            member.source !== 'space_owner'
                                        }
                                        canResetToInherited={
                                            member.isOrgMember &&
                                            member.hasExplicitAccess
                                        }
                                        canRemoveFromSpace={
                                            member.hasExplicitAccess &&
                                            !member.isOrgMember
                                        }
                                        isUpdatingRole={isUpdatingRole}
                                        onChangeRole={(role) =>
                                            onChangeRole(member, role)
                                        }
                                        onResetToInherited={() =>
                                            onResetToInherited(member)
                                        }
                                        onRemoveFromSpace={() =>
                                            onRemoveFromSpace(member)
                                        }
                                    />
                                )}
                            </HStack>
                        </HStack>
                    ))}
                </Stack>
            ) : (
                <Box
                    py={6}
                    px={4}
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor="border.muted"
                    borderRadius="lg"
                >
                    <Text color="fg.muted" fontSize="sm" textAlign="center">
                        Для этого пространства пока нет доступных участников.
                    </Text>
                </Box>
            )}
        </Stack>
    );
};
