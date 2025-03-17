import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import userModel, { IUser } from '../models/usersModel';
import mongoose from 'mongoose';

export interface AuthRequest extends Request {
  currentUser?: IUser;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header('authorization');
  const token = authorization?.split(' ')[1];

  if (!token) {
    res.status(status.UNAUTHORIZED).send('Access Denied');
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(status.INTERNAL_SERVER_ERROR).send('Server Error');
    return;
  }
  try {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, payload) => {
      if (err) {
        res.status(status.UNAUTHORIZED).send('Access Denied');
        return;
      }

      req.body.payload = { userId: (payload as JwtPayload)._id };
      const user = await userModel.findById(req.body.payload.userId);
      if (!user) {
        res.status(status.NOT_FOUND).send('User not found');
        return;
      }

      req.currentUser = user;

      next();
    });
  } catch (err) {
    res.status(status.INTERNAL_SERVER_ERROR).send('Server Error');
    return;
  }
};
