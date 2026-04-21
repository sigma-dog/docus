import { Outlet } from 'react-router';
import { Flex } from '@chakra-ui/react';

import { Sidebar } from './sidebar/Sidebar';

const LayoutWithSidebar = () => {
    return (
        <Flex h="100vh" overflow="hidden" bg="white">
            <Sidebar
                workspaceName="Авито"
                workspaceDescription="Корпоративная база знаний"
                spaceName="Frontend разработка"
                spaceKey="frontend"
            />

            <Outlet />
        </Flex>
    );
};

export default LayoutWithSidebar;
