import { IUser } from "../types/models";

interface ExtendedUser extends IUser {
  fullName?: string;
}

export const addFullNameToUser = (user: any) => {
  if (!user || typeof user !== 'object') {
    return user;
  }

  const enhancedUser: ExtendedUser = { ...user };
  
  if ('firstName' in user && 'lastName' in user) {
    enhancedUser.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  
  return enhancedUser;
};