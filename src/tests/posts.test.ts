import request from 'supertest';
import { createExpress } from '../createExpress';
import mongoose from 'mongoose';
import postModel from '../models/postsModel';
import { Express } from 'express';
import userModel, { IUser } from '../models/usersModel';
import status from 'http-status';
import Test from 'supertest/lib/test';
import TestAgent from 'supertest/lib/agent';
import commentModel from '../models/commentsModel';
import likeModel from '../models/likesModel';
import jwt from 'jsonwebtoken';

let app: Express;
let requestWithAuth: TestAgent<Test>;

type User = IUser & {
  accessToken?: string;
  refreshToken?: string;
};

const testUser: User = {
  username: 'shir',
  password: 'testpassword',
};

beforeAll(async () => {
  console.log('before all posts tests');
  app = await createExpress();
  await postModel.deleteMany();
  await userModel.deleteMany();
  await commentModel.deleteMany();
  await likeModel.deleteMany();

  await request(app).post('/auth/register').send(testUser);
  const responseLogin = await request(app).post('/auth/login').send(testUser);
  testUser.accessToken = responseLogin.body.accessToken;
  testUser._id = responseLogin.body.user._id;
  expect(testUser.accessToken).toBeDefined();
  const defaultHeaders = {
    authorization: `JWT ${testUser.accessToken}`,
  };
  // creates a persistent agent that maintains cookies and headers across multiple requests
  requestWithAuth = request.agent(app).set(defaultHeaders);
});

afterAll((done) => {
  console.log('after all posts tests');
  mongoose.connection.close();
  done();
});

let postId = '';
describe('Posts Tests', () => {
  test('Get all posts', async () => {
    const response = await requestWithAuth.get('/posts');

    expect(response.statusCode).toBe(status.OK);
    expect(response.body.posts.length).toBe(0);
  });

  test('Add new post', async () => {
    const response = await requestWithAuth.post('/posts').send({
      title: 'New Post 1',
      content: 'New Content 1',
      postedBy: testUser._id,
      rating: 3,
    });

    expect(response.statusCode).toBe(status.CREATED);
    expect(response.body).toMatchObject({
      title: 'New Post 1',
      content: 'New Content 1',
      rating: 3,
    });
    postId = response.body._id;
  });

  test('Get post by id', async () => {
    const response = await requestWithAuth.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(status.OK);
    expect(response.body).toMatchObject({
      content: 'New Content 1',
      title: 'New Post 1',
    });
  });

  test('Get posts by userID', async () => {
    const response = await requestWithAuth.get(
      `/posts?postedBy=${testUser._id}`,
    );
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.posts.length).toBe(1);
    expect(response.body.posts[0]).toMatchObject({
      content: 'New Content 1',
      title: 'New Post 1',
    });
  });

  test('Delete Post', async () => {
    const response = await requestWithAuth.delete(`/posts/${postId}`);

    expect(response.statusCode).toBe(status.OK);
  });

  test('Create Post fail', async () => {
    const response = await requestWithAuth.post('/posts').send({
      content: 'Only content',
    });
    expect(response.statusCode).toBe(status.BAD_REQUEST);
  });

  test('Update a post', async () => {
    const responseNewPost = await requestWithAuth.post('/posts').send({
      title: 'New Post to update',
      content: 'New Content 1',
      postedBy: testUser._id,
      rating: 3,
    });
    expect(responseNewPost.statusCode).toBe(status.CREATED);
    const postId = responseNewPost.body._id;
    const response = await requestWithAuth.put(`/posts/${postId}`).send({
      title: 'Updated titleeeeeeee',
      content: 'Updated content',
    });
    expect(response.statusCode).toBe(status.OK);
    expect(response.body).toMatchObject({
      title: 'Updated titleeeeeeee',
      content: 'Updated content',
    });
  });

  test('Get all posts - fake access token', async () => {
    const random = Math.random().toString();

    const validTokenForUnexistsUser = jwt.sign(
      { _id: '222222222222222222222222', random },
      process.env.TOKEN_SECRET as string,
      {
        expiresIn: '1h',
      },
    );
    const defaultHeaders = {
      authorization: `JWT ${validTokenForUnexistsUser}`,
    };

    const response = await request(app).get('/posts').set(defaultHeaders);

    expect(response.statusCode).toBe(status.NOT_FOUND);
    expect(response.text).toBe('User not found');
  });
});
