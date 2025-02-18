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

beforeAll(async () => {
  console.log('before all posts tests');
  app = await createExpress();
  await postModel.deleteMany();
  await userModel.deleteMany();
  await commentModel.deleteMany();

  await request(app).post('/auth/register').send(testUser);
  const responseLogin = await request(app).post('/auth/login').send(testUser);
  testUser.accessToken = responseLogin.body.accessToken;
  testUser._id = responseLogin.body._id;
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
    expect(response.body.length).toBe(0);
  });

  test('Create new post and comment', async () => {
    const responseNewPost = await requestWithAuth.post('/posts').send({
      title: 'New Post 1',
      content: 'New Content 1',
      sender: testUser._id,
    });
    expect(responseNewPost.statusCode).toBe(status.CREATED);
    expect(responseNewPost.body).toMatchObject({
      title: 'New Post 1',
      content: 'New Content 1',
      sender: testUser._id,
    });

    postId = responseNewPost.body._id;

    const responseCreateComment = await requestWithAuth.post('/comments').send({
      content: 'This is a comment',
      sender: testUser._id,
      postId,
    });

    expect(responseCreateComment.statusCode).toBe(status.CREATED);
  });

  test('Create new post - dont send a sender', async () => {
    const response = await requestWithAuth.post('/posts').send({
      title: 'New Post 2',
      content: 'New Content 2',
    });
    expect(response.statusCode).toBe(status.CREATED);
    expect(response.body).toMatchObject({
      title: 'New Post 2',
      content: 'New Content 2',
      sender: testUser._id,
    });
  });

  test('Create new post - sender not exists', async () => {
    const response = await requestWithAuth.post('/posts').send({
      title: 'New post',
      content: 'hi',
      sender: '678156fa8d1a5cce22322222',
    });
    expect(response.statusCode).toBe(status.NOT_FOUND);
    expect(response.text).toBe('User not found');
  });

  test('Failed to create post - access token is valid but user does not exist', async () => {
    const testUser = {
      email: 'test1@user.com',
      username: 'test1',
      password: 'test1',
    };
    await request(app).post('/auth/register').send(testUser);
    const responseLogin = await request(app).post('/auth/login').send(testUser);
    await requestWithAuth.delete(`/users/${responseLogin.body._id}`);

    const responseNewPost = await request(app)
      .post('/posts')
      .set({
        authorization: `JWT ${responseLogin.body.accessToken}`,
      })
      .send({
        title: 'New Post',
        content: 'Importent content',
        sender: 'shir',
      });
    expect(responseNewPost.statusCode).toBe(status.NOT_FOUND);
    expect(responseNewPost.text).toBe('User not found');
  });

  test('Get post by id', async () => {
    const response = await requestWithAuth.get(`/posts/${postId}`);
    expect(response.statusCode).toBe(status.OK);
    expect(response.body).toMatchObject({
      content: 'New Content 1',
      title: 'New Post 1',
      sender: testUser._id,
    });
  });

  test('Get post by sender', async () => {
    const response = await requestWithAuth.get(`/posts?sender=${testUser._id}`);
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toMatchObject({
      content: 'New Content 1',
      title: 'New Post 1',
      sender: testUser._id,
    });
  });

  test('Add new post to same user', async () => {
    const responseNewPost = await requestWithAuth.post('/posts').send({
      title: 'New Post 3',
      content: 'New Content 3',
      sender: testUser._id,
    });
    expect(responseNewPost.statusCode).toBe(status.CREATED);
    const response = await requestWithAuth.get('/posts');
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.length).toBe(3);
  });

  test('Delete Post', async () => {
    const responseCheckComments1 = await requestWithAuth.get(
      `/comments?postId=${postId}`
    );

    expect(responseCheckComments1.body.length).toBe(1);

    const response = await requestWithAuth.delete(`/posts/${postId}`);

    expect(response.statusCode).toBe(status.OK);

    const responseFindDeletedPost = await requestWithAuth.get(
      `/posts/${postId}`
    );

    expect(responseFindDeletedPost.statusCode).toBe(status.NOT_FOUND);

    const responseCheckComments = await requestWithAuth.get(
      `/comments?postId=${postId}`
    );

    expect(responseCheckComments.statusCode).toBe(status.NOT_FOUND);
    expect(responseCheckComments.text).toEqual('Post not found');
  });

  test('Create Post fail', async () => {
    const response = await requestWithAuth.post('/posts').send({
      content: 'Only content',
    });
    expect(response.statusCode).toBe(status.BAD_REQUEST);
  });

  test('Update a post', async () => {
    const responseNewPost = await requestWithAuth.post('/posts').send({
      title: 'New post',
      content: 'hi',
      sender: testUser._id,
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
      sender: testUser._id,
    });
  });
});
