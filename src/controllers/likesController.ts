import status from 'http-status';
import { Request, Response } from 'express';
import likeModel, { ILike } from '../models/likesModel';
import BaseController from './baseController';
import postModel from '../models/postsModel';

class LikesController extends BaseController<ILike> {
  constructor() {
    super(likeModel);
  }

  async create(req: Request, res: Response) {
    try {
      const postId = req.body.postId;

      const post = await postModel.findByIdAndUpdate(postId, {
        $inc: { likesCount: 1 },
      });

      if (!post) {
        res.status(status.NOT_FOUND).send('Post not found');
        return;
      }

      super.create(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const userId = req.body.payload.userId;
      const like = await likeModel.findOne({ postId, userId });

      if (!like) {
        res.status(status.NOT_FOUND).send('Like not found');
        return;
      }

      req.params.id = like._id.toString();

      await postModel.findByIdAndUpdate(like.postId, {
        $inc: { likesCount: -1 },
      });

      super.deleteItem(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }
}

export default new LikesController();
