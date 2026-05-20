import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Center,
    Flex,
    Image,
    Separator,
    Spinner,
    Tabs,
    Text,
} from '@chakra-ui/react';
import logo from 'assets/Logo.svg';

import { useGetOrganizationsQuery } from 'shared/api';
import { getAccessToken } from 'shared/api/tokensUtils';
import { getLastOrgSlug, getLastSpaceKey } from 'shared/lib';

import { CreateOrgForm } from './CreateOrgForm';
import { JoinOrgForm } from './JoinOrgForm';

const Onboarding = () => {
    const [tab, setTab] = useState<'create' | 'join'>('create');
    const token = getAccessToken();

    const { data: orgs, isLoading } = useGetOrganizationsQuery(undefined, {
        skip: !token,
    });

    if (isLoading) {
        return (
            <Center w="100vw" h="100vh">
                <Spinner size="lg" />
            </Center>
        );
    }

    if (orgs?.length) {
        const lastOrg = getLastOrgSlug();
        const targetOrg = orgs.find((o) => o.slug === lastOrg) ?? orgs[0];
        const lastSpace = getLastSpaceKey(targetOrg.slug);

        if (lastSpace) {
            return <Navigate to={`/${targetOrg.slug}/${lastSpace}`} replace />;
        }
        return <Navigate to={`/${targetOrg.slug}`} replace />;
    }

    return (
        <Center w="full" h="full">
            <Flex
                w={520}
                backgroundColor="bg.panel"
                padding={10}
                direction="column"
                alignItems="center"
                gap={8}
                borderRadius="lg"
            >
                <Image src={logo} h="10" />

                <Flex direction="column" gap={1} alignItems="center">
                    <Text fontWeight="semibold" fontSize="xl">
                        Добро пожаловать!
                    </Text>
                    <Text color="fg.muted" fontSize="sm" textAlign="center">
                        Создайте организацию или присоединитесь по инвайту
                    </Text>
                </Flex>

                <Separator w="full" />

                <Tabs.Root
                    value={tab}
                    onValueChange={(d) => setTab(d.value as 'create' | 'join')}
                    w="full"
                    variant="line"
                >
                    <Tabs.List
                        w="full"
                        display="grid"
                        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
                        alignItems="stretch"
                    >
                        <Tabs.Trigger
                            value="create"
                            justifyContent="center"
                            textAlign="center"
                            px={4}
                        >
                            Создать организацию
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="join"
                            justifyContent="center"
                            textAlign="center"
                            px={4}
                        >
                            Войти по инвайту
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="create" pt={4} w="full">
                        <CreateOrgForm />
                    </Tabs.Content>
                    <Tabs.Content value="join" pt={4} w="full">
                        <JoinOrgForm />
                    </Tabs.Content>
                </Tabs.Root>
            </Flex>
        </Center>
    );
};

export default Onboarding;
