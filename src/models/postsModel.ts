import mongoose, { Schema, model } from 'mongoose';

export interface IPost {
  title: string;
  sender: string;
  postedBy: mongoose.Schema.Types.ObjectId;
  content: string;
  image?: string;
  rating: number;
  commentsCount: number;
  likesCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  postedBy: {
    type: String,
    ref: 'Users',
    required: true,
  },
  content: String,
  image: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const postModel = model<IPost>('posts', postSchema);

export default postModel;
