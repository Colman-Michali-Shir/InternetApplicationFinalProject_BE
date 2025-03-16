import { Router } from 'express';
import postsController from '../controllers/postsController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The posts API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - content
 *         - title
 *         - rating
 *         - image
 *       properties:
 *         content:
 *           type: string
 *           description: The Post content
 *         postedBy:
 *           type: object
 *           properties:
 *              id:
 *               type: string
 *               description: The user id that added the post
 *              username:
 *               type: string
 *               description: The user name that added the post
 *              profileImage:
 *               type: string
 *               description: The user profile image that added the post
 *         title:
 *           type: string
 *           description: The Post title
 *         rating:
 *           type: number
 *           description: The Post rating
 *         image:
 *           type: string
 *           description: The Post image
 *         likesCount:
 *           type: number
 *           description: The Post likes count
 *         commentsCount:
 *           type: number
 *           description: The Post comments count
 *       example:
 *         content: 'This is a Post'
 *         postedBy:
 *          id: '60f7b3b4b3f3b40015f1f3b4'
 *          username: 'user'
 *          profileImage: 'https://server.com/image.jpg'
 *         title: 'Users post'
 *         rating: 5
 *         image: 'https://server.com/image.jpg'
 *         likesCount: 0
 *         commentsCount: 0
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts or filter by userId
 *     description: Returns the list of all the Posts or filterd by userId
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: postedBy
 *        schema:
 *          type: string
 *        required: false
 *        description: The postedBy ID to filter by
 *     responses:
 *       '200':
 *         description: A list of the posts or filterd
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       '500':
 *         description: Server error
 */
router.get('/', postsController.getAll.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     description: Returns single post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID of the post
 *     responses:
 *       '200':
 *         description: A post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Server error
 */
router.get('/:id', postsController.getById.bind(postsController));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - image
 *               - rating
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *               image:
 *                  type: string
 *                  format: binary
 *                  description: Image of the post
 *               rating:
 *                  type: number
 *                  description: Rating of the post
 *               content:
 *                 type: string
 *                 description: The content of the post
 *     responses:
 *       '201':
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '500':
 *         description: Server error
 */
router.post('/', postsController.create.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: Delete a single post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       '200':
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Server error
 */
router.delete('/:id', postsController.deleteItem.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the post
 *               title:
 *                 type: string
 *                 description: The new title of the post
 *               rating:
 *                 type: number
 *                 description: The new rating of the post
 *               image:
 *                 type: string
 *                 description: The new image of the post
 *     responses:
 *       '200':
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Server error
 */

router.put('/:id', postsController.updateItem.bind(postsController));

export default router;
