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
import path from 'path';

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

  const allowedOrigins = [
    'https://10.10.246.20',
    'https://node20.cs.colman.ac.il',
    'https://193.106.55.180',
    'http://localhost:5173',
  ];

  app.use(express.static(path.resolve('front')));

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      maxAge: 600,
    }),
  );

  app.use('/auth', authRoute);
  app.use('/posts', authMiddleware, postsRoute);
  app.use('/comments', authMiddleware, commentsRoute);
  app.use('/users', authMiddleware, usersRoute);
  app.use('/recommendation', authMiddleware, recommendationRoute);
  app.use('/likes', authMiddleware, likesRoute);
  app.use('/file', filesRoute);

  app.use('/storage', express.static('storage'));

  // Catch-all route to serve index.html for React routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('front', 'index.html'));
  });

  const port = process.env.PORT;

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'FoodiFinder API',
        version: '1.0.0',
        description: 'REST server including authentication using JWT',
      },
      servers: [
        { url: `http://localhost:${port}` },
        { url: 'http://10.10.246.20' },
        { url: 'https://node20.cs.colman.ac.il' },
      ],
    },
    apis: ['./src/routes/*.ts'],
  };
  const specs = swaggerJsDoc(options);
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

  return app;
};
