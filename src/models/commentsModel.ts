import mongoose, { Schema, model } from 'mongoose';
import postModel from './postsModel';

export interface IComment {
  content: string;
  userId: mongoose.Schema.Types.ObjectId;
  postId: {
    type: mongoose.Schema.Types.ObjectId;
    ref: string;
    validate: {
      validator: (value: string) => Promise<{
        _id: string;
      } | null>;
      message: string;
    };
  };
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Posts',
      required: true,
      validate: {
        validator: async function (value: string) {
          return await postModel.exists({ _id: value });
        },
        message: 'The referenced postId does not exist.',
      },
    },
  },

  { timestamps: true },
);

const commentModel = model<IComment>('comments', commentSchema);

export default commentModel;
