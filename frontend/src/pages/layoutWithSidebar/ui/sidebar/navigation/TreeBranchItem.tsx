import type { FC } from 'react';
import { LuChevronRight, LuFolder } from 'react-icons/lu';
import { TreeView } from '@chakra-ui/react';

import type { PageSummary } from 'shared/types';

import { CreateNodeMenu } from './CreateNodeMenu';
import { EmptyFolder } from './EmptyFolder';
import { NodeContextMenu } from './NodeContextMenu';

type TreeBranchItemProps = {
    onCreatePage?: (parentId?: string) => void;
    onCreateFolder?: (parentId?: string) => void;
    node: PageSummary;
};

export const TreeBranchItem: FC<TreeBranchItemProps> = ({
    node,
    onCreatePage,
    onCreateFolder,
}) => {
    return (
        <>
            <TreeView.BranchControl alignItems="flex-start" role="group" pr={1}>
                <TreeView.BranchTrigger>
                    <TreeView.BranchIndicator asChild>
                        <LuChevronRight />
                    </TreeView.BranchIndicator>
                </TreeView.BranchTrigger>
                <LuFolder />
                <TreeView.BranchText flex="1">{node.title}</TreeView.BranchText>
                <CreateNodeMenu
                    nodeId={node.id}
                    onCreatePage={onCreatePage}
                    onCreateFolder={onCreateFolder}
                />
                <NodeContextMenu
                    nodeId={node.id}
                    nodeTitle={node.title}
                    isFolder={node.isFolder}
                />
            </TreeView.BranchControl>
            {node.children.length === 0 && <EmptyFolder />}
        </>
    );
};
