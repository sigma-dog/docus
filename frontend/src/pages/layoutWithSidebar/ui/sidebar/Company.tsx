import type { FC } from 'react';
import { Avatar, HStack, Stack, Text } from '@chakra-ui/react';

type CompanyProps = {
    workspaceName: string;
    workspaceDescription: string;
    isExpanded: boolean;
};

export const Company: FC<CompanyProps> = ({
    workspaceName,
    workspaceDescription,
    isExpanded,
}) => {
    return (
        <HStack gap={2}>
            <Avatar.Root size="lg" shape="rounded">
                <Avatar.Fallback name={workspaceName} />
            </Avatar.Root>
            {isExpanded && (
                <Stack gap={0}>
                    <Text fontWeight="medium" fontSize="lg" lineHeight="28px">
                        {workspaceName}
                    </Text>
                    <Text color="fg.muted" fontSize="md">
                        {workspaceDescription}
                    </Text>
                </Stack>
            )}
        </HStack>
    );
};
