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
  subscription?: {
    planName: string;
    status: string;
    workspaceLimit: number | null;
  } | null;
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

export interface VerifyEmailDto {
  token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface UpdateProfileDto {
  fullName: string;
  /** New public path, `null` to clear, `undefined` to leave unchanged */
  avatar?: string | null;
}
