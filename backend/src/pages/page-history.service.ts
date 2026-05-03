import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PageHistoryService {
    constructor(private prisma: PrismaService) {}

    async createSnapshot(
        pageId: string,
        authorId: string,
        title: string,
        content: string | null
    ) {
        return this.prisma.pageHistory.create({
            data: { pageId, authorId, title, content: content ?? null },
        });
    }

    async findAll(pageId: string) {
        return this.prisma.pageHistory.findMany({
            where: { pageId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true },
                },
            },
        });
    }
}
