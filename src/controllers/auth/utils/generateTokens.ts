import jwt from 'jsonwebtoken';
import ms from 'ms';
import { ITokens } from '../../../types/ITokens';
import { ServerException } from '../../../exceptions/ServerException';

export const generateTokens = (userId: string): ITokens | null => {
  try {
    if (!process.env.TOKEN_SECRET) {
      return null;
    }
    const random = Math.random().toString();
    const accessToken = jwt.sign(
      {
        _id: userId,
        random,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES },
    );

    const refreshToken = jwt.sign(
      {
        _id: userId,
        random,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
    );
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ServerException();
  }
};
