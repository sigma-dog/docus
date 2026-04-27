import type { FC } from 'react';
import { Avatar, HStack } from '@chakra-ui/react';

import type { Organization } from 'shared/types';

import { OrgSelect } from './orgSelect/OrgSelect';

type CompanyProps = {
    organization: Organization | undefined;
    isExpanded: boolean;
};

export const Company: FC<CompanyProps> = ({ organization, isExpanded }) => {
    if (isExpanded) {
        return <OrgSelect selectedSlug={organization?.slug ?? ''} />;
    }

    return (
        <HStack gap={2} justify="center">
            <Avatar.Root size="lg" shape="rounded">
                <Avatar.Fallback name={organization?.name ?? ''} />
            </Avatar.Root>
        </HStack>
    );
};
