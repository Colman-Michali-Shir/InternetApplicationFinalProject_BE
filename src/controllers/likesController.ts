import status from 'http-status';
import { Request, Response } from 'express';
import likeModal, { ILike } from '../models/likesModal';
import BaseController from './baseController';
import commentModel from '../models/commentsModel';

class LikesController extends BaseController<ILike> {
  constructor() {
    super(likeModal);
  }
}

export default new LikesController();
