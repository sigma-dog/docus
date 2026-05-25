import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OrganizationsService } from '../organizations/organizations.service';
import { PrismaService } from '../prisma/prisma.service';
import { AskAiDto } from './dto/ask-ai.dto';
import { RagPagePayload, RagQueryResponse } from './types';

@Injectable()
export class AiChatService {
    private readonly logger = new Logger(AiChatService.name);
    private readonly ragServiceUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly organizationsService: OrganizationsService,
        private readonly prisma: PrismaService
    ) {
        this.ragServiceUrl =
            this.configService.get<string>('RAG_SERVICE_URL') ??
            'http://localhost:8001';
    }

    async ask(slug: string, userId: string, dto: AskAiDto) {
        const org = await this.organizationsService.findOne(slug, userId);

        return this.postToRag<RagQueryResponse>('/rag/query', {
            organizationSlug: slug,
            organizationId: org.id,
            question: dto.question,
            topK: dto.topK ?? 6,
        });
    }

    async reindex(slug: string, userId: string) {
        const org = await this.organizationsService.findOne(slug, userId);
        const pages = await this.prisma.page.findMany({
            where: { space: { organizationId: org.id } },
            include: { space: { select: { id: true, key: true } } },
            orderBy: { updatedAt: 'desc' },
        });

        for (const page of pages) {
            await this.postToRag('/rag/index/upsert-page', {
                organizationId: org.id,
                organizationSlug: slug,
                spaceId: page.space.id,
                spaceKey: page.space.key,
                pageId: page.id,
                title: page.title,
                content: page.content,
                isFolder: page.isFolder,
                updatedAt: page.updatedAt,
            });
        }

        return { indexedPages: pages.length };
    }

    indexPageBestEffort(payload: RagPagePayload) {
        void this.postToRag('/rag/index/upsert-page', payload).catch(
            (error) => {
                this.logger.warn(
                    `Failed to index page "${payload.pageId}": ${getErrorMessage(error)}`
                );
            }
        );
    }

    deletePageBestEffort(payload: { organizationId: string; pageId: string }) {
        void this.postToRag('/rag/index/delete-page', payload).catch(
            (error) => {
                this.logger.warn(
                    `Failed to delete page chunks "${payload.pageId}": ${getErrorMessage(error)}`
                );
            }
        );
    }

    private async postToRag<T = unknown>(path: string, body: unknown) {
        let response: Response;
        try {
            response = await fetch(`${this.ragServiceUrl}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (error) {
            throw new BadGatewayException(
                `RAG service is unavailable: ${getErrorMessage(error)}`
            );
        }

        if (!response.ok) {
            const message = await response.text();
            throw new BadGatewayException(
                `RAG service returned ${response.status}: ${message}`
            );
        }

        return (await response.json()) as T;
    }
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}
