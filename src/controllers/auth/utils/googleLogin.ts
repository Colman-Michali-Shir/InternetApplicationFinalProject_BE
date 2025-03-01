import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

import userModel from '../../../models/usersModel';
import { generateAndSaveUser } from './generateTokenAndSave';
import { ServerException } from '../../../exceptions/ServerException';

const client = new OAuth2Client();

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const credential = req.body?.credential;

    if (!credential) {
      throw new Error('Error missing credential');
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        email,
        profileImage: payload?.picture,
        username: payload?.name,
        password: 'google-signin',
      });
    }

    return await generateAndSaveUser(user);
  } catch (error) {
    if (!error) {
      throw new ServerException();
    }
    throw error;
  }
};
