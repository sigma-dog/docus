import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Field, Flex, Input } from '@chakra-ui/react';

import { useRegisterMutation } from 'shared/api/auth';
import { setAccessToken, setRefreshToken } from 'shared/api/tokensUtils';
import { removeLastVisited, setUserInfo } from 'shared/lib';

type RegisterFormValues = {
    username: string;
    email: string;
    password: string;
};

export const Register = () => {
    const navigate = useNavigate();
    const [registerUser, { isLoading }] = useRegisterMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        mode: 'onBlur',
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            const userData = await registerUser(data).unwrap();

            removeLastVisited();
            setUserInfo(userData);
            setAccessToken(userData.access);
            setRefreshToken(userData.refresh);

            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Flex
            as="form"
            direction="column"
            gap={5}
            w="full"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Flex direction="column" gap={5} w="full">
                <Field.Root invalid={!!errors.username}>
                    <Field.Label>Ваше имя</Field.Label>
                    <Input
                        placeholder="Иван Иванов"
                        variant="subtle"
                        size="md"
                        {...register('username', {
                            required: 'Имя обязательно',
                            minLength: {
                                value: 2,
                                message: 'Минимум 2 символа',
                            },
                        })}
                    />
                    <Field.ErrorText>
                        {errors.username?.message}
                    </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.email}>
                    <Field.Label>Email</Field.Label>
                    <Input
                        placeholder="example@mail.com"
                        variant="subtle"
                        size="md"
                        type="email"
                        {...register('email', {
                            required: 'Email обязателен',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Некорректный email',
                            },
                        })}
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                    <Field.Label>Введите ваш пароль</Field.Label>
                    <Input
                        placeholder="Ваш пароль"
                        variant="subtle"
                        size="md"
                        type="password"
                        {...register('password', {
                            required: 'Пароль обязателен',
                            minLength: {
                                value: 6,
                                message: 'Минимум 6 символов',
                            },
                        })}
                    />
                    <Field.ErrorText>
                        {errors.password?.message}
                    </Field.ErrorText>
                </Field.Root>
            </Flex>

            <Button mt={6} w="full" size="lg" type="submit" loading={isLoading}>
                Зарегистрироваться
            </Button>
        </Flex>
    );
};
