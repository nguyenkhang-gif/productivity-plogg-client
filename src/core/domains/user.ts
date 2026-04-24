export type Gender = 'male' | 'female' | 'other';
export type MembershipType = 'basic' | 'advance' | 'premium';
export type UserRole = 'user' | 'admin' | 'moderator';

export interface IUser {
  id?: string;
  fullName: string;
  username: string;
  email: string;
  password?: string;
  gender: Gender;
  profilePic?: string;
  membership: MembershipType;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  constructor(private readonly data: IUser) {}

  get info(): IUser {
    return this.data;
  }

  public canManageContent(): boolean {
    return ['admin', 'moderator'].includes(this.data.role);
  }

  public isPremium(): boolean {
    return this.data.membership === 'premium';
  }

  public toSafeObject(): Omit<IUser, 'password'> {
    const { password, ...safeUser } = this.data;
    return safeUser;
  }
}

