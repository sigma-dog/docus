import type { FC } from 'react';
import { HStack } from '@chakra-ui/react';

import type { Organization } from 'shared/types';
import { OrganizationInfoMenu } from 'widgets/organizationInfoMenu';

import { OrgSelect } from './orgSelect/OrgSelect';

type CompanyProps = {
    organization: Organization | undefined;
};

export const Company: FC<CompanyProps> = ({ organization }) => {
    return (
        <HStack gap={2} align="stretch">
            <OrgSelect selectedSlug={organization?.slug ?? ''} />
            {organization && (
                <OrganizationInfoMenu organization={organization} />
            )}
        </HStack>
    );
};
