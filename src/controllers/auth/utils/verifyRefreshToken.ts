import jwt, { JwtPayload } from 'jsonwebtoken';
import { Document } from 'mongoose';
import userModel, { IUser } from '../../../models/usersModel';

type IUserDocument = Document<unknown, {}, IUser> &
  IUser &
  Required<{ _id: string }> & { __v: number };

export const verifyRefreshToken = async (
  refreshToken: string | undefined,
): Promise<IUserDocument> => {
  if (!refreshToken) {
    throw new Error('Refresh token is missing');
  }

  if (!process.env.TOKEN_SECRET) {
    throw new Error('Token secret is not configured');
  }

  try {
    const payload: JwtPayload = jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET,
    ) as JwtPayload;

    const userId = payload._id;
    if (!userId) {
      throw new Error('Invalid refresh token');
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
      user.refreshToken = [];
      await user.save();
      throw new Error('Refresh token does not match');
    }

    // remove the used refresh token
    user.refreshToken = user.refreshToken.filter(
      (token) => token !== refreshToken,
    );
    await user.save();
    return user;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Invalid refresh token',
    );
  }
};
