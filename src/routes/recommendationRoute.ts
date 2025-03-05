import { Router, Request, Response } from 'express';
import status from 'http-status';
import { getRecommendationRestaurant } from '../controllers/auth/utils/getRecommendation';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { description } = req.query as {
      description: string;
    };
    // const recommendation = await getRecommendationRestaurant(description);
    const recommendation = {
      name: 'Taizu',
      description:
        'A vibrant Asian fusion restaurant, Taizu offers a creative menu inspired by the street food of Southeast Asia in a stylish, ambiance-filled space.',
      url: 'https://www.taizu.co.il/',
    };

    res.status(status.OK).send(recommendation);
  } catch (error) {
    res.status(status.BAD_REQUEST).send(error);
  }
});

export default router;
