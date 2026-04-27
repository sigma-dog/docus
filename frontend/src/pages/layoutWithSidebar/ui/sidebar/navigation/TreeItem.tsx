import type { FC } from 'react';
import { LuDot, LuFile, LuFolder } from 'react-icons/lu';
import { Box, TreeView } from '@chakra-ui/react';

import type { PageSummary } from 'shared/types';

import { CreateNodeMenu } from './CreateNodeMenu';
import { NodeContextMenu } from './NodeContextMenu';

type TreeItemProps = {
    onCreatePage?: (parentId?: string) => void;
    onCreateFolder?: (parentId?: string) => void;
    node: PageSummary;
};

export const TreeItem: FC<TreeItemProps> = ({
    onCreatePage,
    onCreateFolder,
    node,
}) => {
    return (
        <TreeView.Item
            title={node.title}
            alignItems="center"
            role="group"
            pr={1}
        >
            <LuDot />
            {node.icon ? (
                <Box as="span" lineHeight="1" fontSize="sm">
                    {node.icon}
                </Box>
            ) : node.isFolder ? (
                <LuFolder />
            ) : (
                <LuFile />
            )}
            <TreeView.ItemText truncate flex="1">
                {node.title}
            </TreeView.ItemText>
            <CreateNodeMenu
                nodeId={node.parentId ?? undefined}
                onCreatePage={onCreatePage}
                onCreateFolder={onCreateFolder}
            />
            <NodeContextMenu
                nodeId={node.id}
                nodeTitle={node.title}
                nodeIcon={node.icon}
                isFolder={node.isFolder}
            />
        </TreeView.Item>
    );
};
