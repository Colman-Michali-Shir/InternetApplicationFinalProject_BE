import status from 'http-status';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import BaseController from './baseController';
import userModel, { IUser } from '../models/usersModel';
import { register } from './auth/authController';

class UsersController extends BaseController<IUser> {
  constructor() {
    super(userModel);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      await register(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      if (body?.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
        body.password = hashedPassword;
      }
      await super.updateItem(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }
}

export default new UsersController();
