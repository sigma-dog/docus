import { type FC, type KeyboardEvent, useRef, useState } from 'react';
import { LuCheck, LuPencil, LuX } from 'react-icons/lu';
import { HStack, IconButton, Input, Text } from '@chakra-ui/react';

type TitleRenameProps = {
    title: string;
    onRename: (title: string) => void;
};

export const TitleRename: FC<TitleRenameProps> = ({ title, onRename }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [value, setValue] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    const startRename = () => {
        setValue(title);
        setIsRenaming(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const commit = () => {
        const trimmed = value.trim();
        if (trimmed && trimmed !== title) {
            onRename(trimmed);
        }
        setIsRenaming(false);
    };

    const cancel = () => {
        setValue(title);
        setIsRenaming(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            commit();
        }
        if (e.key === 'Escape') {
            cancel();
        }
    };

    if (isRenaming) {
        return (
            <HStack gap={1} flex="1" minW={0}>
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    fontSize="2xl"
                    fontWeight="bold"
                    variant="flushed"
                    autoFocus
                    flex="1"
                    minW={0}
                />
                <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="green"
                    aria-label="Подтвердить"
                    onClick={commit}
                >
                    <LuCheck />
                </IconButton>
                <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Отмена"
                    onClick={cancel}
                >
                    <LuX />
                </IconButton>
            </HStack>
        );
    }

    return (
        <HStack gap={1} flex="1" minW={0}>
            <Text fontSize="2xl" fontWeight="bold" truncate>
                {title}
            </Text>
            <IconButton
                size="xs"
                variant="ghost"
                aria-label="Переименовать"
                onClick={startRename}
                color="fg.muted"
            >
                <LuPencil />
            </IconButton>
        </HStack>
    );
};
