import type { FC } from 'react';
import { LuListTree } from 'react-icons/lu';
import { Box, Button, Stack, Text } from '@chakra-ui/react';

import type { TocHeading } from './pageView/utils';

type TableOfContentsProps = {
    headings: TocHeading[];
    onSelect: (headingId: string) => void;
};

export const TableOfContents: FC<TableOfContentsProps> = ({
    headings,
    onSelect,
}) => {
    if (!headings.length) {
        return null;
    }

    const counters: number[] = [];
    const numberedHeadings = headings.map((heading) => {
        counters[heading.level - 1] = (counters[heading.level - 1] ?? 0) + 1;
        counters.length = heading.level;

        return {
            ...heading,
            number: counters.join('.'),
        };
    });

    return (
        <Box
            p={4}
            bg="transparent"
            rounded="lg"
            maxH="calc(100vh - 120px)"
            overflowY="auto"
            css={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--chakra-colors-border-muted) transparent',
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'var(--chakra-colors-border-muted)',
                    borderRadius: '999px',
                },
            }}
        >
            <Stack gap={4}>
                <Stack gap={1}>
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        display="flex"
                        alignItems="center"
                        gap={2}
                    >
                        <LuListTree />
                        Оглавление
                    </Text>
                </Stack>

                <Stack gap={1} align="stretch">
                    {numberedHeadings.map((heading) => (
                        <Button
                            key={heading.id}
                            variant="ghost"
                            justifyContent="flex-start"
                            fontWeight="medium"
                            size="sm"
                            h="auto"
                            py={2}
                            whiteSpace="normal"
                            textAlign="left"
                            paddingInlineStart={`${(heading.level - 1) * 14 + 8}px`}
                            onClick={() => onSelect(heading.id)}
                        >
                            {heading.number}. {heading.text}
                        </Button>
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
};
