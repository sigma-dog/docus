import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    GoneException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    extractPlainText,
    extractSnippet,
    type Snippet,
} from '../common/utils/tiptap';
import { PrismaService } from '../prisma/prisma.service';
import { AddOrgMemberDto } from './dto/add-org-member.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JoinOrganizationDto } from './dto/join-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateOrganizationDto) {
        const exists = await this.prisma.organization.findUnique({
            where: { slug: dto.slug },
        });
        if (exists)
            throw new ConflictException(
                `Organization with slug "${dto.slug}" already exists`
            );

        return this.prisma.organization.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                ownerId: userId,
                members: {
                    create: { userId, role: 'OWNER' },
                },
            },
            include: { members: true },
        });
    }

    async findMine(userId: string) {
        return this.prisma.organization.findMany({
            where: {
                OR: [{ ownerId: userId }, { members: { some: { userId } } }],
            },
            include: {
                _count: { select: { members: true, spaces: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(slug: string, userId: string) {
        const org = await this.prisma.organization.findUnique({
            where: { slug },
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
                _count: { select: { spaces: true } },
            },
        });
        if (!org)
            throw new NotFoundException(`Organization "${slug}" not found`);
        this.assertMember(org, userId);
        return org;
    }

    async update(slug: string, userId: string, dto: UpdateOrganizationDto) {
        const org = await this.getOrgOrThrow(slug);
        this.assertAdminOrOwner(org, userId);

        return this.prisma.organization.update({
            where: { slug },
            data: dto,
        });
    }

    async remove(slug: string, userId: string) {
        const org = await this.getOrgOrThrow(slug);
        if (org.ownerId !== userId)
            throw new ForbiddenException(
                'Only the owner can delete this organization'
            );

        await this.prisma.organization.delete({ where: { slug } });
    }

    async addMember(slug: string, requesterId: string, dto: AddOrgMemberDto) {
        const org = await this.getOrgOrThrow(slug);
        this.assertAdminOrOwner(org, requesterId);

        const alreadyMember = await this.prisma.orgMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: org.id,
                    userId: dto.userId,
                },
            },
        });
        if (alreadyMember)
            throw new ConflictException('User is already a member');

        return this.prisma.orgMember.create({
            data: {
                organizationId: org.id,
                userId: dto.userId,
                role: dto.role,
            },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
    }

    async removeMember(
        slug: string,
        requesterId: string,
        targetUserId: string
    ) {
        const org = await this.getOrgOrThrow(slug);
        this.assertAdminOrOwner(org, requesterId);

        if (org.ownerId === targetUserId)
            throw new ForbiddenException(
                'Cannot remove the organization owner'
            );

        const member = await this.prisma.orgMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: org.id,
                    userId: targetUserId,
                },
            },
        });
        if (!member) throw new NotFoundException('Member not found');

        await this.prisma.orgMember.delete({ where: { id: member.id } });
    }

    async findSpaces(slug: string, userId: string) {
        const org = await this.getOrgOrThrow(slug);
        this.assertMember(org, userId);

        return this.prisma.space.findMany({
            where: { organizationId: org.id },
            include: { _count: { select: { pages: true, members: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async searchPages(slug: string, userId: string, q: string) {
        const org = await this.getOrgOrThrow(slug);
        this.assertMember(org, userId);

        // Split the same way PostgreSQL 'simple' dictionary tokenizes text:
        // spaces and parentheses are delimiters, dots inside words are kept (console.log stays as one token)
        const tsQuery = q
            .trim()
            .split(/[\s()[\]{},;]+/)
            .filter(Boolean)
            .map((word) => `${word}:*`)
            .join(' & ');

        if (!tsQuery) return [];

        type Row = {
            id: string;
            title: string;
            content: string | null;
            spaceKey: string;
        };
        const rows = await this.prisma.$queryRaw<Row[]>`
            SELECT p.id, p.title, p.content, s.key AS "spaceKey"
            FROM "Page" p
            JOIN "Space" s ON s.id = p."spaceId"
            WHERE s."organizationId" = ${org.id}
              AND p."searchVector" @@ to_tsquery('simple', ${tsQuery})
            ORDER BY ts_rank(p."searchVector", to_tsquery('simple', ${tsQuery})) DESC
            LIMIT 20
        `;

        return rows.map(
            (
                p
            ): {
                id: string;
                title: string;
                spaceKey: string;
                snippet: Snippet;
            } => ({
                id: p.id,
                title: p.title,
                spaceKey: p.spaceKey,
                snippet: extractSnippet(
                    p.content ? extractPlainText(p.content) : '',
                    q
                ),
            })
        );
    }

    async createInvite(
        slug: string,
        requesterId: string,
        dto: CreateInviteDto
    ) {
        const org = await this.getOrgOrThrow(slug);
        this.assertAdminOrOwner(org, requesterId);

        return this.prisma.organizationInvite.create({
            data: {
                organizationId: org.id,
                role: dto.role ?? 'MEMBER',
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            },
            select: {
                id: true,
                code: true,
                role: true,
                expiresAt: true,
                createdAt: true,
                organization: { select: { id: true, name: true, slug: true } },
            },
        });
    }

    async joinByInvite(userId: string, dto: JoinOrganizationDto) {
        const invite = await this.prisma.organizationInvite.findUnique({
            where: { code: dto.code },
            include: { organization: { include: { members: true } } },
        });

        if (!invite) throw new NotFoundException('Invite not found');
        if (invite.usedAt)
            throw new GoneException('Invite has already been used');
        if (invite.expiresAt && invite.expiresAt < new Date()) {
            throw new GoneException('Invite has expired');
        }

        const alreadyMember = invite.organization.members.some(
            (m) => m.userId === userId
        );
        if (alreadyMember)
            throw new BadRequestException(
                'You are already a member of this organization'
            );

        const [, member] = await this.prisma.$transaction([
            this.prisma.organizationInvite.update({
                where: { id: invite.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.orgMember.create({
                data: {
                    organizationId: invite.organizationId,
                    userId,
                    role: invite.role,
                },
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            avatarUrl: true,
                        },
                    },
                },
            }),
        ]);

        return member;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    async getOrgOrThrow(slug: string) {
        const org = await this.prisma.organization.findUnique({
            where: { slug },
            include: { members: true },
        });
        if (!org)
            throw new NotFoundException(`Organization "${slug}" not found`);
        return org;
    }

    private assertMember(
        org: { ownerId: string; members: { userId: string }[] },
        userId: string
    ) {
        const isMember =
            org.ownerId === userId ||
            org.members.some((m) => m.userId === userId);
        if (!isMember) throw new ForbiddenException('Access denied');
    }

    private assertAdminOrOwner(
        org: { ownerId: string; members: { userId: string; role: string }[] },
        userId: string
    ) {
        if (org.ownerId === userId) return;
        const member = org.members.find((m) => m.userId === userId);
        if (!member || member.role !== 'ADMIN')
            throw new ForbiddenException('Insufficient permissions');
    }
}
