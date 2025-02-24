import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import status from 'http-status';

import userModel from '../../../models/usersModel';
import { generateAndSaveUser } from './generateTokenAndSave';

const client = new OAuth2Client();

export const googleSignin = async (req: Request, res: Response) => {
  const credential = req.body?.credential;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    let user = await userModel.findOne({ email });
    console.log('111111111111111111111', email);
    if (user === null) {
      user = await userModel.create({
        email: email,
        imgUrl: payload?.picture,
        password: 'google-signin',
      });
    }
    const tokens = await generateAndSaveUser(user);
    return res.status(status.OK).send(tokens);
  } catch (err) {
    return res
      .status(status.BAD_REQUEST)
      .send('error missing email or password');
  }
};
