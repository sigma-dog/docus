import type { FC } from 'react';
import { LuPanelLeftClose } from 'react-icons/lu';
import { HStack, Icon, Image } from '@chakra-ui/react';
import logo from 'assets/Logo.svg';
import logoSmall from 'assets/logo-small-dark.svg';

type SidebarHeaderProps = {
    toggleExpanded: () => void;
    isExpanded: boolean;
};

export const SidebarHeader: FC<SidebarHeaderProps> = ({
    toggleExpanded,
    isExpanded,
}) => {
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
            <Image src={isExpanded ? logo : logoSmall} h="7" />

            <Icon color="fg.muted" cursor="pointer" onClick={toggleExpanded}>
                <LuPanelLeftClose />
            </Icon>
        </HStack>
    );
};
