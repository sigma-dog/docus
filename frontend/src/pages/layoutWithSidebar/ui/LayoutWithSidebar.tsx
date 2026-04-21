import { Outlet } from 'react-router';
import { Flex } from '@chakra-ui/react';

import { Sidebar } from './sidebar/Sidebar';

const LayoutWithSidebar = () => {
    return (
        <Flex h="100vh" overflow="hidden" bg="white">
            <Sidebar />
            <Outlet />
        </Flex>
    );
};

export default LayoutWithSidebar;
