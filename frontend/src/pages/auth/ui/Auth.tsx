import { useState } from 'react';
import { Center, Flex, Image, Text } from '@chakra-ui/react';
import logo from 'assets/Logo.svg';

import { Login } from './Login';
import { Register } from './Register';

type Mode = 'register' | 'login';

const Auth = () => {
    const [mode, setMode] = useState<Mode>('login');

    const toggleMode = () => {
        mode === 'register' ? setMode('login') : setMode('register');
    };

    return (
        <Center w="full" h="full">
            <Flex
                w={480}
                backgroundColor="bg.panel"
                padding={10}
                direction="column"
                alignItems="center"
                gap={10}
                borderRadius="lg"
            >
                <Image src={logo} h="10" />
                {mode === 'login' ? <Login /> : <Register />}
                <Flex gap={1} w="full" justifyContent="space-between">
                    <Text>Впервые у нас?</Text>
                    <Text
                        color="teal.700"
                        onClick={toggleMode}
                        cursor="pointer"
                    >
                        {mode === 'login' ? 'Регистрация' : 'Войти'}
                    </Text>
                </Flex>
            </Flex>
        </Center>
    );
};

export default Auth;
