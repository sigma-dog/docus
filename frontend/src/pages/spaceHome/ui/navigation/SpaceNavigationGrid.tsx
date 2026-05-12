import type { FC } from 'react';
import { Grid } from '@chakra-ui/react';

import type { PageSummary } from 'shared/types';

import { SpaceNavigationItem } from './SpaceNavigationItem';

type SpaceNavigationGridProps = {
    pages: PageSummary[];
    onPageClick: (page: PageSummary) => void;
};

export const SpaceNavigationGrid: FC<SpaceNavigationGridProps> = ({
    pages,
    onPageClick,
}) => {
    return (
        <Grid templateColumns="repeat(4, 350px)" gap={2}>
            {pages.map((page) => (
                <SpaceNavigationItem
                    key={page.id}
                    page={page}
                    onClick={onPageClick}
                />
            ))}
        </Grid>
    );
};
