import request from 'supertest';
import { createExpress } from '../createExpress';
import mongoose from 'mongoose';
import { Express } from 'express';
import Test from 'supertest/lib/test';
import TestAgent from 'supertest/lib/agent';
import { IUser } from '../models/usersModel';
import userModel from '../models/usersModel';

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
  console.log('before all recommendation tests');
  app = await createExpress();
  await userModel.deleteMany();

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
  console.log('after all recommendation tests');
  mongoose.connection.close();
  done();
});

describe('Recommendation Tests', () => {
  test('request recommendation', async () => {
    const description = 'asian restaurant';
    const response = await requestWithAuth.get(
      `/recommendation?description=${description}`
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('url');
  });
});
