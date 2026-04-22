import { useParams } from 'react-router-dom';
import {
    createTreeCollection,
    Spinner,
    Text,
    TreeView,
} from '@chakra-ui/react';

import { useGetPagesQuery } from 'shared/api';
import type { Page } from 'shared/types';

import { TreeBranchItem } from './TreeBranchItem';
import { TreeItem } from './TreeItem';
import { useTreeExpandedState } from './useTreeExpandedState';

type Props = {
    onCreatePage?: (parentId?: string) => void;
    onCreateFolder?: (parentId?: string) => void;
};

export const Navigation = ({ onCreatePage, onCreateFolder }: Props) => {
    // const { orgSlug, spaceKey } = useParams<{
    const { spaceKey } = useParams<{
        orgSlug: string;
        spaceKey?: string;
    }>();
    // const navigate = useNavigate();

    const { expandedValue, onExpandedChange } = useTreeExpandedState(
        spaceKey ?? ''
    );

    const { data: pages = [], isLoading } = useGetPagesQuery(spaceKey ?? '', {
        skip: !spaceKey,
    });

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

    const collection = createTreeCollection<Page>({
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.title,
        nodeToChildrenCount: (node) =>
            node.isFolder ? Math.max(node.children.length, 1) : undefined,
        rootNode: {
            id: 'ROOT',
            title: 'root',
            children: pages,
        } as Page,
    });

    return (
        <TreeView.Root
            collection={collection}
            expandedValue={expandedValue}
            onExpandedChange={onExpandedChange}
            // onSelectionChange={({ selectedValue, selectedNodes }) => {
            // const id = selectedValue[0];
            // if (id && orgSlug && spaceKey) {
            //     navigate(`/${orgSlug}/${spaceKey}/pages/${id}`);
            // }
            // }}
        >
            <TreeView.Label>Навигация</TreeView.Label>
            <TreeView.Tree>
                <TreeView.Node<Page>
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
                            />
                        )
                    }
                />
            </TreeView.Tree>
        </TreeView.Root>
    );
};
