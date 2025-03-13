import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import cors from 'cors';
import postsRoute from './routes/postsRoute';
import commentsRoute from './routes/commentsRoute';
import usersRoute from './routes/usersRoute';
import authRoute from './routes/authRoute';
import filesRoute from './routes/filesRoute';
import likesRoute from './routes/likesRoute';
import { connectDatabase } from './config/connectToDatabase';
import { createStorageDirectory } from './config/createStorageDirectory';
import { authMiddleware } from './middlewares/authMiddleware';
import recommendationRoute from './routes/recommendationRoute';

export const createExpress = async () => {
  const app = express();
  createStorageDirectory();
  await connectDatabase();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true, // Allow cookies, authorization headers, and other credentials
      allowedHeaders: ['Authorization', 'Content-Type'],
    })
  );

  app.use('/auth', authRoute);
  app.use('/posts', authMiddleware, postsRoute);
  app.use('/comments', authMiddleware, commentsRoute);
  app.use('/users', authMiddleware, usersRoute);
  app.use('/recommendation', authMiddleware, recommendationRoute);
  app.use('/likes', authMiddleware, likesRoute);
  app.use('/file', filesRoute);

  app.use('/storage', express.static('storage'));

  const port = process.env.PORT;

  if (process.env.NODE_ENV === 'development') {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Web Dev 2025 REST API - Assignment 2',
          version: '1.0.0',
          description: 'REST server including authentication using JWT',
        },
        servers: [{ url: `http://localhost:${port}` }],
      },
      apis: ['./src/routes/*.ts'],
    };
    const specs = swaggerJsDoc(options);
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
  }

  return app;
};
