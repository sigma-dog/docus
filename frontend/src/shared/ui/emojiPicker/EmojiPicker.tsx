import { useState } from 'react';
import { Box, Button, Grid, Input, Text } from '@chakra-ui/react';

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
    {
        label: 'Смайлики',
        emojis: [
            '😀',
            '😃',
            '😄',
            '😁',
            '😆',
            '😅',
            '😂',
            '🤣',
            '😊',
            '😇',
            '🙂',
            '🙃',
            '😉',
            '😌',
            '😍',
            '🥰',
            '😘',
            '😋',
            '😛',
            '😜',
            '🤪',
            '🤨',
            '🧐',
            '🤓',
            '😎',
            '🥸',
            '🤩',
            '🥳',
            '😏',
            '😒',
            '😞',
            '😔',
            '😟',
            '😕',
            '🙁',
            '☹️',
            '😣',
            '😖',
            '😫',
            '😩',
            '🥺',
            '😢',
            '😭',
            '😤',
            '😠',
            '😡',
            '🤬',
            '🤯',
            '😳',
            '🥵',
            '🥶',
            '😱',
            '😨',
            '😰',
            '😥',
            '😓',
        ],
    },
    {
        label: 'Природа',
        emojis: [
            '🐶',
            '🐱',
            '🐭',
            '🐹',
            '🐰',
            '🦊',
            '🐻',
            '🐼',
            '🐨',
            '🐯',
            '🦁',
            '🐮',
            '🐷',
            '🐸',
            '🐵',
            '🐔',
            '🐧',
            '🐦',
            '🦆',
            '🦅',
            '🌸',
            '🌺',
            '🌻',
            '🌹',
            '🌷',
            '🌱',
            '🌿',
            '🍀',
            '🍁',
            '🍂',
            '🌊',
            '🔥',
            '⭐',
            '🌙',
            '☀️',
            '⛅',
            '🌈',
            '❄️',
            '🌴',
            '🌵',
        ],
    },
    {
        label: 'Еда',
        emojis: [
            '🍎',
            '🍊',
            '🍋',
            '🍇',
            '🍓',
            '🍒',
            '🍑',
            '🥭',
            '🍍',
            '🥝',
            '🍕',
            '🍔',
            '🌮',
            '🌯',
            '🍜',
            '🍝',
            '🍣',
            '🍱',
            '🍛',
            '🍲',
            '🍰',
            '🎂',
            '🧁',
            '🍩',
            '🍪',
            '🍫',
            '🍬',
            '🍭',
            '☕',
            '🍵',
        ],
    },
    {
        label: 'Активности',
        emojis: [
            '⚽',
            '🏀',
            '🏈',
            '⚾',
            '🎾',
            '🏐',
            '🏉',
            '🎱',
            '🏓',
            '🏸',
            '🥊',
            '🥋',
            '🎯',
            '🎮',
            '🎲',
            '🎸',
            '🎹',
            '🎺',
            '🥁',
            '🎻',
            '🏆',
            '🥇',
            '🎖️',
            '🏅',
            '🎫',
            '🎪',
            '🎭',
            '🎨',
            '🚴',
            '🏊',
        ],
    },
    {
        label: 'Объекты',
        emojis: [
            '💡',
            '🔦',
            '📚',
            '📖',
            '📝',
            '✏️',
            '🖊️',
            '🖋️',
            '📌',
            '📎',
            '🔑',
            '🗝️',
            '🔒',
            '🔓',
            '🔨',
            '⚙️',
            '🔧',
            '🔩',
            '💻',
            '🖥️',
            '📱',
            '📷',
            '🎥',
            '📡',
            '🔭',
            '🔬',
            '💊',
            '🩺',
            '🧪',
            '🧬',
            '💰',
            '💳',
            '📦',
            '📫',
            '📬',
            '🗂️',
            '📋',
            '📊',
        ],
    },
    {
        label: 'Символы',
        emojis: [
            '❤️',
            '🧡',
            '💛',
            '💚',
            '💙',
            '💜',
            '🖤',
            '🤍',
            '🤎',
            '💔',
            '✅',
            '❌',
            '⭕',
            '🔴',
            '🟠',
            '🟡',
            '🟢',
            '🔵',
            '🟣',
            '⚫',
            '⬆️',
            '⬇️',
            '⬅️',
            '➡️',
            '🔄',
            '♻️',
            '✨',
            '💫',
            '⚡',
            '🚀',
            '🌐',
            '📍',
            '🏠',
            '🏢',
            '🔔',
            '🔕',
            '💬',
            '📣',
        ],
    },
];

type Props = {
    onSelect: (emoji: string) => void;
};

export const EmojiPicker = ({ onSelect }: Props) => {
    const [search, setSearch] = useState('');

    const allEmojis = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    const filtered = search.trim()
        ? allEmojis.filter((e) => e.includes(search))
        : null;

    return (
        <Box w="280px" p={2}>
            <Input
                placeholder="Поиск..."
                size="sm"
                mb={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
            />
            <Box maxH="260px" overflowY="auto">
                {filtered ? (
                    <Grid templateColumns="repeat(8, 1fr)" gap={0}>
                        {filtered.map((emoji, i) => (
                            <EmojiButton
                                key={`${emoji}-${i}`}
                                emoji={emoji}
                                onSelect={onSelect}
                            />
                        ))}
                    </Grid>
                ) : (
                    EMOJI_CATEGORIES.map((cat) => (
                        <Box key={cat.label} mb={2}>
                            <Text
                                fontSize="2xs"
                                fontWeight="medium"
                                color="fg.muted"
                                mb={1}
                                px={1}
                            >
                                {cat.label}
                            </Text>
                            <Grid templateColumns="repeat(8, 1fr)" gap={0}>
                                {cat.emojis.map((emoji, i) => (
                                    <EmojiButton
                                        key={`${cat.label}-${emoji}-${i}`}
                                        emoji={emoji}
                                        onSelect={onSelect}
                                    />
                                ))}
                            </Grid>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

const EmojiButton = ({
    emoji,
    onSelect,
}: {
    emoji: string;
    onSelect: (e: string) => void;
}) => (
    <Button
        variant="ghost"
        size="xs"
        p={0}
        minW={0}
        h="30px"
        w="30px"
        fontSize="lg"
        onClick={(e) => {
            e.stopPropagation();
            onSelect(emoji);
        }}
    >
        {emoji}
    </Button>
);
