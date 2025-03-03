import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import userModel from '../models/usersModel';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
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

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, payload) => {
    if (err) {
      res.status(status.UNAUTHORIZED).send('Access Denied');
      return;
    }

    const userId = (payload as JwtPayload)._id;
    const user = await userModel.findById(userId);
    if (!user) {
      res.status(status.NOT_FOUND).send('User not found');
      return;
    }

    next();
  });
};
