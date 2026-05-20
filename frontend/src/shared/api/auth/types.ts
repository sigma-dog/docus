export type RegisterBody = {
    username: string;
    email: string;
    password: string;
};

export type LoginBody = Omit<RegisterBody, 'username'>;
