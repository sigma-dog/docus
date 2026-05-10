import { HStack, Image } from '@chakra-ui/react';
import logo from 'assets/Logo.svg';

export const SidebarHeader = () => {
    return (
        <HStack
            justify="space-between"
            px={4}
            py={4}
            borderBottomWidth="1px"
            borderColor="border.default"
            flexShrink={0}
            transition="all 0.3s ease"
        >
            <Image src={logo} h="7" />
        </HStack>
    );
};
