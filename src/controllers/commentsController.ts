import status from 'http-status';
import { Request, Response } from 'express';
import BaseController from './baseController';
import commentsModel, { IComments } from '../models/commentsModel';
import postModel from '../models/postsModel';

class CommentsController extends BaseController<IComments> {
  constructor() {
    super(commentsModel);
  }

  async getAll(req: Request, res: Response) {
    try {
      const postId = req.query.postId;

      if (postId) {
        const post = await postModel.findById(postId);
        if (!post) {
          res.status(status.NOT_FOUND).send('Post not found');
          return;
        }
      }
      super.getAll(req, res);
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
