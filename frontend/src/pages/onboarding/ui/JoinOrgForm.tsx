import { type FC, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Field, Flex, Input, Text } from '@chakra-ui/react';

import { useJoinOrganizationMutation } from 'shared/api';
import { toaster } from 'shared/ui/chakra/toaster';

export const JoinOrgForm: FC = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [joinOrganization, { isLoading }] = useJoinOrganizationMutation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            return;
        }

        try {
            const member = await joinOrganization({
                code: code.trim(),
            }).unwrap();
            navigate(`/${member.organization!.slug}`);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Неверный или устаревший инвайт-код',
            });
        }
    };

    return (
        <Flex
            as="form"
            direction="column"
            gap={5}
            w="full"
            onSubmit={handleSubmit}
        >
            <Text color="fg.muted" fontSize="sm">
                Введите инвайт-код, который вам прислал администратор
                организации.
            </Text>

            <Field.Root required>
                <Field.Label>
                    Инвайт-код
                    <Field.RequiredIndicator />
                </Field.Label>
                <Input
                    placeholder="Введите код приглашения"
                    variant="subtle"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            </Field.Root>

            <Button
                mt={2}
                w="full"
                size="lg"
                type="submit"
                loading={isLoading}
                disabled={!code.trim()}
            >
                Присоединиться
            </Button>
        </Flex>
    );
};
