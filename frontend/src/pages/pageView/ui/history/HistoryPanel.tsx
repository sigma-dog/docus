import type { FC } from 'react';
import { useState } from 'react';
import { Drawer, Portal, Spinner, Stack, Text } from '@chakra-ui/react';

import {
    useGetPageHistoryQuery,
    useRestorePageVersionMutation,
} from 'shared/api';
import type { Page, PageHistoryEntry } from 'shared/types';
import { toaster } from 'shared/ui/chakra/toaster';
import { ConfirmDialog } from 'shared/ui/confirmDialog/ConfirmDialog';

import { DiffDialog } from './diffDialog/DiffDialog';
import { HistoryList } from './HistoryList';
import type { DiffTarget } from '../../lib/types';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    orgSlug: string;
    spaceKey: string;
    page: Page;
    canEdit: boolean;
};

export const HistoryPanel: FC<Props> = ({
    isOpen,
    onClose,
    orgSlug,
    spaceKey,
    page,
    canEdit,
}) => {
    const { data: history, isLoading } = useGetPageHistoryQuery({
        orgSlug,
        spaceKey,
        pageId: page.id,
    });
    const [restorePageVersion, { isLoading: isRestoring }] =
        useRestorePageVersionMutation();

    const [diffTarget, setDiffTarget] = useState<DiffTarget | null>(null);
    const [restoreTarget, setRestoreTarget] = useState<PageHistoryEntry | null>(
        null
    );

    const handleRestoreConfirm = async () => {
        if (!restoreTarget) {
            return;
        }

        try {
            await restorePageVersion({
                orgSlug,
                spaceKey,
                pageId: page.id,
                body: {
                    historyEntryId: restoreTarget.id,
                },
            }).unwrap();

            toaster.create({
                type: 'success',
                title: 'Версия восстановлена',
                description: 'Страница успешно откатена к выбранной версии.',
            });
            setRestoreTarget(null);
            setDiffTarget(null);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Не удалось восстановить версию',
                description: 'Попробуйте еще раз.',
            });
        }
    };

    return (
        <>
            <Drawer.Root
                lazyMount
                open={isOpen}
                placement="end"
                size={{ base: 'full', lg: 'md' }}
                onOpenChange={(details) => {
                    if (!details.open) {
                        onClose();
                    }
                }}
            >
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content>
                            <Drawer.Header>
                                <Drawer.Title>История изменений</Drawer.Title>
                            </Drawer.Header>

                            <Drawer.Body px={0}>
                                {isLoading ? (
                                    <Stack py={10} align="center">
                                        <Spinner size="sm" />
                                        <Text color="fg.muted">
                                            Загружаем историю страницы...
                                        </Text>
                                    </Stack>
                                ) : history ? (
                                    <HistoryList
                                        setDiffTarget={setDiffTarget}
                                        history={history}
                                        page={page}
                                        canEdit={canEdit}
                                        setRestoreTarget={setRestoreTarget}
                                    />
                                ) : null}
                            </Drawer.Body>

                            <Drawer.CloseTrigger />
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>

            <DiffDialog
                diffTarget={diffTarget}
                setDiffTarget={setDiffTarget}
                page={page}
            />

            <ConfirmDialog
                isOpen={restoreTarget !== null}
                onClose={() => {
                    if (!isRestoring) {
                        setRestoreTarget(null);
                    }
                }}
                onConfirm={handleRestoreConfirm}
                title="Откатить страницу к этой версии?"
                message="Будут восстановлены заголовок и содержимое страницы. Это действие создаст новую запись в истории."
                confirmText="Откатить"
                cancelText="Отмена"
                isLoading={isRestoring}
            />
        </>
    );
};
