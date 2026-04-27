import type { FC } from 'react';
import { Avatar, Text } from '@chakra-ui/react';

import type { Page } from 'shared/types';

import { formatUpdatedAt } from './utils';

type LastEditedProps = {
    page: Page;
};

export const LastEdited: FC<LastEditedProps> = ({ page }) => {
    return (
        <>
            <Avatar.Root size="xs">
                <Avatar.Image src={page.author.avatarUrl ?? undefined} />
                <Avatar.Fallback>
                    {page.author.username[0].toUpperCase()}
                </Avatar.Fallback>
            </Avatar.Root>
            <Text fontSize="sm" color="fg.muted" whiteSpace="nowrap">
                {page.author.username} · {formatUpdatedAt(page.updatedAt)}
            </Text>
        </>
    );
};
