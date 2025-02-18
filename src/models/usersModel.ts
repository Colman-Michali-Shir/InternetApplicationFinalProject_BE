import { Schema, model } from 'mongoose';

export interface IUser {
  email: string;
  username: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  },
});

const userModel = model<IUser>('Users', userSchema);

export default userModel;
