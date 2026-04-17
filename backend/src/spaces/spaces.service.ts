import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class SpacesService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateSpaceDto) {
        const exists = await this.prisma.space.findUnique({
            where: { key: dto.key },
        });
        if (exists)
            throw new ConflictException(
                `Space with key "${dto.key}" already exists`
            );

        return this.prisma.space.create({
            data: {
                name: dto.name,
                key: dto.key,
                description: dto.description,
                ownerId: userId,
                members: {
                    create: { userId, role: 'ADMIN' },
                },
            },
            include: { members: true },
        });
    }

    async findMine(userId: string) {
        return this.prisma.space.findMany({
            where: {
                OR: [{ ownerId: userId }, { members: { some: { userId } } }],
            },
            include: {
                _count: { select: { pages: true, members: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(key: string, userId: string) {
        const space = await this.prisma.space.findUnique({
            where: { key },
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
        if (!space) throw new NotFoundException(`Space "${key}" not found`);
        this.assertMember(space, userId);
        return space;
    }

    async update(key: string, userId: string, dto: UpdateSpaceDto) {
        const space = await this.getSpaceOrThrow(key);
        this.assertAdminOrOwner(space, userId);

        return this.prisma.space.update({
            where: { key },
            data: dto,
        });
    }

    async remove(key: string, userId: string) {
        const space = await this.getSpaceOrThrow(key);
        if (space.ownerId !== userId)
            throw new ForbiddenException(
                'Only the owner can delete this space'
            );

        await this.prisma.space.delete({ where: { key } });
    }

    async addMember(key: string, requesterId: string, dto: AddMemberDto) {
        const space = await this.getSpaceOrThrow(key);
        this.assertAdminOrOwner(space, requesterId);

        const alreadyMember = await this.prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: { spaceId: space.id, userId: dto.userId },
            },
        });
        if (alreadyMember)
            throw new ConflictException('User is already a member');

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

    async getSpaceOrThrow(key: string) {
        const space = await this.prisma.space.findUnique({
            where: { key },
            include: { members: true },
        });
        if (!space) throw new NotFoundException(`Space "${key}" not found`);
        return space;
    }

    private assertMember(
        space: { ownerId: string; members: { userId: string }[] },
        userId: string
    ) {
        const isMember =
            space.ownerId === userId ||
            space.members.some((m) => m.userId === userId);
        if (!isMember) throw new ForbiddenException('Access denied');
    }

    private assertAdminOrOwner(
        space: { ownerId: string; members: { userId: string; role: string }[] },
        userId: string
    ) {
        if (space.ownerId === userId) return;
        const member = space.members.find((m) => m.userId === userId);
        if (!member || member.role !== 'ADMIN')
            throw new ForbiddenException('Insufficient permissions');
    }
}
