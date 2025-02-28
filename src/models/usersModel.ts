import { Schema, model } from 'mongoose';

export interface IUser {
  _id?: string;
  refreshToken?: string[];
  email: string;
  username: string;
  password: string;
  profileImage?: string;
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
  profileImage: {
    type: String,
  },
});

const userModel = model<IUser>('Users', userSchema);

export default userModel;
