import type { FC } from 'react';
import { Avatar, HStack, Stack, Text } from '@chakra-ui/react';

import type { Organization } from 'shared/types';

type CompanyProps = {
    organization: Organization | undefined;
    isExpanded: boolean;
};

export const Company: FC<CompanyProps> = ({ organization, isExpanded }) => {
    return (
        <HStack gap={2}>
            <Avatar.Root size="lg" shape="rounded">
                <Avatar.Fallback name={organization?.name ?? ''} />
            </Avatar.Root>
            {isExpanded && (
                <Stack gap={0}>
                    <Text fontWeight="medium" fontSize="lg" lineHeight="28px">
                        {organization?.name ?? ''}
                    </Text>
                    <Text color="fg.muted" fontSize="md">
                        {organization?.description ?? ''}
                    </Text>
                </Stack>
            )}
        </HStack>
    );
};
