import type { FC } from 'react';
import { LuPlus } from 'react-icons/lu';
import { Button } from '@chakra-ui/react';

type AddButtonProps = {
    isExpanded: boolean;
};

export const AddButton: FC<AddButtonProps> = ({ isExpanded }) => {
    return (
        <Button variant="subtle" colorPalette="blue" w="full" size="md">
            <LuPlus />
            {isExpanded && 'Новый документ'}
        </Button>
    );
};
