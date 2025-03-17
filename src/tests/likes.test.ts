import request from 'supertest';
import { createExpress } from '../createExpress';
import mongoose from 'mongoose';
import postModel from '../models/postsModel';
import { Express } from 'express';
import userModel, { IUser } from '../models/usersModel';
import status from 'http-status';
import Test from 'supertest/lib/test';
import TestAgent from 'supertest/lib/agent';
import likeModel from '../models/likesModel';

let app: Express;
let requestWithAuth: TestAgent<Test>;

type User = IUser & {
  accessToken?: string;
  refreshToken?: string;
};

const testUser: User = {
  email: 'test@user.com',
  username: 'shir',
  password: 'testpassword',
};

let postId = '';

beforeAll(async () => {
  console.log('before all comments tests');
  app = await createExpress();
  await postModel.deleteMany();
  await userModel.deleteMany();
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

  const responseNewPost = await requestWithAuth.post('/posts').send({
    title: 'New Post 1',
    content: 'New Content 1',
    postedBy: testUser._id,
    rating: 3,
  });
  postId = responseNewPost.body._id;
});

afterAll((done) => {
  console.log('after all comments tests');
  mongoose.connection.close();
  done();
});

describe('Likes Tests', () => {
  test('Create a like', async () => {
    const response = await requestWithAuth.post('/likes').send({
      postId,
    });
    expect(response.statusCode).toBe(status.CREATED);
    expect(response.body).toMatchObject({
      postId,
      userId: testUser._id,
    });
  });

  test('remove a like', async () => {
    const response = await requestWithAuth.delete(`/likes/${postId}`);
    expect(response.statusCode).toBe(status.OK);
    expect(response.body).toMatchObject({
      postId,
      userId: testUser._id,
    });
  });

  test('Create like with non exsiting post', async () => {
    const badPostId = '67d72ba0b01f9fd77d8f4212';
    const response = await requestWithAuth.delete(`/likes/${badPostId}`);
    expect(response.statusCode).toBe(status.NOT_FOUND);
  });

  test('Delete like with non exsiting post', async () => {
    const badPostId = '67d72ba0b01f9fd77d8f4212';
    const response = await requestWithAuth.delete(`/likes/${badPostId}`);
    expect(response.statusCode).toBe(status.NOT_FOUND);
  });
});
