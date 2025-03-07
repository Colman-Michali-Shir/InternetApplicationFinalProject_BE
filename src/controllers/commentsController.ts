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
    const limit = 4;

    try {
      const postId = req.query.postId;
      if (postId) {
        const post = await postModel.findById(postId);
        if (!post) {
          res.status(status.NOT_FOUND).send('Post not found');
          return;
        } else {
          const comments = await commentModel
            .find({ postId })
            .sort({ _id: 1 })
            .limit(limit)
            .populate('userId', ['username', 'profileImage'])
            .lean();

          const formattedComments = comments.map(({ userId, ...rest }) => ({
            ...rest,
            user: userId,
          }));
          res.status(status.OK).json(formattedComments);
        }
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
      super.create(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }
}

export default new CommentsController();
