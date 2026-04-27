import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { SpacesService } from '../spaces/spaces.service';
import { CreatePageDto } from './dto/create-page.dto';
import { MovePageDto } from './dto/move-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
    constructor(
        private prisma: PrismaService,
        private spacesService: SpacesService
    ) {}

    async create(spaceKey: string, userId: string, dto: CreatePageDto) {
        const space = await this.spacesService.getSpaceOrThrow(spaceKey);
        this.assertEditor(space, userId);

        if (dto.parentId) {
            await this.getPageOrThrow(dto.parentId, space.id);
        }

        return this.prisma.page.create({
            data: {
                title: dto.title,
                icon: dto.icon,
                content: dto.content,
                isFolder: dto.isFolder ?? false,
                position: dto.position ?? 0,
                spaceId: space.id,
                parentId: dto.parentId ?? null,
                authorId: userId,
            },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true },
                },
                _count: { select: { children: true } },
            },
        });
    }

    async findTree(spaceKey: string, userId: string) {
        const space = await this.spacesService.getSpaceOrThrow(spaceKey);
        this.assertViewer(space, userId);

        const pages = await this.prisma.page.findMany({
            where: { spaceId: space.id },
            omit: { content: true },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true },
                },
            },
            orderBy: [
                { parentId: 'asc' },
                { isFolder: 'desc' },
                { position: 'asc' },
                { createdAt: 'asc' },
            ],
        });

        return buildTree(pages);
    }

    async findOne(spaceKey: string, pageId: string, userId: string) {
        const space = await this.spacesService.getSpaceOrThrow(spaceKey);
        this.assertViewer(space, userId);

        const page = await this.getPageOrThrow(pageId, space.id);
        return page;
    }

    async update(
        spaceKey: string,
        pageId: string,
        userId: string,
        dto: UpdatePageDto
    ) {
        const space = await this.spacesService.getSpaceOrThrow(spaceKey);
        this.assertEditor(space, userId);

        await this.getPageOrThrow(pageId, space.id);

        return this.prisma.page.update({
            where: { id: pageId },
            data: dto,
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true },
                },
            },
        });
    }

    async remove(spaceKey: string, pageId: string, userId: string) {
        const space = await this.spacesService.getSpaceOrThrow(spaceKey);
        this.assertEditor(space, userId);

        await this.getPageOrThrow(pageId, space.id);
        await this.prisma.page.delete({ where: { id: pageId } });
    }

    async move(
        spaceKey: string,
        pageId: string,
        userId: string,
        dto: MovePageDto
    ) {
        const space = await this.spacesService.getSpaceOrThrow(spaceKey);
        this.assertEditor(space, userId);

        await this.getPageOrThrow(pageId, space.id);

        if (dto.parentId) {
            await this.getPageOrThrow(dto.parentId, space.id);
        }

        return this.prisma.page.update({
            where: { id: pageId },
            data: {
                parentId: dto.parentId !== undefined ? dto.parentId : undefined,
                position: dto.position !== undefined ? dto.position : undefined,
            },
        });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private async getPageOrThrow(pageId: string, spaceId: string) {
        const page = await this.prisma.page.findFirst({
            where: { id: pageId, spaceId },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true },
                },
                children: {
                    orderBy: { position: 'asc' },
                    select: { id: true, title: true, position: true },
                },
            },
        });
        if (!page) throw new NotFoundException(`Page "${pageId}" not found`);
        return page;
    }

    private assertViewer(
        space: { ownerId: string; members: { userId: string }[] },
        userId: string
    ) {
        const access =
            space.ownerId === userId ||
            space.members.some((m) => m.userId === userId);
        if (!access) throw new ForbiddenException('Access denied');
    }

    private assertEditor(
        space: { ownerId: string; members: { userId: string; role: string }[] },
        userId: string
    ) {
        if (space.ownerId === userId) return;
        const member = space.members.find((m) => m.userId === userId);
        if (!member || member.role === 'VIEWER')
            throw new ForbiddenException('Insufficient permissions');
    }
}

// ─── Tree builder ─────────────────────────────────────────────────────────────

type WithChildren<T> = T & { children: WithChildren<T>[] };

function buildTree<T extends { id: string; parentId: string | null }>(
    pages: T[]
): WithChildren<T>[] {
    const map = new Map<string, WithChildren<T>>();
    const roots: WithChildren<T>[] = [];

    for (const page of pages) {
        map.set(page.id, { ...page, children: [] });
    }

    for (const page of map.values()) {
        if (page.parentId && map.has(page.parentId)) {
            map.get(page.parentId)!.children.push(page);
        } else {
            roots.push(page);
        }
    }

    return roots;
}
