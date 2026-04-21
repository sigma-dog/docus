import { Box, Stack } from '@chakra-ui/react';

import { RecentPages } from './RecentPages';
import { SpaceContent } from './SpaceContent';
import { RECENT_PAGES, SPACE_PAGES } from '../lib/config';

const SPACE_DESCRIPTION =
    'Core architectural definitions, infrastructure documentation, ' +
    'and technical roadmaps for the Manuscript ecosystem.';

export const Home = () => {
    return (
        <Box flex="1" overflowY="auto" bg="bg.subtle" p={8}>
            <Stack gap={6}>
                <SpaceContent
                    workspaceName="Авито"
                    spaceName="Frontend разработка"
                    spaceDescription={SPACE_DESCRIPTION}
                    pages={SPACE_PAGES}
                />
                <RecentPages pages={RECENT_PAGES} />
            </Stack>
        </Box>
    );
};
