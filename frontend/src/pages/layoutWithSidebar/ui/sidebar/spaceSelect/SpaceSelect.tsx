import { type FC } from 'react';
import {
    Avatar,
    Center,
    createListCollection,
    HStack,
    Select,
    Skeleton,
    Text,
} from '@chakra-ui/react';

import { useGetSpacesQuery } from 'shared/api';
import type { Space } from 'shared/types';

import { CreateSpaceItem } from './CreateSpaceButton';

type SpaceSelectProps = {
    selectedKey: string;
    onSelect: (key: string) => void;
    organizationSlug: string;
};

const addSpaceItem = { label: 'Добавить пространство', value: 'add_space' };

export const SpaceSelect: FC<SpaceSelectProps> = ({
    selectedKey,
    onSelect,
    organizationSlug,
}) => {
    const { data: spaces = [], isLoading } =
        useGetSpacesQuery(organizationSlug);

    const items = spaces.map((s: Space) => ({ label: s.name, value: s.key }));

    const collection = createListCollection({
        items: [...items, addSpaceItem],
    });

    const selectedSpace = spaces.find((s: Space) => s.key === selectedKey);

    if (isLoading) {
        return <Skeleton h="40px" borderRadius="md" />;
    }

    return (
        <Select.Root
            collection={collection}
            value={[selectedKey]}
            onValueChange={(details) => onSelect(details.value[0])}
            variant="subtle"
        >
            <Select.Control>
                <Select.Trigger>
                    <HStack gap={2}>
                        <Avatar.Root size="2xs" shape="rounded">
                            <Avatar.Fallback
                                name={
                                    selectedSpace?.name
                                        .slice(0, 2)
                                        .toUpperCase() ?? ''
                                }
                            />
                        </Avatar.Root>
                        <Select.ValueText
                            maxW="full"
                            placeholder="Выберите пространство..."
                        />
                    </HStack>
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.Indicator />
                </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
                <Select.Content>
                    {!items.length && (
                        <Center py={2} px={2}>
                            <Text color="fg.muted" fontSize="xs">
                                Нет доступных пространств
                            </Text>
                        </Center>
                    )}

                    {collection.items.map((item) => {
                        if (item.value === 'add_space') {
                            return (
                                <CreateSpaceItem
                                    key={item.value}
                                    label={item.label}
                                    organizationSlug={organizationSlug}
                                />
                            );
                        }

                        return (
                            <Select.Item key={item.value} item={item}>
                                {item.label}
                            </Select.Item>
                        );
                    })}
                </Select.Content>
            </Select.Positioner>
        </Select.Root>
    );
};
