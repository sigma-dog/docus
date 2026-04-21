import type { FC } from 'react';
import { Avatar, createListCollection, HStack, Select } from '@chakra-ui/react';

type SpaceSelectProps = {
    spaceName: string;
    spaceKey: string;
};

export const SpaceSelect: FC<SpaceSelectProps> = ({ spaceName, spaceKey }) => {
    const spaceItems = [{ label: spaceName, value: spaceKey }];
    const collection = createListCollection({ items: spaceItems });

    return (
        <Select.Root
            collection={collection}
            defaultValue={[spaceKey]}
            variant="subtle"
        >
            <Select.Control>
                <Select.Trigger>
                    <HStack gap={2}>
                        <Avatar.Root size="2xs" shape="rounded">
                            <Avatar.Fallback
                                name={spaceName.slice(0, 2).toUpperCase()}
                            />
                        </Avatar.Root>
                        <Select.ValueText placeholder="Выберите пространство" />
                    </HStack>
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.Indicator />
                </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
                <Select.Content>
                    {spaceItems.map((item) => (
                        <Select.Item key={item.value} item={item}>
                            {item.label}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Positioner>
        </Select.Root>
    );
};
