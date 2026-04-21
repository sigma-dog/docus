import { LuFile, LuFolder } from 'react-icons/lu';
import { createTreeCollection, TreeView } from '@chakra-ui/react';

export type NavNode = {
    id: string;
    label: string;
    children?: { id: string; label: string }[];
};

export const MOCK_TREE: NavNode[] = [
    {
        id: '1',
        label: 'Общие договоренности',
        children: [
            { id: '1-1', label: 'Ревью' },
            { id: '1-2', label: 'ИИ' },
        ],
    },
    {
        id: '2',
        label: 'Инструменты',
        children: [
            { id: '2-1', label: 'React' },
            { id: '2-2', label: 'TypeScript' },
        ],
    },
    { id: '3', label: 'Архитектура' },
    { id: '4', label: 'Git' },
];

export const Navigation = () => {
    const collection = createTreeCollection<NavNode>({
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.label,
        rootNode: {
            id: 'ROOT',
            label: 'root',
            children: MOCK_TREE,
        },
    });

    return (
        <TreeView.Root collection={collection}>
            <TreeView.Label>Навигация</TreeView.Label>
            <TreeView.Tree>
                <TreeView.Node<NavNode>
                    indentGuide={<TreeView.BranchIndentGuide />}
                    render={({ node, nodeState }) =>
                        nodeState.isBranch ? (
                            <TreeView.BranchControl>
                                <LuFolder />
                                <TreeView.BranchText>
                                    {node.label}
                                </TreeView.BranchText>
                            </TreeView.BranchControl>
                        ) : (
                            <TreeView.Item>
                                <LuFile />
                                <TreeView.ItemText>
                                    {node.label}
                                </TreeView.ItemText>
                            </TreeView.Item>
                        )
                    }
                />
            </TreeView.Tree>
        </TreeView.Root>
    );
};
