import status from 'http-status';
import { Request, Response } from 'express';
import likeModal, { ILike } from '../models/likesModal';
import BaseController from './baseController';
import postModel from '../models/postsModel';

class LikesController extends BaseController<ILike> {
  constructor() {
    super(likeModal);
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
          $inc: { likesCount: 1 },
        });
      }
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }
}

export default new LikesController();
