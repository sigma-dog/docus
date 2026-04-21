import { LuBell, LuSearch, LuSettings } from 'react-icons/lu';
import {
    Avatar,
    HStack,
    Icon,
    Input,
    InputGroup,
    Tabs,
} from '@chakra-ui/react';

const tabs = [
    { value: 'home', label: 'Главная' },
    { value: 'spaces', label: 'Пространства' },
    { value: 'activities', label: 'Активности', disabled: true },
];

export const Header = () => {
    return (
        <HStack
            justify="space-between"
            px={4}
            borderBottomWidth="1px"
            borderColor="border.default"
            h="52px"
            flexShrink={0}
        >
            <HStack>
                <Tabs.Root defaultValue="home" variant="line" h="full">
                    <Tabs.List h="full" borderBottomWidth={0}>
                        {tabs.map(({ value, label, disabled }) => (
                            <Tabs.Trigger
                                key={value}
                                value={value}
                                h="full"
                                disabled={disabled}
                            >
                                {label}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>
                </Tabs.Root>
            </HStack>

            <HStack gap={2} flexShrink={0}>
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
                    />
                </InputGroup>
                <Icon color="fg.muted" cursor="pointer" boxSize={5}>
                    <LuBell />
                </Icon>
                <Icon color="fg.muted" cursor="pointer" boxSize={5}>
                    <LuSettings />
                </Icon>
                <Avatar.Root size="xs" shape="full">
                    <Avatar.Fallback name="Дима Авдеев" />
                </Avatar.Root>
            </HStack>
        </HStack>
    );
};
