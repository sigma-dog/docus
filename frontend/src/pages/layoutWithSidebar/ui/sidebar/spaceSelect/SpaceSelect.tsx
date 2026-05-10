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
import { SpaceActionsMenu } from 'widgets/spaceActionsMenu';
import { SpaceInfoMenu } from 'widgets/spaceInfoMenu';

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
    const {
        currentData: spaces = [],
        isLoading,
        isFetching,
    } = useGetSpacesQuery(organizationSlug, {
        refetchOnMountOrArgChange: true,
    });

    const items = spaces.map((s: Space) => ({ label: s.name, value: s.key }));

    const collection = createListCollection({
        items: [...items, addSpaceItem],
    });

    const selectedSpace = spaces.find((s: Space) => s.key === selectedKey);

    if (isLoading || (isFetching && !spaces.length)) {
        return <Skeleton h="40px" borderRadius="md" />;
    }

    return (
        <HStack gap={2} align="stretch">
            <Select.Root
                collection={collection}
                value={[selectedKey]}
                onValueChange={(details) => onSelect(details.value[0])}
                variant="subtle"
                flex="1"
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

                            const space = spaces.find(
                                (s: Space) => s.key === item.value
                            );

                            return (
                                <Select.Item key={item.value} item={item}>
                                    <Select.ItemText>
                                        {item.label}
                                    </Select.ItemText>
                                    <HStack
                                        ml="auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {space && (
                                            <>
                                                <SpaceInfoMenu
                                                    space={space}
                                                    organizationSlug={
                                                        organizationSlug
                                                    }
                                                    triggerAriaLabel="Информация о пространстве"
                                                />
                                                <SpaceActionsMenu
                                                    space={space}
                                                    organizationSlug={
                                                        organizationSlug
                                                    }
                                                />
                                            </>
                                        )}
                                    </HStack>
                                </Select.Item>
                            );
                        })}
                    </Select.Content>
                </Select.Positioner>
            </Select.Root>
        </HStack>
    );
};
