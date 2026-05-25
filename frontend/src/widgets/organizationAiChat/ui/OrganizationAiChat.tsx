import { type FormEvent, useState } from 'react';
import { LuBot, LuSend, LuSparkles } from 'react-icons/lu';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
    Badge,
    Box,
    Button,
    CloseButton,
    Drawer,
    HStack,
    IconButton,
    Link,
    Portal,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react';

import { useAskOrganizationAiMutation } from 'shared/api';
import type { AiChatSource } from 'shared/types';
import { toaster } from 'shared/ui/chakra/toaster';

type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    sources?: AiChatSource[];
};

export const OrganizationAiChat = () => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [askOrganizationAi, { isLoading }] = useAskOrganizationAiMutation();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedQuestion = question.trim();
        if (!orgSlug || !trimmedQuestion || isLoading) {
            return;
        }

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text: trimmedQuestion,
        };
        setMessages((current) => [...current, userMessage]);
        setQuestion('');

        try {
            const response = await askOrganizationAi({
                slug: orgSlug,
                body: { question: trimmedQuestion },
            }).unwrap();
            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    text: response.answer,
                    sources: response.sources,
                },
            ]);
        } catch {
            toaster.create({
                type: 'error',
                title: 'AI чат недоступен',
                description: 'Проверьте, что RAG-сервис и LM Studio запущены.',
            });
            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    text: 'Не удалось получить ответ от AI-сервиса.',
                },
            ]);
        }
    };

    return (
        <Drawer.Root
            lazyMount
            open={open}
            placement="end"
            size={{ base: 'full', md: 'md' }}
            onOpenChange={(details) => setOpen(details.open)}
        >
            <Drawer.Trigger asChild>
                <IconButton
                    aria-label="Открыть AI чат"
                    variant="ghost"
                    size="sm"
                    color="fg.muted"
                    disabled={!orgSlug}
                >
                    <LuSparkles />
                </IconButton>
            </Drawer.Trigger>

            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content>
                        <Drawer.Header
                            borderBottomWidth="1px"
                            borderColor="border.default"
                        >
                            <HStack justify="space-between" w="full">
                                <HStack gap={2}>
                                    <Box color="fg.muted">
                                        <LuBot />
                                    </Box>
                                    <Drawer.Title>AI чат</Drawer.Title>
                                </HStack>
                                <Drawer.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                </Drawer.CloseTrigger>
                            </HStack>
                        </Drawer.Header>

                        <Drawer.Body p={0}>
                            <Stack h="full" gap={0}>
                                <Stack
                                    flex="1"
                                    gap={4}
                                    overflowY="auto"
                                    px={4}
                                    py={5}
                                    bg="bg.subtle"
                                >
                                    {messages.length === 0 ? (
                                        <Stack
                                            align="center"
                                            justify="center"
                                            minH="260px"
                                            textAlign="center"
                                            color="fg.muted"
                                        >
                                            <Box fontSize="3xl">
                                                <LuSparkles />
                                            </Box>
                                            <Text>
                                                Задайте вопрос по страницам этой
                                                организации.
                                            </Text>
                                        </Stack>
                                    ) : (
                                        messages.map((message) => (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                                orgSlug={orgSlug}
                                            />
                                        ))
                                    )}
                                </Stack>

                                <Box
                                    p={4}
                                    borderTopWidth="1px"
                                    borderColor="border.default"
                                    bg="bg.panel"
                                >
                                    <form onSubmit={handleSubmit}>
                                        <Stack gap={3}>
                                            <Textarea
                                                value={question}
                                                resize="none"
                                                minH="92px"
                                                placeholder="Спросите что-нибудь по базе знаний..."
                                                disabled={isLoading}
                                                onChange={(event) =>
                                                    setQuestion(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                            <HStack justify="space-between">
                                                <Text
                                                    fontSize="xs"
                                                    color="fg.muted"
                                                >
                                                    Ответ строится по
                                                    индексированным страницам.
                                                </Text>
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    loading={isLoading}
                                                    disabled={!question.trim()}
                                                >
                                                    <LuSend />
                                                    Спросить
                                                </Button>
                                            </HStack>
                                        </Stack>
                                    </form>
                                </Box>
                            </Stack>
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
};

type MessageBubbleProps = {
    message: ChatMessage;
    orgSlug?: string;
};

const MessageBubble = ({ message, orgSlug }: MessageBubbleProps) => {
    const isUser = message.role === 'user';

    return (
        <Stack align={isUser ? 'flex-end' : 'flex-start'} gap={2}>
            <Box
                maxW="88%"
                px={4}
                py={3}
                borderWidth="1px"
                borderColor={isUser ? 'blue.200' : 'border.default'}
                bg={isUser ? 'blue.50' : 'bg.panel'}
                borderRadius="md"
            >
                <Text>{message.text}</Text>
            </Box>

            {!isUser && !!message.sources?.length && (
                <Stack gap={2} maxW="88%">
                    <HStack gap={2} color="fg.muted">
                        <Text fontSize="xs" fontWeight="medium">
                            Источники
                        </Text>
                        <Badge size="sm" variant="subtle">
                            {message.sources.length}
                        </Badge>
                    </HStack>
                    {message.sources.map((source) => (
                        <SourceItem
                            key={`${source.pageId}:${source.chunkText.slice(0, 24)}`}
                            source={source}
                            orgSlug={orgSlug}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
};

type SourceItemProps = {
    source: AiChatSource;
    orgSlug?: string;
};

const SourceItem = ({ source, orgSlug }: SourceItemProps) => {
    const href = orgSlug
        ? `/${orgSlug}/${source.spaceKey}/pages/${source.pageId}`
        : undefined;

    return (
        <Box
            px={3}
            py={2}
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="md"
            bg="bg.panel"
        >
            <HStack justify="space-between" align="start" gap={3}>
                <Stack gap={1} minW={0}>
                    {href ? (
                        <Link asChild fontSize="sm" fontWeight="medium">
                            <RouterLink to={href}>{source.title}</RouterLink>
                        </Link>
                    ) : (
                        <Text fontSize="sm" fontWeight="medium">
                            {source.title}
                        </Text>
                    )}
                    <Text fontSize="xs" color="fg.muted" lineClamp={2}>
                        {source.chunkText}
                    </Text>
                </Stack>
                <Badge flexShrink={0} variant="outline">
                    {source.spaceKey}
                </Badge>
            </HStack>
        </Box>
    );
};
