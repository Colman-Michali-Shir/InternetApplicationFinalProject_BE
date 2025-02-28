import { IUserDocument } from '../../../types/IUserDocument';
import { generateTokens } from './generateTokens';
import { ServerException } from '../../../exceptions/ServerException';

export const generateAndSaveUser = async (user: IUserDocument) => {
  try {
    const tokens = generateTokens(user._id);

    if (!tokens) {
      throw new Error('Token secret is not configured');
    }
    const { accessToken, refreshToken } = tokens;

    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();

    return { accessToken, refreshToken, user };
  } catch (error) {
    if (!error) {
      throw new ServerException();
    }
    throw error;
  }
};
