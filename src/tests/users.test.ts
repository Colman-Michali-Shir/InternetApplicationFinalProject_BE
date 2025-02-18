import request from 'supertest';
import { createExpress } from '../createExpress';
import mongoose from 'mongoose';
import { Express } from 'express';
import userModel, { IUser } from '../models/usersModel';
import status from 'http-status';
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
  username: 'Mich',
  password: 'testpassword',
};

beforeAll(async () => {
  console.log('before all users tests');
  app = await createExpress();
  await userModel.deleteMany();

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
  console.log('after all users tests');
  mongoose.connection.close();
  done();
});

describe('Users Tests', () => {
  test('Get all users', async () => {
    const response = await requestWithAuth.get('/users');
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.length).toBe(1);
  });

  test('Create new user', async () => {
    const testUser2: User = {
      email: 'test2@user.com',
      username: 'Mich2',
      password: 'testpassword2',
    };
    const responseNewUser = await requestWithAuth
      .post('/users')
      .send(testUser2);
    expect(responseNewUser.statusCode).toBe(status.OK);
    expect(responseNewUser.body.email).toBe(testUser2.email);
    expect(responseNewUser.body.username).toBe(testUser2.username);
  });

  test('Get user by id', async () => {
    const response = await requestWithAuth.get(`/users/${testUser._id}`);
    expect(response.statusCode).toBe(status.OK);
    expect(response.body._id).toBe(testUser._id);
  });

  test('Get user by id - not found', async () => {
    const response = await requestWithAuth.get(
      '/users/222222222222222222222222',
    );
    expect(response.statusCode).toBe(status.NOT_FOUND);
  });

  test('Get user by email', async () => {
    const response = await requestWithAuth.get(
      `/users?email=${testUser.email}`,
    );
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(testUser._id);
  });

  test('Get user by email - not found', async () => {
    const response = await requestWithAuth.get(`/users?email=notexist@co.il`);
    expect(response.body.length).toBe(0);
  });

  test('Get user by username', async () => {
    const response = await requestWithAuth.get(
      `/users?username=${testUser.username}`,
    );
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(testUser._id);
  });

  test('Get user by username - not found', async () => {
    const response = await requestWithAuth.get(`/users?username=notexist`);
    expect(response.body.length).toBe(0);
  });

  test('Update user username', async () => {
    const testUser3: User = {
      email: 'test3@user.com',
      username: 'Mich3',
      password: 'testpassword3',
    };
    const responseNewUser = await requestWithAuth
      .post('/users')
      .send(testUser3);
    expect(responseNewUser.statusCode).toBe(status.OK);

    const response = await requestWithAuth
      .put(`/users/${responseNewUser.body._id}`)
      .send({ username: 'updateUsername' });

    expect(response.statusCode).toBe(status.OK);
    expect(response.body.username).toBe('updateUsername');

    await userModel.deleteOne({ _id: responseNewUser.body._id });
  });

  test('Update user username - existing username', async () => {
    const testUser3: User = {
      email: 'test3@user.com',
      username: 'Mich3',
      password: 'testpassword3',
    };
    const responseNewUser = await requestWithAuth
      .post('/users')
      .send(testUser3);
    expect(responseNewUser.statusCode).toBe(status.OK);

    const response = await requestWithAuth
      .put(`/users/${testUser._id}`)
      .send({ username: 'Mich3' });
    expect(response.statusCode).toBe(status.BAD_REQUEST);

    await userModel.deleteOne({ _id: responseNewUser.body._id });
  });

  test('Update user password', async () => {
    const testUser3: User = {
      email: 'test3@user.com',
      username: 'Mich3',
      password: 'testpassword3',
    };
    const responseNewUser = await requestWithAuth
      .post('/users')
      .send(testUser3);
    expect(responseNewUser.statusCode).toBe(status.OK);
    const hashedPassword = responseNewUser.body.password;

    const response = await requestWithAuth
      .put(`/users/${responseNewUser.body._id}`)
      .send({ password: 'updatePassword' });

    expect(response.statusCode).toBe(status.OK);
    expect(response.body.password).not.toBe(hashedPassword);

    await userModel.deleteOne({ _id: responseNewUser.body._id });
  });

  test('Update user email', async () => {
    const testUser3: User = {
      email: 'test3@user.com',
      username: 'Mich3',
      password: 'testpassword3',
    };
    const responseNewUser = await requestWithAuth
      .post('/users')
      .send(testUser3);
    expect(responseNewUser.statusCode).toBe(status.OK);

    const response = await requestWithAuth
      .put(`/users/${responseNewUser.body._id}`)
      .send({ email: 'updateMail@user.com' });
    expect(response.statusCode).toBe(status.OK);
    expect(response.body.email).toBe('updateMail@user.com');

    await userModel.deleteOne({ _id: responseNewUser.body._id });
  });

  test('Update user email - existing email', async () => {
    const testUser3: User = {
      email: 'test3@user.com',
      username: 'Mich3',
      password: 'testpassword3',
    };
    const responseNewUser = await requestWithAuth
      .post('/users')
      .send(testUser3);
    expect(responseNewUser.statusCode).toBe(status.OK);

    const response = await requestWithAuth
      .put(`/users/${testUser._id}`)
      .send({ email: 'test3@user.com' });
    expect(response.statusCode).toBe(status.BAD_REQUEST);

    await userModel.deleteOne({ _id: responseNewUser.body._id });
  });

  test('Delete user', async () => {
    const testUser3: User = {
      email: 'test3@user.com',
      username: 'Mich3',
      password: 'testpassword3',
    };
    const responseNewUser = await requestWithAuth
      .post('/users')
      .send(testUser3);
    expect(responseNewUser.statusCode).toBe(status.OK);

    const response = await requestWithAuth.delete(
      `/users/${responseNewUser.body._id}`,
    );
    expect(response.statusCode).toBe(status.OK);
    expect(response.body._id).toBe(responseNewUser.body._id);

    await userModel.deleteOne({ _id: responseNewUser.body._id });
  });
});
