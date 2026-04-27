import { useRef, useState } from 'react';
import { LuSearch } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Icon,
    Input,
    InputGroup,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';

import { useSearchOrgPagesQuery } from 'shared/api';
import { useDebounce } from 'shared/lib';
import type { SearchResult, SearchSnippet } from 'shared/types';

const SnippetHighlight = ({ snippet }: { snippet: SearchSnippet }) => (
    <>
        {snippet.before}
        <Box as="mark" bg="yellow.200" rounded="sm" px="0.5">
            {snippet.match}
        </Box>
        {snippet.after}
    </>
);

export const SearchBox = () => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debouncedQ = useDebounce(input, 300);

    const trimmed = debouncedQ.trim();
    const { data: results, isFetching } = useSearchOrgPagesQuery(
        { slug: orgSlug!, q: trimmed },
        { skip: !orgSlug || trimmed.length < 2 }
    );

    const handleSelect = (spaceKey: string, pageId: string) => {
        navigate(`/${orgSlug}/${spaceKey}/pages/${pageId}`);
        setInput('');
        setIsOpen(false);
    };

    const showDropdown = isOpen && trimmed.length >= 2;

    return (
        <Box position="relative" ref={containerRef}>
            <InputGroup
                startElement={
                    <Icon color="fg.subtle">
                        <LuSearch />
                    </Icon>
                }
            >
                <Input
                    placeholder="Поиск информации..."
                    variant="subtle"
                    size="sm"
                    w="322px"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                />
            </InputGroup>

            {showDropdown && (
                <Box
                    position="absolute"
                    top="calc(100% + 4px)"
                    left={0}
                    w="400px"
                    bg="bg.panel"
                    borderWidth="1px"
                    borderColor="border.default"
                    borderRadius="md"
                    shadow="md"
                    zIndex="popover"
                    maxH="400px"
                    overflowY="auto"
                >
                    {isFetching && (
                        <Box px={4} py={3}>
                            <Spinner size="sm" />
                        </Box>
                    )}
                    {!isFetching && results?.length === 0 && (
                        <Text px={4} py={3} color="fg.muted" fontSize="sm">
                            Ничего не найдено
                        </Text>
                    )}
                    {!isFetching && results && results.length > 0 && (
                        <Stack gap={0}>
                            {results.map((r: SearchResult) => (
                                <Box
                                    key={r.id}
                                    px={4}
                                    py={2}
                                    cursor="pointer"
                                    _hover={{ bg: 'bg.subtle' }}
                                    onMouseDown={() =>
                                        handleSelect(r.spaceKey, r.id)
                                    }
                                >
                                    <Text
                                        fontWeight="semibold"
                                        fontSize="sm"
                                        lineClamp={1}
                                    >
                                        {r.title}
                                    </Text>
                                    {r.snippet && (
                                        <Text
                                            fontSize="xs"
                                            color="fg.muted"
                                            lineClamp={2}
                                        >
                                            <SnippetHighlight
                                                snippet={r.snippet}
                                            />
                                        </Text>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            )}
        </Box>
    );
};
