import { Schema, model } from 'mongoose';
import postModel from './postsModel';

export interface IComments {
  content: string;
  sender: string;
  postId: {
    type: string;
    ref: string;
    validate: {
      validator: (value: string) => Promise<{
        _id: string;
      } | null>;
      message: string;
    };
  };
}

const commentSchema = new Schema<IComments>(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      ref: 'posts',
      required: true,
      validate: {
        validator: async function (value: string) {
          return await postModel.exists({ _id: value });
        },
        message: 'The referenced postId does not exist.',
      },
    },
  },

  { timestamps: true }
);

const commentModel = model<IComments>('comments', commentSchema);

export default commentModel;
