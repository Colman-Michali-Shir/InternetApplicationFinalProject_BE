import status from 'http-status';
import { Request, Response } from 'express';
import postModel, { IPost } from '../models/postsModel';
import BaseController from './baseController';
import commentModel from '../models/commentsModel';

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async createItem(req: Request, res: Response): Promise<void> {
    try {
      req.body.username = req.body.postedBy.username;

      super.create(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const comments = await commentModel.find({ postId });
      comments.forEach(async (comment) => {
        await commentModel.findByIdAndDelete({ _id: comment._id.toString() });
      });

      super.deleteItem(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const { lastPostId, postedBy } = req.query as {
      lastPostId?: string;
      postedBy?: string;
    };

    const limit = 4;

    try {
      let query: { postedBy?: string; _id?: { $gt: string } } = {};
      if (postedBy) {
        query.postedBy = postedBy;
      }

      if (lastPostId) {
        query._id = { $gt: lastPostId };
      }

      const posts = await postModel
        .find(query)
        .sort({ _id: 1 })
        .limit(limit)
        .populate('postedBy', ['username', 'profileImage']);

      res.status(status.OK).json({ posts });
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }
}

export default new PostsController();
