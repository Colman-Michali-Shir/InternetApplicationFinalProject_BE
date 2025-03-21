import request from 'supertest';
import { createExpress } from '../createExpress';
import mongoose from 'mongoose';
import postModel from '../models/postsModel';
import { Express } from 'express';
import userModel, { IUser } from '../models/usersModel';
import status from 'http-status';
import commentModel from '../models/commentsModel';
import Test from 'supertest/lib/test';
import TestAgent from 'supertest/lib/agent';

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

let commentId = '';
let postId = '';

beforeAll(async () => {
  console.log('before all comments tests');
  app = await createExpress();
  await postModel.deleteMany();
  await userModel.deleteMany();
  await commentModel.deleteMany();

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

describe('Comments Tests', () => {
  test('Create post and comment', async () => {
    const responseNewComment = await requestWithAuth.post('/comments').send({
      content: 'This is a comment',
      postId,
    });

    expect(responseNewComment.statusCode).toBe(status.CREATED);
    expect(responseNewComment.body).toMatchObject({
      content: 'This is a comment',
      postId,
    });

    commentId = responseNewComment.body._id;
  });

  test('Create a comment for a non-existent post', async () => {
    const response = await requestWithAuth.post('/comments').send({
      content: 'This is a comment',
      postId: '222222222222222222222222',
    });
    expect(response.statusCode).toBe(status.NOT_FOUND);
    expect(response.text).toBe('Post not found');
  });

  test('Get all comments', async () => {
    const response = await requestWithAuth.get('/comments');
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.length).toBe(1);
  });

  test('Get comments by userId', async () => {
    const response = await requestWithAuth.get(
      `/comments?userId=${testUser._id}`
    );
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.length).toBe(1);
  });

  test('Get comments by postId', async () => {
    const response = await requestWithAuth.get(`/comments?postId=${postId}`);
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.length).toBe(1);
  });

  test('Update a comment', async () => {
    const response = await requestWithAuth.put(`/comments/${commentId}`).send({
      content: 'Updated comment',
    });
    expect(response.statusCode).toBe(status.OK);
    expect(response.body).toMatchObject({
      content: 'Updated comment',
      postId,
      _id: commentId,
    });
  });

  test('Delete comment', async () => {
    const response = await requestWithAuth.delete(`/comments/${commentId}`);
    expect(response.statusCode).toBe(status.OK);

    const responseCheckIfDelted = await requestWithAuth.get(
      `/comments/${commentId}`
    );
    expect(responseCheckIfDelted.statusCode).toBe(status.NOT_FOUND);
    expect(responseCheckIfDelted.text).toBe('Item not found');
  });
});
