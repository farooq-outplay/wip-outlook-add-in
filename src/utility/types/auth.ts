export type AuthSession = {
  userId: number;
  userName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  accountLocation: string;
  accountKey: string;
};
