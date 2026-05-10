import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { OrganizationsService } from '../organizations/organizations.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
    constructor(
        private prisma: PrismaService,
        private organizationsService: OrganizationsService
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
                _count: { select: { pages: true } },
            },
        });
        if (!fullSpace) throw new NotFoundException(`Space "${key}" not found`);
        return fullSpace;
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

    async remove(key: string, userId: string, orgSlug?: string) {
        const space = await this.getSpaceOrThrow(key, orgSlug);
        if (space.ownerId !== userId) {
            throw new ForbiddenException(
                'Only the owner can delete this space'
            );
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
            space.organization.members.some((member) => member.userId === userId);

        if (!access) {
            throw new ForbiddenException('Access denied');
        }
    }
}
