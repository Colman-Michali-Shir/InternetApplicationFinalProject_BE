import status from 'http-status';
import { Request, Response } from 'express';
import BaseController from './baseController';
import commentsModel, { IComment } from '../models/commentsModel';
import postModel from '../models/postsModel';
import commentModel from '../models/commentsModel';

class CommentsController extends BaseController<IComment> {
  constructor() {
    super(commentsModel);
  }

  async getAll(req: Request, res: Response) {
    try {
      const limit = 5;
      const { postId, lastCommentId } = req.query as {
        postId: string;
        lastCommentId: string;
      };

      let query: { postId?: string; _id?: { $gt: string } } = {};

      if (postId) {
        query.postId = postId;
      }

      if (lastCommentId) {
        query._id = { $gt: lastCommentId };
      }

      if (postId) {
        const post = await postModel.findById(postId);

        if (!post) {
          res.status(status.NOT_FOUND).send('Post not found');
          return;
        }

        const comments = await commentModel
          .find(query)
          .sort({ _id: 1 })
          .limit(limit)
          .populate('userId', ['username', 'profileImage'])
          .lean();

        const formattedComments = comments.map(({ userId, ...rest }) => ({
          ...rest,
          user: userId,
        }));
        res.status(status.OK).json(formattedComments);
      } else {
        super.getAll(req, res);
      }
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const postId = req.body.postId;

      if (postId) {
        const post = await postModel.findById(postId);
        if (!post) {
          res.status(status.NOT_FOUND).send('Post not found');
          return;
        }
      }
      await super.create(req, res);
      if (postId) {
        await postModel.findByIdAndUpdate(postId, {
          $inc: { commentsCount: 1 },
        });
      }
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async deleteItem(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const comment = await commentModel.findById(id);

      super.deleteItem(req, res);

      if (comment) {
        await postModel.findByIdAndUpdate(comment.postId, {
          $inc: { commentsCount: -1 },
        });
      }
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }
}

export default new CommentsController();
