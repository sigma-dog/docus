import * as React from 'react';
import {
    Box,
    createListCollection,
    Portal,
    Select,
    Text,
} from '@chakra-ui/react';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

const LANGUAGE_OPTIONS = [
    { value: '', label: 'Auto' },
    { value: 'bash', label: 'Bash' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'css', label: 'CSS' },
    { value: 'diff', label: 'Diff' },
    { value: 'go', label: 'Go' },
    { value: 'graphql', label: 'GraphQL' },
    { value: 'html', label: 'HTML' },
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'json', label: 'JSON' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'lua', label: 'Lua' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'php', label: 'PHP' },
    { value: 'python', label: 'Python' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'rust', label: 'Rust' },
    { value: 'scss', label: 'SCSS' },
    { value: 'shell', label: 'Shell' },
    { value: 'sql', label: 'SQL' },
    { value: 'swift', label: 'Swift' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
];

const collection = createListCollection({ items: LANGUAGE_OPTIONS });

export const CodeBlockNodeView: React.FC<NodeViewProps> = ({
    node,
    updateAttributes,
    editor,
}) => {
    const language = (node.attrs.language as string) || '';
    const [isEditable, setIsEditable] = React.useState(editor.isEditable);
    const isEditableRef = React.useRef(editor.isEditable);

    React.useEffect(() => {
        isEditableRef.current = isEditable;
    }, [isEditable]);

    React.useEffect(() => {
        const handler = () => {
            const editable = editor.isEditable;
            if (editable === isEditableRef.current) {
                return;
            }
            setTimeout(() => setIsEditable(editable), 0);
        };
        editor.on('transaction', handler);
        return () => {
            editor.off('transaction', handler);
        };
    }, [editor]);

    const languageLabel =
        (LANGUAGE_OPTIONS.find((o) => o.value === language)?.label ??
            language) ||
        'Auto';

    return (
        <NodeViewWrapper>
            <Box
                position="relative"
                bg="gray.900"
                rounded="lg"
                borderWidth="1px"
                borderColor="gray.700"
                my="0.75em"
                flexDir="column"
                alignItems="flex-start"
            >
                <Box px={2} py={2}>
                    {isEditable ? (
                        <Select.Root
                            collection={collection}
                            value={[language]}
                            onValueChange={(details) =>
                                updateAttributes({ language: details.value[0] })
                            }
                            size="xs"
                            variant="ghost"
                            positioning={{
                                sameWidth: false,
                            }}
                            css={{
                                '--select-trigger-height': 'sizes.5',
                                '--select-trigger-padding-x': 'spacing.2',
                            }}
                        >
                            <Select.Trigger
                                css={{
                                    color: 'gray.400',
                                    fontSize: 'xs',
                                    fontFamily: 'mono',
                                    _hover: {
                                        color: 'gray.200',
                                        bg: 'whiteAlpha.100',
                                    },
                                    borderRadius: 'md',
                                    px: '2',
                                }}
                            >
                                <Select.ValueText>
                                    {languageLabel}
                                </Select.ValueText>
                                <Select.Indicator />
                            </Select.Trigger>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content
                                        maxH="200px"
                                        overflowY="auto"
                                        minW="28"
                                        bg="gray.800"
                                        borderColor="gray.600"
                                    >
                                        {LANGUAGE_OPTIONS.map((opt) => (
                                            <Select.Item
                                                key={opt.value}
                                                item={opt.value}
                                                css={{
                                                    color: 'gray.200',
                                                    fontSize: 'xs',
                                                    fontFamily: 'mono',
                                                    _hover: {
                                                        bg: 'whiteAlpha.200',
                                                    },
                                                    _highlighted: {
                                                        bg: 'whiteAlpha.200',
                                                    },
                                                }}
                                            >
                                                <Select.ItemText>
                                                    {opt.label}
                                                </Select.ItemText>
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    ) : (
                        language && (
                            <Text
                                fontSize="xs"
                                fontFamily="mono"
                                color="gray.400"
                                userSelect="none"
                            >
                                {languageLabel}
                            </Text>
                        )
                    )}
                </Box>

                <Box
                    as="pre"
                    color="gray.100"
                    px="4"
                    pt="4"
                    pb="4"
                    overflowX="auto"
                    fontSize="sm"
                    lineHeight="1.6"
                    css={{
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
                    }}
                    margin="0"
                    borderRadius="inherit"
                    background="transparent"
                >
                    <code
                        style={{
                            fontFamily: 'inherit',
                            background: 'none',
                            padding: 0,
                            border: 'none',
                            color: 'inherit',
                            display: 'block',
                        }}
                    >
                        <NodeViewContent />
                    </code>
                </Box>
            </Box>
        </NodeViewWrapper>
    );
};
