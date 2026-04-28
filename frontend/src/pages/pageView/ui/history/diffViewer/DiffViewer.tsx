import type { FC } from 'react';
import { Box, Grid } from '@chakra-ui/react';

import { buildParts } from './utils';
import { Pane } from '../Pane';

type Props = {
    oldHtml: string;
    newHtml: string;
};

export const DiffViewer: FC<Props> = ({ oldHtml, newHtml }) => {
    const oldParts = buildParts(oldHtml, newHtml, 'old');
    const newParts = buildParts(oldHtml, newHtml, 'new');

    return (
        <Grid
            templateColumns="1fr 1fr"
            h="100%"
            overflow="hidden"
            borderWidth="1px"
            rounded="md"
        >
            <Box borderRightWidth="1px" h="100%" overflow="hidden">
                <Pane
                    parts={oldParts}
                    label="До изменения"
                    labelColor="red.700"
                    headerBg="red.50"
                />
            </Box>
            <Box h="100%" overflow="hidden">
                <Pane
                    parts={newParts}
                    label="После изменения"
                    labelColor="green.700"
                    headerBg="green.50"
                />
            </Box>
        </Grid>
    );
};
