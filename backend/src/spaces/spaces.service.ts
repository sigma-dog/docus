import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import sharp from 'sharp';

import type { UploadedImageFile } from '../S3/types/uploaded-image-file.type';
import { MAX_AVATAR_IMAGE_SIZE_BYTES } from '../common/constants/files.constants';
import { OrganizationsService } from '../organizations/organizations.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../S3/S3.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceMemberDto } from './dto/update-space-member.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
    constructor(
        private prisma: PrismaService,
        private organizationsService: OrganizationsService,
        private readonly s3Service: S3Service
    ) {}

    async create(userId: string, dto: CreateSpaceDto) {
        const org: Awaited<
            ReturnType<typeof this.organizationsService.getOrgOrThrow>
        > = await this.organizationsService.getOrgOrThrow(dto.organizationSlug);

        const isMember =
            org.ownerId === userId ||
            org.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new ForbiddenException(
                'You are not a member of this organization'
            );
        }

        const exists = await this.prisma.space.findFirst({
            where: { key: dto.key, organizationId: org.id },
        });
        if (exists) {
            throw new ConflictException(
                `Space with key "${dto.key}" already exists in this organization`
            );
        }

        return this.prisma.space.create({
            data: {
                name: dto.name,
                key: dto.key,
                description: dto.description,
                ownerId: userId,
                organizationId: org.id,
                members: {
                    create: { userId, role: 'ADMIN' },
                },
            },
            include: { members: true },
        });
    }

    async findMine(userId: string, organizationSlug?: string) {
        const orgFilter = organizationSlug
            ? { organization: { slug: organizationSlug } }
            : {};

        return this.prisma.space.findMany({
            where: {
                ...orgFilter,
                OR: [
                    { ownerId: userId },
                    { organization: { ownerId: userId } },
                    { organization: { members: { some: { userId } } } },
                ],
            },
            include: {
                _count: { select: { pages: true, members: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(key: string, userId: string, organizationSlug: string) {
        const space = await this.getSpaceOrThrow(key, organizationSlug);
        this.assertViewer(space, userId);

        const fullSpace = await this.prisma.space.findFirst({
            where: {
                id: space.id,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                organization: {
                    select: {
                        ownerId: true,
                        owner: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                },
                _count: { select: { pages: true, members: true } },
            },
        });
        if (!fullSpace) throw new NotFoundException(`Space "${key}" not found`);

        return {
            ...fullSpace,
            accessMembers: buildSpaceAccessMembers(fullSpace),
        };
    }

    async update(
        key: string,
        userId: string,
        dto: UpdateSpaceDto,
        orgSlug?: string
    ) {
        const space = await this.getSpaceOrThrow(key, orgSlug);
        this.assertAdminOrOwner(space, userId);

        return this.prisma.space.update({
            where: { id: space.id },
            data: dto,
        });
    }

    async updateAvatar(
        key: string,
        userId: string,
        orgSlug: string,
        file: UploadedImageFile
    ) {
        if (!file) {
            throw new BadRequestException('Файл не предоставлен');
        }

        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Можно загружать только изображения');
        }

        if (file.size > MAX_AVATAR_IMAGE_SIZE_BYTES) {
            throw new BadRequestException(
                'Размер файла не должен превышать 5MB'
            );
        }

        const space = await this.getSpaceOrThrow(key, orgSlug);
        this.assertAdminOrOwner(space, userId);

        const compressedImageBuffer = await sharp(file.buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center',
            })
            .webp({
                quality: 80,
                effort: 4,
                alphaQuality: 80,
            })
            .toBuffer();

        const fileKey = `spaces/${space.id}/avatar/${Date.now()}.webp`;
        const avatarUrl = await this.s3Service.uploadFile({
            fileKey,
            buffer: compressedImageBuffer,
            contentType: 'image/webp',
        });

        if (space.avatarUrl) {
            const oldAvatarFileKey = this.s3Service.parseFileKeyFromUrl(
                space.avatarUrl
            );

            this.s3Service.removeFile(oldAvatarFileKey).catch(console.error);
        }

        return this.prisma.space.update({
            where: { id: space.id },
            data: { avatarUrl },
            include: {
                _count: { select: { pages: true, members: true } },
            },
        });
    }

    async removeAvatar(key: string, userId: string, orgSlug: string) {
        const space = await this.getSpaceOrThrow(key, orgSlug);
        this.assertAdminOrOwner(space, userId);

        if (space.avatarUrl) {
            const oldAvatarFileKey = this.s3Service.parseFileKeyFromUrl(
                space.avatarUrl
            );

            this.s3Service.removeFile(oldAvatarFileKey).catch(console.error);
        }

        return this.prisma.space.update({
            where: { id: space.id },
            data: { avatarUrl: null },
            include: {
                _count: { select: { pages: true, members: true } },
            },
        });
    }

    async remove(key: string, userId: string, orgSlug?: string) {
        const space = await this.getSpaceOrThrow(key, orgSlug);
        if (space.ownerId !== userId) {
            throw new ForbiddenException(
                'Only the owner can delete this space'
            );
        }

        if (space.avatarUrl) {
            const oldAvatarFileKey = this.s3Service.parseFileKeyFromUrl(
                space.avatarUrl
            );

            this.s3Service.removeFile(oldAvatarFileKey).catch(console.error);
        }

        await this.prisma.space.delete({ where: { id: space.id } });
    }

    async addMember(key: string, requesterId: string, dto: AddMemberDto) {
        const space = await this.getSpaceOrThrow(key);
        this.assertAdminOrOwner(space, requesterId);

        const alreadyMember = await this.prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: { spaceId: space.id, userId: dto.userId },
            },
        });
        if (alreadyMember) {
            throw new ConflictException('User is already a member');
        }

        return this.prisma.spaceMember.create({
            data: { spaceId: space.id, userId: dto.userId, role: dto.role },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
    }

    async removeMember(key: string, requesterId: string, targetUserId: string) {
        const space = await this.getSpaceOrThrow(key);
        this.assertAdminOrOwner(space, requesterId);

        if (space.ownerId === targetUserId) {
            throw new ForbiddenException('Cannot remove the space owner');
        }

        const member = await this.prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: { spaceId: space.id, userId: targetUserId },
            },
        });
        if (!member) throw new NotFoundException('Member not found');

        await this.prisma.spaceMember.delete({ where: { id: member.id } });
    }

    async updateMember(
        key: string,
        requesterId: string,
        targetUserId: string,
        dto: UpdateSpaceMemberDto
    ) {
        const space = await this.getSpaceOrThrow(key);
        this.assertAdminOrOwner(space, requesterId);

        if (space.ownerId === targetUserId) {
            throw new ForbiddenException(
                'Cannot change the space owner permissions'
            );
        }

        const orgMember = space.organization.members.find(
            (member) => member.userId === targetUserId
        );

        if (
            targetUserId === space.organization.ownerId ||
            orgMember?.role === 'OWNER' ||
            orgMember?.role === 'ADMIN'
        ) {
            throw new ForbiddenException(
                'Cannot change permissions for organization owner or admins'
            );
        }

        const member = await this.prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: { spaceId: space.id, userId: targetUserId },
            },
        });

        if (dto.inherit) {
            if (!orgMember) {
                throw new BadRequestException(
                    'Only organization members can inherit access'
                );
            }

            if (member) {
                await this.prisma.spaceMember.delete({
                    where: { id: member.id },
                });
            }

            return;
        }

        if (!dto.role) {
            throw new BadRequestException('Role is required');
        }

        if (member) {
            await this.prisma.spaceMember.update({
                where: { id: member.id },
                data: { role: dto.role },
            });
            return;
        }

        await this.prisma.spaceMember.create({
            data: {
                spaceId: space.id,
                userId: targetUserId,
                role: dto.role,
            },
        });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    async getSpaceOrThrow(key: string, orgSlug?: string) {
        const space = await this.prisma.space.findFirst({
            where: {
                key,
                ...(orgSlug ? { organization: { slug: orgSlug } } : {}),
            },
            include: {
                members: true,
                organization: {
                    select: {
                        ownerId: true,
                        members: {
                            select: { userId: true, role: true },
                        },
                    },
                },
            },
        });
        if (!space) throw new NotFoundException(`Space "${key}" not found`);
        return space;
    }

    private assertAdminOrOwner(
        space: {
            ownerId: string;
            members: { userId: string; role: string }[];
            organization: {
                ownerId: string;
                members: { userId: string; role: string }[];
            };
        },
        userId: string
    ) {
        if (space.organization.ownerId === userId) return;
        const orgMember = space.organization.members.find(
            (member) => member.userId === userId
        );
        if (orgMember?.role === 'ADMIN') return;

        if (space.ownerId === userId) return;
        const member = space.members.find((m) => m.userId === userId);
        if (!member || member.role !== 'ADMIN') {
            throw new ForbiddenException('Insufficient permissions');
        }
    }

    private assertViewer(
        space: {
            ownerId: string;
            members: { userId: string }[];
            organization: {
                ownerId: string;
                members: { userId: string }[];
            };
        },
        userId: string
    ) {
        const access =
            space.ownerId === userId ||
            space.organization.ownerId === userId ||
            space.members.some((member) => member.userId === userId) ||
            space.organization.members.some(
                (member) => member.userId === userId
            );

        if (!access) {
            throw new ForbiddenException('Access denied');
        }
    }
}

type UserSummary = {
    id: string;
    username: string;
    avatarUrl: string | null;
};

type SpaceWithAccessContext = {
    ownerId: string;
    owner: UserSummary;
    members: {
        userId: string;
        role: 'ADMIN' | 'EDITOR' | 'VIEWER';
        user: UserSummary;
    }[];
    organization: {
        ownerId: string;
        owner: UserSummary;
        members: {
            userId: string;
            role: 'ADMIN' | 'MEMBER' | 'OWNER';
            user: UserSummary;
        }[];
    };
};

type SpaceAccessRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
type SpaceAccessSource =
    | 'organization_owner'
    | 'organization_admin'
    | 'organization_member'
    | 'space_owner'
    | 'space_member';

function buildSpaceAccessMembers(space: SpaceWithAccessContext) {
    const privilegedUserIds = new Set<string>([
        space.organization.ownerId,
        space.ownerId,
        ...space.organization.members
            .filter((member) => member.role === 'ADMIN')
            .map((member) => member.userId),
    ]);

    const explicitSpaceMembers = new Map(
        space.members.map((member) => [member.userId, member])
    );
    const accessMembers = new Map<
        string,
        {
            userId: string;
            role: SpaceAccessRole;
            source: SpaceAccessSource;
            isOrgMember: boolean;
            hasExplicitAccess: boolean;
            user: UserSummary;
        }
    >();

    accessMembers.set(space.organization.ownerId, {
        userId: space.organization.ownerId,
        role: 'ADMIN',
        source: 'organization_owner',
        isOrgMember: true,
        hasExplicitAccess: explicitSpaceMembers.has(space.organization.ownerId),
        user: space.organization.owner,
    });

    for (const member of space.organization.members) {
        if (member.role === 'OWNER') {
            accessMembers.set(member.userId, {
                userId: member.userId,
                role: 'ADMIN',
                source: 'organization_owner',
                isOrgMember: true,
                hasExplicitAccess: explicitSpaceMembers.has(member.userId),
                user: member.user,
            });
            continue;
        }

        if (member.role === 'ADMIN') {
            accessMembers.set(member.userId, {
                userId: member.userId,
                role: 'ADMIN',
                source: 'organization_admin',
                isOrgMember: true,
                hasExplicitAccess: explicitSpaceMembers.has(member.userId),
                user: member.user,
            });
            continue;
        }

        const explicitRole = explicitSpaceMembers.get(member.userId)?.role;
        accessMembers.set(member.userId, {
            userId: member.userId,
            role: explicitRole ?? 'EDITOR',
            source: explicitRole ? 'space_member' : 'organization_member',
            isOrgMember: true,
            hasExplicitAccess: explicitSpaceMembers.has(member.userId),
            user: member.user,
        });
    }

    const ownerOrgRole =
        space.organization.ownerId === space.ownerId
            ? 'OWNER'
            : space.organization.members.find(
                  (member) => member.userId === space.ownerId
              )?.role;

    accessMembers.set(space.ownerId, {
        userId: space.ownerId,
        role: 'ADMIN',
        source:
            ownerOrgRole === 'OWNER'
                ? 'organization_owner'
                : ownerOrgRole === 'ADMIN'
                  ? 'organization_admin'
                  : 'space_owner',
        isOrgMember: true,
        hasExplicitAccess: explicitSpaceMembers.has(space.ownerId),
        user: accessMembers.get(space.ownerId)?.user ?? space.owner,
    });

    for (const member of space.members) {
        if (privilegedUserIds.has(member.userId)) {
            if (!accessMembers.has(member.userId)) {
                accessMembers.set(member.userId, {
                    userId: member.userId,
                    role: 'ADMIN',
                    source: 'space_owner',
                    isOrgMember: false,
                    hasExplicitAccess: true,
                    user: member.user,
                });
            }

            continue;
        }

        accessMembers.set(member.userId, {
            userId: member.userId,
            role: member.role,
            source: 'space_member',
            isOrgMember: accessMembers.get(member.userId)?.isOrgMember ?? false,
            hasExplicitAccess: true,
            user: member.user,
        });
    }

    const roleOrder: Record<SpaceAccessRole, number> = {
        ADMIN: 0,
        EDITOR: 1,
        VIEWER: 2,
    };

    return Array.from(accessMembers.values()).sort((left, right) => {
        const byRole = roleOrder[left.role] - roleOrder[right.role];

        if (byRole !== 0) {
            return byRole;
        }

        return left.user.username.localeCompare(right.user.username, 'ru');
    });
}
