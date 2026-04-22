import type { FC } from 'react';
import { LuDot, LuFile, LuFolder } from 'react-icons/lu';
import { TreeView } from '@chakra-ui/react';

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
        <TreeView.Item role="group" pr={1}>
            <LuDot />
            {node.isFolder ? <LuFolder /> : <LuFile />}
            <TreeView.ItemText flex="1">{node.title}</TreeView.ItemText>
            <CreateNodeMenu
                nodeId={node.parentId ?? undefined}
                onCreatePage={onCreatePage}
                onCreateFolder={onCreateFolder}
            />
            <NodeContextMenu
                nodeId={node.id}
                nodeTitle={node.title}
                isFolder={node.isFolder}
            />
        </TreeView.Item>
    );
};
