import { useState } from 'react';
import { LuImage, LuLink, LuUpload } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Dialog,
    FileUpload,
    Icon,
    Input,
    Portal,
    Tabs,
} from '@chakra-ui/react';

import { useUploadPageImageMutation } from 'shared/api';
import { toaster } from 'shared/ui/chakra/toaster';

import { Control } from '../rich-text-editor';
import { useRichTextEditorContext } from '../rich-text-editor-context';

const ACCEPTED_IMAGE_TYPES: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
    'image/avif': ['.avif'],
};

export const InsertImageControl = () => {
    const { editor } = useRichTextEditorContext();
    const [open, setOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const { orgSlug, spaceKey, pageId } = useParams<{
        orgSlug: string;
        spaceKey: string;
        pageId: string;
    }>();
    const [uploadPageImage, { isLoading: isUploading }] =
        useUploadPageImageMutation();

    if (!editor) {
        return null;
    }

    const isUploadAvailable = Boolean(orgSlug && spaceKey && pageId);
    const resetDialogState = () => {
        setImageUrl('');
        setFiles([]);
    };

    const handleUrlInsert = () => {
        const trimmedUrl = imageUrl.trim();

        if (!trimmedUrl) {
            return;
        }

        editor.chain().focus().setImage({ src: trimmedUrl }).run();
        setImageUrl('');
        setFiles([]);
        setOpen(false);
    };

    const handleFileUpload = async (details: { acceptedFiles: File[] }) => {
        const nextFile = details.acceptedFiles[0] ?? null;

        setFiles(nextFile ? [nextFile] : []);

        if (!nextFile || !orgSlug || !spaceKey || !pageId) {
            return;
        }

        try {
            const { url } = await uploadPageImage({
                orgSlug,
                spaceKey,
                pageId,
                file: nextFile,
            }).unwrap();

            editor.chain().focus().setImage({ src: url }).run();
            setFiles([]);
            setOpen(false);
            toaster.create({
                type: 'success',
                title: 'Изображение загружено',
            });
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка загрузки',
                description: 'Не удалось загрузить изображение в S3',
            });
        }
    };

    const handleFileReject = () => {
        toaster.create({
            type: 'error',
            title: 'Неподходящий файл',
            description: 'Поддерживаются JPG, PNG, WEBP, GIF и AVIF до 5 МБ',
        });
    };

    return (
        <>
            <Control.ButtonControl
                icon={<LuImage />}
                label="Insert Image"
                onClick={() => setOpen(true)}
                variant="ghost"
            />

            <Dialog.Root
                open={open}
                onOpenChange={(e) => {
                    setOpen(e.open);

                    if (!e.open) {
                        resetDialogState();
                    }
                }}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content maxW="lg">
                            <Dialog.Header>
                                <Dialog.Title>Insert Image</Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <Tabs.Root defaultValue="url">
                                    <Tabs.List>
                                        <Tabs.Trigger value="url">
                                            <LuLink /> Embed URL
                                        </Tabs.Trigger>
                                        <Tabs.Trigger
                                            value="upload"
                                            disabled={
                                                !isUploadAvailable ||
                                                isUploading
                                            }
                                        >
                                            <LuUpload /> Upload File
                                        </Tabs.Trigger>
                                    </Tabs.List>

                                    <Tabs.Content value="url">
                                        <Box display="flex" gap="2" mt="4">
                                            <Input
                                                placeholder="Enter image URL"
                                                value={imageUrl}
                                                onChange={(event) =>
                                                    setImageUrl(
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        event.preventDefault();
                                                        handleUrlInsert();
                                                    }
                                                }}
                                            />
                                            <Button onClick={handleUrlInsert}>
                                                Insert
                                            </Button>
                                        </Box>
                                    </Tabs.Content>

                                    <Tabs.Content value="upload">
                                        <FileUpload.Root
                                            maxW="xl"
                                            alignItems="stretch"
                                            maxFiles={1}
                                            accept={ACCEPTED_IMAGE_TYPES}
                                            maxFileSize={5 * 1024 * 1024}
                                            onFileChange={handleFileUpload}
                                            onFileReject={handleFileReject}
                                        >
                                            <FileUpload.HiddenInput />
                                            <FileUpload.Dropzone>
                                                <Icon
                                                    size="md"
                                                    color="fg.muted"
                                                >
                                                    <LuUpload />
                                                </Icon>
                                                <FileUpload.DropzoneContent>
                                                    <Box>
                                                        Перетяните файл сюда
                                                    </Box>
                                                    <Box color="fg.muted">
                                                        Или нажмите, чтобы
                                                        выбрать с устройства
                                                    </Box>
                                                </FileUpload.DropzoneContent>
                                            </FileUpload.Dropzone>

                                            <FileUpload.List
                                                files={files}
                                                clearable
                                            />
                                        </FileUpload.Root>
                                        {!isUploadAvailable && (
                                            <Box mt="3" color="fg.muted">
                                                Upload is available only inside
                                                a saved page.
                                            </Box>
                                        )}
                                    </Tabs.Content>
                                </Tabs.Root>
                            </Dialog.Body>

                            <Dialog.Footer mt="4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        resetDialogState();
                                        setOpen(false);
                                    }}
                                    disabled={isUploading}
                                >
                                    Cancel
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};
