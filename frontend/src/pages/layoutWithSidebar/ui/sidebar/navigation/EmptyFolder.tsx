import { Text, TreeView } from '@chakra-ui/react';

export const EmptyFolder = () => (
    <TreeView.BranchContent>
        <Text
            fontSize="xs"
            color="fg.muted"
            py="var(--tree-padding-block)"
            css={{
                '--tree-depth': 'var(--depth)',
                '--tree-indentation-offset':
                    'calc(var(--tree-indentation) * var(--tree-depth))',
                '--tree-icon-offset':
                    'calc(var(--tree-icon-size) * var(--tree-depth) * 0.5)',
                '--tree-offset':
                    'calc(var(--tree-padding-inline) + ' +
                    'var(--tree-indentation-offset) + var(--tree-icon-offset))',
                paddingInlineStart: 'var(--tree-offset)',
            }}
        >
            В этой папке пока ничего нет
        </Text>
    </TreeView.BranchContent>
);
