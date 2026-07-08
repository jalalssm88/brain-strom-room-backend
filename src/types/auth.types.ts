export interface SignupDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: number;
  fullName: string;
  email: string;
  avatar: string | null;
  provider: string;
  emailVerified: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: AuthUserResponse;
  tokens: AuthTokens;
}

export interface JwtAccessPayload {
  userId: number;
  email: string;
}

export interface JwtRefreshPayload {
  userId: number;
  tokenId: string;
}
