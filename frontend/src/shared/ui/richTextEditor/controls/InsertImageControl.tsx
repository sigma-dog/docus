import { useState } from 'react';
import { LuImage, LuLink, LuUpload } from 'react-icons/lu';
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

import { Control } from '../rich-text-editor';
import { useRichTextEditorContext } from '../rich-text-editor-context';

export const InsertImageControl = () => {
    const { editor } = useRichTextEditorContext();
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    if (!editor) {
        return null;
    }

    return (
        <>
            <Control.ButtonControl
                icon={<LuImage />}
                label="Insert Image"
                onClick={() => setOpen(true)}
                variant="ghost"
            />

            <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
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
                                        <Tabs.Trigger disabled value="upload">
                                            <LuUpload /> Upload File
                                        </Tabs.Trigger>
                                    </Tabs.List>

                                    <Tabs.Content value="url">
                                        <Box display="flex" gap="2" mt="4">
                                            <Input
                                                placeholder="Enter image URL"
                                                id="image-url-input"
                                            />
                                            <Button
                                                onClick={() => {
                                                    const url = (
                                                        document.getElementById(
                                                            'image-url-input'
                                                        ) as HTMLInputElement
                                                    ).value;
                                                    if (url) {
                                                        editor
                                                            .chain()
                                                            .focus()
                                                            .setImage({
                                                                src: url,
                                                            })
                                                            .run();
                                                    }
                                                    setOpen(false);
                                                }}
                                            >
                                                Insert
                                            </Button>
                                        </Box>
                                    </Tabs.Content>

                                    <Tabs.Content value="upload">
                                        <FileUpload.Root
                                            maxW="xl"
                                            alignItems="stretch"
                                            maxFiles={1}
                                            accept="image/*"
                                            onFileAccept={(accepted) => {
                                                const uploaded =
                                                    accepted.files ?? [];
                                                setFiles(uploaded);

                                                if (uploaded[0]) {
                                                    const url =
                                                        URL.createObjectURL(
                                                            uploaded[0]
                                                        );
                                                    editor
                                                        .chain()
                                                        .focus()
                                                        .setImage({ src: url })
                                                        .run();
                                                    setOpen(false);
                                                }
                                            }}
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
                                                        Drag and drop a file
                                                        here
                                                    </Box>
                                                    <Box color="fg.muted">
                                                        .png, .jpg up to 5MB
                                                    </Box>
                                                </FileUpload.DropzoneContent>
                                            </FileUpload.Dropzone>

                                            <FileUpload.List files={files} />
                                        </FileUpload.Root>
                                    </Tabs.Content>
                                </Tabs.Root>
                            </Dialog.Body>

                            <Dialog.Footer mt="4">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
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
