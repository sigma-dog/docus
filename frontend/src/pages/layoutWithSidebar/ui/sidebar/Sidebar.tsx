import { useState } from 'react';
import { Flex, Stack } from '@chakra-ui/react';

import { AddButton } from './AddButton';
import { Company } from './Company';
import { Navigation } from './Navigation';
import { SidebarFooter } from './SidebarFooter';
import { SidebarHeader } from './SidebarHeader';
import { SpaceSelect } from './SpaceSelect';

type SidebarProps = {
    workspaceName: string;
    workspaceDescription: string;
    spaceName: string;
    spaceKey: string;
};

const EXPANDED_WIDTH = 375;
const COLLAPSED_WIDTH = 90;

export const Sidebar = ({
    workspaceName,
    workspaceDescription,
    spaceName,
    spaceKey,
}: SidebarProps) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <Flex
            direction="column"
            w={isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}
            flexShrink={0}
            borderRightWidth="1px"
            borderColor="border.default"
            h="full"
            overflow="hidden"
            transition="all 0.3s ease"
        >
            <SidebarHeader
                toggleExpanded={toggleExpanded}
                isExpanded={isExpanded}
            />
            <Flex
                direction="column"
                justify="space-between"
                flex="1"
                overflow="hidden"
                bg="bg.subtle"
                p={4}
            >
                <Stack gap={5} alignItems={isExpanded ? 'stretch' : 'center'}>
                    <Company
                        workspaceName={workspaceName}
                        workspaceDescription={workspaceDescription}
                        isExpanded={isExpanded}
                    />

                    {isExpanded && (
                        <SpaceSelect
                            spaceName={spaceName}
                            spaceKey={spaceKey}
                        />
                    )}

                    <Stack gap={4}>
                        <AddButton isExpanded={isExpanded} />
                        {isExpanded && <Navigation />}
                    </Stack>
                </Stack>

                <SidebarFooter isExpanded={isExpanded} />
            </Flex>
        </Flex>
    );
};
