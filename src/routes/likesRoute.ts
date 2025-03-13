import { Router } from 'express';
import likesController from '../controllers/likesController';

const router = Router();

/**
 * @swagger
 * /likes:
 *   post:
 *     summary: Add Like on a post
 *     description: Create a like
 *     tags:
 *       - likes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: postId of the post to like
 *               userId:
 *                 type: string
 *                 description: The user that likes
 *             required:
 *               - postId
 *               - userId
 *     responses:
 *       '201':
 *         description: Like created successfully
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Like'
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Server error
 */
router.post('/', likesController.create.bind(likesController));

export default router;
