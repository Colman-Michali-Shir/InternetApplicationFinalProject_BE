import status from 'http-status';
import { Request, Response } from 'express';
import postModel, { IPost, IPostClient } from '../models/postsModel';
import BaseController from './baseController';
import commentModel from '../models/commentsModel';
import { AuthRequest } from '../middlewares/authMiddleware';
import likeModel from '../models/likesModel';

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const comments = await commentModel.find({ postId });
      comments.forEach(async (comment) => {
        await commentModel.findByIdAndDelete({ _id: comment._id.toString() });
      });
      const likes = await likeModel.find({ postId });
      likes.forEach(async (like) => {
        await likeModel.findByIdAndDelete({ _id: like._id.toString() });
      });

      super.deleteItem(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const currentUserId = req.currentUser?._id;

    try {
      const item = await postModel
        .findById(id)
        .populate('postedBy', ['username', 'profileImage']);

      if (!item) {
        res.status(status.NOT_FOUND).send('Post not found');
        return;
      }

      const userLike = await likeModel
        .findOne({
          userId: currentUserId,
          postId: { $in: id },
        })
        .select('postId');

      const post: IPostClient = {
        ...item.toObject(),
        likedByCurrentUser: !!userLike,
      };

      res.status(status.OK).send(post);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const { lastPostId, postedBy } = req.query as {
      lastPostId?: string;
      postedBy?: string;
    };
    const currentUserId = req.currentUser?._id;

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

      const postIds = posts.map((post) => post._id);

      const userLikes = await likeModel
        .find({
          userId: currentUserId,
          postId: { $in: postIds },
        })
        .select('postId');

      const likedPostIds = new Set(
        userLikes.map((like) => like.postId.toString())
      );

      const postsWithLikes: IPostClient[] = posts.map((post) => ({
        ...post.toObject(),
        likedByCurrentUser: likedPostIds.has(post._id.toString()),
      }));

      res.status(status.OK).json({ posts: postsWithLikes });
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }
}

export default new PostsController();
