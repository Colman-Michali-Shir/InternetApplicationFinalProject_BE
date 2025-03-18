import { Router, Request, Response } from 'express';
import status from 'http-status';
import { getRecommendationRestaurant } from '../controllers/recommendation/getRecommendation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Recommendation
 *   description: The recommendation API
 */

/**
 * @swagger
 * /recommendation:
 *   get:
 *     summary: Get a restaurant recommendation
 *     description: Retrieves a restaurant recommendation based on the given description.
 *     tags:
 *       - Recommendation
 *     parameters:
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         required: true
 *         description: The description of the restaurant
 *     responses:
 *       '200':
 *         description: A restaurant recommendation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 url:
 *                   type: string
 *             example:
 *               name: Taizu
 *               description: A vibrant Asian fusion restaurant, Taizu offers a creative menu inspired by the street food of Southeast Asia in a stylish, ambiance-filled space.
 *               url: https://www.taizu.co.il/
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Server error
 */

router.get('/', async (req: Request, res: Response) => {
  try {
    const { description } = req.query as {
      description: string;
    };
    const recommendation: {
      name: string;
      description: string;
      url?: string;
    } = await getRecommendationRestaurant(description);

    res.status(status.OK).send(recommendation);
  } catch (error) {
    res.status(status.BAD_REQUEST).send(error);
  }
});

export default router;
