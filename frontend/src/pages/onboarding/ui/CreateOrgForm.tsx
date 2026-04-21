import { type FC, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Field, Flex, Input, Textarea } from '@chakra-ui/react';

import { useCreateOrganizationMutation } from 'shared/api';
import { toaster } from 'shared/ui/chakra/toaster';

export const CreateOrgForm: FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);
    const [description, setDescription] = useState('');

    const [createOrganization, { isLoading }] = useCreateOrganizationMutation();

    const slugError =
        slugTouched && !/^[a-z0-9-]{2,50}$/.test(slug)
            ? 'От 2 до 50 символов: строчные буквы, цифры, дефис'
            : undefined;

    const handleNameChange = (value: string) => {
        setName(value);
        if (!slugTouched) {
            setSlug(
                value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                    .slice(0, 50)
            );
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (slugError || !name || !slug) {
            return;
        }

        try {
            const org = await createOrganization({
                name,
                slug,
                description: description || undefined,
            }).unwrap();

            navigate(`/${org.slug}`);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось создать организацию',
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
            <Field.Root required>
                <Field.Label>
                    Название
                    <Field.RequiredIndicator />
                </Field.Label>
                <Input
                    placeholder="Например: Acme Corp"
                    variant="subtle"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                />
            </Field.Root>

            <Field.Root required invalid={!!slugError}>
                <Field.Label>
                    Slug
                    <Field.RequiredIndicator />
                </Field.Label>
                <Input
                    placeholder="acme-corp"
                    variant="subtle"
                    value={slug}
                    onChange={(e) => {
                        setSlug(
                            e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, '')
                                .slice(0, 50)
                        );
                        setSlugTouched(true);
                    }}
                />
                {slugError && <Field.ErrorText>{slugError}</Field.ErrorText>}
                <Field.HelperText>
                    Уникальный идентификатор в URL
                </Field.HelperText>
            </Field.Root>

            <Field.Root>
                <Field.Label>Описание</Field.Label>
                <Textarea
                    placeholder="Краткое описание организации"
                    variant="subtle"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    resize="none"
                    rows={3}
                />
            </Field.Root>

            <Button
                mt={2}
                w="full"
                size="lg"
                type="submit"
                loading={isLoading}
                disabled={!name || !slug || !!slugError}
            >
                Создать организацию
            </Button>
        </Flex>
    );
};
