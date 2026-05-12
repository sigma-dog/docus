import type { Dispatch, FC, SetStateAction } from 'react';
import { Dialog } from '@chakra-ui/react';

import type { Page } from 'shared/types';

import { getDiffNew, getDiffNewTitle } from './utils';
import type { DiffTarget } from '../../../lib/types';
import { LastEdited } from '../../lastEdited/LastEdited';
import { DiffViewer } from '../diffViewer/DiffViewer';

type DiffDialogProps = {
    diffTarget: DiffTarget | null;
    page: Page;
    setDiffTarget: Dispatch<SetStateAction<DiffTarget | null>>;
};

export const DiffDialog: FC<DiffDialogProps> = ({
    diffTarget,
    page,
    setDiffTarget,
}) => {
    return (
        <Dialog.Root
            open={diffTarget !== null}
            onOpenChange={({ open }) => {
                if (!open) {
                    setDiffTarget(null);
                }
            }}
            size="cover"
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content display="flex" flexDirection="column">
                    <Dialog.Header
                        borderBottomWidth="1px"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Dialog.Title>
                            {diffTarget
                                ? `История: ${diffTarget.entry.title}`
                                : ''}
                        </Dialog.Title>

                        <LastEdited page={page} />
                        <Dialog.CloseTrigger />
                    </Dialog.Header>
                    <Dialog.Body flex="1" overflow="hidden" p={4}>
                        {diffTarget && (
                            <DiffViewer
                                oldTitle={diffTarget.entry.title}
                                newTitle={getDiffNewTitle(diffTarget)}
                                oldHtml={diffTarget.entry.content ?? ''}
                                newHtml={getDiffNew(diffTarget)}
                            />
                        )}
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
