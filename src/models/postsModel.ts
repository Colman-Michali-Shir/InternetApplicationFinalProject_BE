import { Schema, model } from 'mongoose';

export interface IPost {
  title: string;
  sender: string;
  content: string;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  content: String,
});

const postModel = model<IPost>('posts', postSchema);

export default postModel;
