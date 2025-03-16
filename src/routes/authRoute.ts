import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
} from '../controllers/auth/authController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
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
 *   schemas:
 *     LoginUser:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The user username
 *         password:
 *           type: string
 *           description: The user password
 *         refreshToken:
 *           type: string
 *           description: The user refresh token
 *       example:
 *         username: 'user'
 *         password: '$2b$10$IeHzC7B4xTyEmUQRJ/BXfuo6JmaPqlo/KiT2E78gRD1CTKVzNReLe'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: register a new user
 *     tags:
 *        - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The new user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: |
 *           Bad Request - The registration failed due to one of the following reasons:
 *           - Username already exists
 *           - Path `username` is required
 *           - Path `password` is required
 */

router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6I...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6I...
 *                 _id:
 *                   type: string
 *                   example: 678013dc6808b51887ea09f3
 *       400:
 *         description: |
 *           Bad Request - The login failed due to one of the following reasons:
 *           - Wrong username or password
 *           - Username or password are missing
 *           - Token secret is not configured
 *           - An unexpected error occurred
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and invalidate the refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6I...
 *     responses:
 *       200:
 *         description: Successful logout
 *       400:
 *         description: |
 *           Bad Request - The logout failed due to one of the following reasons:
 *           - Refresh token is missing
 *           - Token secret is not configured
 *           - User not found
 *           - Invalid refresh token
 *           - Refresh token does not match
 *           - An unexpected error occurred
 *       500:
 *         description: Server error
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh tokens
 *     description: Refresh access and refresh tokens using the provided refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6I...
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6I...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6I...
 *       400:
 *         description: |
 *           Bad Request - The logout failed due to one of the following reasons:
 *           - Refresh token is missing
 *           - Token secret is not configured
 *           - User not found
 *           - Invalid refresh token
 *           - Refresh token does not match
 *           - An unexpected error occurred
 *       500:
 *         description: Server error
 */
router.post('/refresh', refresh);

export default router;
