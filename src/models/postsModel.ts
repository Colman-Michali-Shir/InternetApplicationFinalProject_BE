import mongoose, { Schema, model } from 'mongoose';

export interface IPost {
  title: string;
  postedBy: mongoose.Schema.Types.ObjectId;
  content: string;
  image?: string;
  rating: number;
  commentsCount: number;
  likesCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPostClient extends IPost {
  likedByCurrentUser: boolean;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
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
  },
  { timestamps: true }
);

const postModel = model<IPost>('posts', postSchema);

export default postModel;
