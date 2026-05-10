import type { FC } from 'react';
import { Avatar, HStack } from '@chakra-ui/react';

import type { Organization } from 'shared/types';
import { OrganizationInfoMenu } from 'widgets/organizationInfoMenu';

import { OrgSelect } from './orgSelect/OrgSelect';

type CompanyProps = {
    organization: Organization | undefined;
    isExpanded: boolean;
};

export const Company: FC<CompanyProps> = ({ organization, isExpanded }) => {
    if (isExpanded) {
        return (
            <HStack gap={2} align="stretch">
                <OrgSelect selectedSlug={organization?.slug ?? ''} />
                {organization && (
                    <OrganizationInfoMenu organization={organization} />
                )}
            </HStack>
        );
    }

    return (
        <HStack gap={1} justify="center" align="center">
            <Avatar.Root size="lg" shape="rounded">
                <Avatar.Fallback name={organization?.name ?? ''} />
            </Avatar.Root>
            {organization && (
                <OrganizationInfoMenu organization={organization} />
            )}
        </HStack>
    );
};
