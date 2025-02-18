import { Request, Response } from 'express';
import status from 'http-status';
import bcrypt from 'bcrypt';
import userModel from '../../models/usersModel';
import { verifyRefreshToken } from './utils/verifyRefreshToken';
import { generateAndSaveUser } from './utils/generateTokenAndSave';
import { ServerException } from '../../exceptions/ServerException';

export const register = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const username = req.body.username;

    const existingEmail = await userModel.findOne({ email });
    const existingUsername = await userModel.findOne({ username });

    if (existingUsername || existingEmail) {
      res.status(status.BAD_REQUEST).send('Username or email already exists');
      return;
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      email,
      username,
      password: hashedPassword,
    });

    res.status(status.OK).send(user);
  } catch (error) {
    res.status(status.BAD_REQUEST).send(error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(status.BAD_REQUEST).send('Wrong username or password');
      return;
    }

    if (!email || !password) {
      res.status(status.BAD_REQUEST).send('Email or password are missing');
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(status.BAD_REQUEST).send('Wrong username or password');
      return;
    }

    if (!process.env.TOKEN_SECRET) {
      res.status(status.BAD_REQUEST).send('Token secret is not configured');
      return;
    }

    const { accessToken, refreshToken, _id } = await generateAndSaveUser(user);
    res.status(status.OK).send({ accessToken, refreshToken, _id });
  } catch (error) {
    if (error instanceof ServerException) {
      res.status(error.status).send({
        error: error.message,
      });
      return;
    }
    res.status(status.BAD_REQUEST).send('An unexpected error occurred');
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    await user.save();
    res.status(status.OK).send({ _id: user.id });
  } catch (error) {
    if (error instanceof Error) {
      res.status(status.BAD_REQUEST).send(error.message);
      return;
    }
    res.status(status.BAD_REQUEST).send('An unexpected error occurred');
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const user = await verifyRefreshToken(req.body.refreshToken);
    if (!user) {
      res.status(status.BAD_REQUEST).send('Invalid refresh token');
      return;
    }

    const { accessToken, refreshToken, _id } = await generateAndSaveUser(user);
    res.status(status.OK).send({ accessToken, refreshToken, _id });
  } catch (error) {
    if (error instanceof ServerException) {
      res.status(error.status).send({
        error: error.message,
      });
      return;
    } else if (error instanceof Error) {
      res.status(status.BAD_REQUEST).send(error.message);
      return;
    }
    res.status(status.BAD_REQUEST).send('An unexpected error occurred');
  }
};
