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

/**
 * @swagger
 * /likes/{id}:
 *   delete:
 *     summary: Remove a like
 *     description: Remove a like from post of current user
 *     tags:
 *       - likes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: PostID of the like to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Like deleted successfully
 *       '404':
 *         description: Like not found
 *       '500':
 *         description: Server error
 */
router.delete('/:id', likesController.deleteItem.bind(likesController)); // DELETE /likes/:id

export default router;
