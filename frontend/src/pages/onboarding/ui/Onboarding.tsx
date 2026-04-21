import { useState } from 'react';
import { Center, Flex, Image, Separator, Tabs, Text } from '@chakra-ui/react';
import logo from 'assets/Logo.svg';

import { CreateOrgForm } from './CreateOrgForm';
import { JoinOrgForm } from './JoinOrgForm';

const Onboarding = () => {
    const [tab, setTab] = useState<'create' | 'join'>('create');

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
                        Добро пожаловать в Docus
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
                    <Tabs.List w="full">
                        <Tabs.Trigger value="create" flex={1}>
                            Создать организацию
                        </Tabs.Trigger>
                        <Tabs.Trigger value="join" flex={1}>
                            Войти по инвайту
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="create" pt={4}>
                        <CreateOrgForm />
                    </Tabs.Content>
                    <Tabs.Content value="join" pt={4}>
                        <JoinOrgForm />
                    </Tabs.Content>
                </Tabs.Root>
            </Flex>
        </Center>
    );
};

export default Onboarding;
