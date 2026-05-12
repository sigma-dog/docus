import type { FC } from 'react';
import { Box, Text } from '@chakra-ui/react';

import type { Part } from '../../lib/types';

const proseStyles = {
    '& h1': { fontSize: '2xl', fontWeight: 'bold', my: 3 },
    '& h2': { fontSize: 'xl', fontWeight: 'bold', my: 2 },
    '& h3': { fontSize: 'lg', fontWeight: 'semibold', my: 2 },
    '& p': { my: 2, lineHeight: 'tall' },
    '& ul': { pl: 6, my: 2, listStyleType: 'disc' },
    '& ol': { pl: 6, my: 2, listStyleType: 'decimal' },
    '& li': { my: 1 },
    '& blockquote': {
        borderLeftWidth: '3px',
        borderColor: 'gray.300',
        pl: 4,
        color: 'fg.muted',
        my: 2,
    },
    '& code': {
        bg: 'gray.100',
        px: 1,
        rounded: 'sm',
        fontFamily: 'mono',
        fontSize: 'sm',
    },
    '& pre': {
        bg: 'gray.900',
        color: 'gray.50',
        p: 4,
        rounded: 'md',
        my: 2,
        overflowX: 'auto',
    },
    '& pre code': { bg: 'transparent', p: 0 },
    '& strong': { fontWeight: 'bold' },
    '& em': { fontStyle: 'italic' },
};

export const Pane: FC<{
    parts: Part[];
    label: string;
    title: string;
    labelColor: string;
    headerBg: string;
}> = ({ parts, label, title, labelColor, headerBg }) => (
    <Box overflow="hidden" display="flex" flexDirection="column" h="100%">
        <Box px={4} py={2} bg={headerBg} borderBottomWidth="1px" flexShrink={0}>
            <Text fontSize="sm" fontWeight="medium" color={labelColor}>
                {label}
            </Text>
        </Box>
        <Box flex="1" overflowY="auto" px={6} py={4}>
            <Box mb={4} pb={4} borderBottomWidth="1px">
                <Text
                    fontSize="xs"
                    color="fg.muted"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    mb={1}
                >
                    Заголовок
                </Text>
                <Text fontSize="xl" fontWeight="semibold">
                    {title}
                </Text>
            </Box>
            <Box css={proseStyles}>
                {parts.length === 0 && (
                    <Text color="fg.muted" fontSize="sm">
                        Пусто
                    </Text>
                )}
                {parts.map((part, i) => (
                    <Box
                        key={i}
                        style={{ background: part.bg }}
                        dangerouslySetInnerHTML={{ __html: part.html }}
                    />
                ))}
            </Box>
        </Box>
    </Box>
);
