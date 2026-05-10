import { type FC, useState } from 'react';
import { LuLogIn, LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Button,
    Center,
    createListCollection,
    HStack,
    Select,
    Skeleton,
    Stack,
    Text,
} from '@chakra-ui/react';

import { useGetOrganizationsQuery } from 'shared/api';
import type { Organization } from 'shared/types';

import { CreateOrgDialog } from './CreateOrgDialog';
import { JoinOrgDialog } from './JoinOrgDialog';

type OrgSelectProps = {
    selectedSlug: string;
};

const addOrgItem = { label: 'Создать организацию', value: 'add_org' };
const joinOrgItem = { label: 'Войти в организацию', value: 'join_org' };

export const OrgSelect: FC<OrgSelectProps> = ({ selectedSlug }) => {
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const { data: organizations = [], isLoading } = useGetOrganizationsQuery();

    const items = organizations.map((o: Organization) => ({
        label: o.name,
        value: o.slug,
    }));

    const collection = createListCollection({
        items: [...items, addOrgItem, joinOrgItem],
    });

    const selectedOrg = organizations.find((o) => o.slug === selectedSlug);

    const handleValueChange = (details: { value: string[] }) => {
        const value = details.value[0];
        if (value === 'add_org' || value === 'join_org') {
            return;
        }
        navigate(`/${value}`);
    };

    if (isLoading) {
        return <Skeleton h="40px" borderRadius="md" />;
    }

    return (
        <>
            <Select.Root
                collection={collection}
                value={[selectedSlug]}
                onValueChange={handleValueChange}
                variant="ghost"
            >
                <Select.Control>
                    <Select.Trigger p={0}>
                        <HStack gap={2}>
                            <Avatar.Root size="md" shape="rounded">
                                <Avatar.Fallback
                                    name={selectedOrg?.name ?? ''}
                                />
                            </Avatar.Root>
                            {selectedOrg ? (
                                <Stack gap={0} align="flex-start">
                                    <Text
                                        fontSize="sm"
                                        fontWeight="medium"
                                        lineHeight="short"
                                        lineClamp={1}
                                        maxW="220px"
                                    >
                                        {selectedOrg.name}
                                    </Text>
                                    {selectedOrg.description && (
                                        <Text
                                            fontSize="xs"
                                            color="fg.muted"
                                            lineHeight="short"
                                            lineClamp={1}
                                            maxW="220px"
                                        >
                                            {selectedOrg.description}
                                        </Text>
                                    )}
                                </Stack>
                            ) : (
                                <Text fontSize="sm" color="fg.muted">
                                    Выберите организацию...
                                </Text>
                            )}
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
                                    Нет доступных организаций
                                </Text>
                            </Center>
                        )}

                        {collection.items.map((item) => {
                            if (item.value === 'add_org') {
                                return (
                                    <Button
                                        key={item.value}
                                        justifyContent="flex-start"
                                        variant="ghost"
                                        colorPalette="blue"
                                        w="full"
                                        size="xs"
                                        onClick={() => setIsDialogOpen(true)}
                                    >
                                        <HStack>
                                            <LuPlus />
                                            {item.label}
                                        </HStack>
                                    </Button>
                                );
                            }

                            if (item.value === 'join_org') {
                                return (
                                    <Button
                                        key={item.value}
                                        justifyContent="flex-start"
                                        variant="ghost"
                                        w="full"
                                        size="xs"
                                        onClick={() =>
                                            setIsJoinDialogOpen(true)
                                        }
                                    >
                                        <HStack>
                                            <LuLogIn />
                                            {item.label}
                                        </HStack>
                                    </Button>
                                );
                            }

                            return (
                                <Select.Item key={item.value} item={item}>
                                    <HStack gap={2}>
                                        <Avatar.Root size="2xs" shape="rounded">
                                            <Avatar.Fallback
                                                name={item.label}
                                            />
                                        </Avatar.Root>
                                        <Text lineClamp={1} maxW="220px">
                                            {item.label}
                                        </Text>
                                    </HStack>
                                </Select.Item>
                            );
                        })}
                    </Select.Content>
                </Select.Positioner>
            </Select.Root>

            <CreateOrgDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
            <JoinOrgDialog
                isOpen={isJoinDialogOpen}
                onClose={() => setIsJoinDialogOpen(false)}
            />
        </>
    );
};
