import { Router } from 'express';
import usersController from '../controllers/usersController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users API
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
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The User email
 *         username:
 *           type: string
 *           description: The User username
 *         password:
 *           type: string
 *           description: The User password
 *         refreshToken:
 *           type: array
 *           description: The User refresh tokens
 *       example:
 *         email: 'user@gmail.com'
 *         username: 'user'
 *         password: '$2b$10$IeHzC7B4xTyEmUQRJ/BXfuo6JmaPqlo/KiT2E78gRD1CTKVzNReLe'
 *         refreshToken: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...']
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns the list of all the users or filtered users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: username
 *        schema:
 *          type: string
 *        required: false
 *        description: The username to filter by
 *      - in: query
 *        name: email
 *        schema:
 *          type: string
 *        required: false
 *        description: The email to filter by
 *     responses:
 *       '200':
 *         description: A list of the users or filtered users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '500':
 *         description: Server error
 */

router.get('/', usersController.getAll.bind(usersController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns single user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID of the user
 *     responses:
 *       '200':
 *         description: A user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.get('/:id', usersController.getById.bind(usersController));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *                email:
 *                  type: string
 *                  description: The User email
 *                username:
 *                  type: string
 *                  description: The User username
 *                password:
 *                  type: string
 *                  description: The User password
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '500':
 *         description: Server error
 */
router.post('/', usersController.create.bind(usersController));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a single user by its ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.delete('/:id', usersController.deleteItem.bind(usersController));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Update a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The new username of the user
 *               email:
 *                 type: string
 *                 description: The new email of the user
 *               password:
 *                 type: string
 *                 description: The new password of the user
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */

router.put('/:id', usersController.updateItem.bind(usersController));

export default router;
