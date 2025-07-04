import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    config.jwtSecret as string, 
    { expiresIn: config.jwtExpiresIn as string } as SignOptions
  );
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwtSecret as string) as { userId: string };
};