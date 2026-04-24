import { IUser, User } from "../domains/user";

export interface IUserRepository {
    login(email: string, password: string): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(user: Partial<IUser>): Promise<User>;
    update(id: string, data: Partial<IUser>): Promise<User>;
}