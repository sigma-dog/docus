export type RegisterBody = {
    username: string;
    email: string;
    birthDate: string;
    password: string;
};

export type LoginBody = Omit<RegisterBody, 'username' | 'birthDate'>;
