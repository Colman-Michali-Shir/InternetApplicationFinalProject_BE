import { Document } from 'mongoose';
import { IUser } from '../models/usersModel';

export type IUserDocument = Document<unknown, {}, IUser> &
  IUser &
  Required<{ _id: string }> & { __v: number };
