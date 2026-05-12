import { useNavigate, useParams } from 'react-router-dom';
import {
    createTreeCollection,
    Spinner,
    Text,
    TreeView,
} from '@chakra-ui/react';

import { useGetPagesQuery } from 'shared/api';
import type { PageSummary } from 'shared/types';

import { TreeBranchItem } from './TreeBranchItem';
import { TreeItem } from './TreeItem';
import { useTreeExpandedState } from './useTreeExpandedState';

type Props = {
    onCreatePage?: (parentId?: string) => void;
    onCreateFolder?: (parentId?: string) => void;
};

export const Navigation = ({ onCreatePage, onCreateFolder }: Props) => {
    const { orgSlug, spaceKey } = useParams<{
        orgSlug: string;
        spaceKey?: string;
    }>();
    const navigate = useNavigate();

    const { expandedValue, onExpandedChange } = useTreeExpandedState(
        spaceKey ?? ''
    );

    const { data: pages = [], isLoading } = useGetPagesQuery(
        { orgSlug: orgSlug ?? '', spaceKey: spaceKey ?? '' },
        { skip: !spaceKey || !orgSlug }
    );

    if (!spaceKey) {
        return null;
    }

    if (isLoading) {
        return <Spinner size="sm" />;
    }

    if (pages.length === 0) {
        return (
            <Text fontSize="xs" color="fg.muted" px={2}>
                Нет страниц
            </Text>
        );
    }

    const collection = createTreeCollection<PageSummary>({
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.title,
        nodeToChildrenCount: (node) =>
            node.isFolder ? Math.max(node.children.length, 1) : undefined,
        rootNode: {
            id: 'ROOT',
            title: 'root',
            children: pages,
        } as PageSummary,
    });

    return (
        <TreeView.Root
            collection={collection}
            expandedValue={expandedValue}
            onExpandedChange={onExpandedChange}
        >
            <TreeView.Label>Навигация</TreeView.Label>
            <TreeView.Tree>
                <TreeView.Node<PageSummary>
                    indentGuide={<TreeView.BranchIndentGuide />}
                    render={({ node, nodeState }) =>
                        nodeState.isBranch ? (
                            <TreeBranchItem
                                node={node}
                                onCreatePage={onCreatePage}
                                onCreateFolder={onCreateFolder}
                            />
                        ) : (
                            <TreeItem
                                onCreatePage={onCreatePage}
                                onCreateFolder={onCreateFolder}
                                node={node}
                                onOpenPage={(pageId) => {
                                    if (orgSlug && spaceKey) {
                                        navigate(
                                            `/${orgSlug}/${spaceKey}/pages/${pageId}`
                                        );
                                    }
                                }}
                            />
                        )
                    }
                />
            </TreeView.Tree>
        </TreeView.Root>
    );
};
