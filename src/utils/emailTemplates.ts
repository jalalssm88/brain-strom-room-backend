export const verificationEmailTemplate = (verifyUrl: string): { subject: string; text: string; html: string } => ({
  subject: 'Verify your Brain Strom Room email',
  text: `Welcome to Brain Strom Room!\n\nPlease verify your email by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create an account, you can ignore this email.`,
  html: `
    <p>Welcome to <strong>Brain Strom Room</strong>!</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}">Verify email address</a></p>
    <p>Or copy this URL into your browser:<br>${verifyUrl}</p>
    <p>This link expires in 24 hours.</p>
    <p>If you did not create an account, you can ignore this email.</p>
  `,
});

export const passwordResetEmailTemplate = (resetUrl: string): { subject: string; text: string; html: string } => ({
  subject: 'Reset your Brain Strom Room password',
  text: `You requested a password reset.\n\nReset your password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request this, you can ignore this email.`,
  html: `
    <p>You requested a password reset for <strong>Brain Strom Room</strong>.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>Or copy this URL into your browser:<br>${resetUrl}</p>
    <p>This link expires in 1 hour.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `,
});
