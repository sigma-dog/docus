import { Outlet } from 'react-router';
import { Flex } from '@chakra-ui/react';

import { Header } from './Header';

const LayoutWithMainHeader = () => {
    return (
        <Flex direction="column" flex="1" minW={0} h="full" overflow="hidden">
            <Header />
            <Outlet />
        </Flex>
    );
};

export default LayoutWithMainHeader;
