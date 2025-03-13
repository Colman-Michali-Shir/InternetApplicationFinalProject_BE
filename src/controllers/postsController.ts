import status from 'http-status';
import { Request, Response } from 'express';
import postModel, { IPost } from '../models/postsModel';
import BaseController from './baseController';
import commentModel from '../models/commentsModel';
import { AuthRequest } from '../middlewares/authMiddleware';
import likeModel from '../models/likesModal';

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

      super.deleteItem(req, res);
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const { lastPostId, postedBy } = req.query as {
      lastPostId?: string;
      postedBy?: string;
    };
    const currentUserId = req.currentUser?.id;

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

      const postsWithLikes = posts.map((post) => ({
        ...post.toObject(),
        liked: likedPostIds.has(post._id.toString()),
      }));

      res.status(status.OK).json({ posts: postsWithLikes });
    } catch (error) {
      res.status(status.BAD_REQUEST).send(error);
    }
  }
}

export default new PostsController();
