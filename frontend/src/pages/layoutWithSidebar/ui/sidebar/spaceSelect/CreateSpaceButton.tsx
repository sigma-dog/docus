import { type FC, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { Button, HStack } from '@chakra-ui/react';

import { CreateSpaceDialog } from 'widgets/createSpaceDialog';

type CreateSpaceItemProps = {
    label: string;
    organizationSlug: string;
};

export const CreateSpaceItem: FC<CreateSpaceItemProps> = ({
    label,
    organizationSlug,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                justifyContent="flex-start"
                variant="ghost"
                colorPalette="blue"
                w="full"
                size="xs"
                onClick={() => setIsOpen(true)}
            >
                <HStack>
                    <LuPlus />
                    {label}
                </HStack>
            </Button>

            <CreateSpaceDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                organizationSlug={organizationSlug}
            />
        </>
    );
};
