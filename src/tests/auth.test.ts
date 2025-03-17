import request from 'supertest';
import { Express } from 'express';
import mongoose from 'mongoose';
import { createExpress } from '../createExpress';
import postModel from '../models/postsModel';
import userModel, { IUser } from '../models/usersModel';
import status from 'http-status';
import jwt from 'jsonwebtoken';

let app: Express;

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: jest.fn().mockReturnValue({
          email: 'testuser@gmail.com',
          name: 'Test User',
          picture: 'https://example.com/profile.jpg',
        }),
      }),
    })),
  };
});

beforeAll(async () => {
  console.log('before all auth tests');
  app = await createExpress();
  await userModel.deleteMany();
  await postModel.deleteMany();
});

afterAll((done) => {
  console.log('after all auth tests');
  mongoose.connection.close();
  done();
});

const baseUrl = '/auth';

type User = IUser & {
  accessToken?: string;
  refreshToken?: string;
};

const testUser: User = {
  username: 'test',
  password: 'testPassword',
};

describe('Auth test register', () => {
  test('Success register', async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send(testUser);
    expect(response.statusCode).toBe(200);
  });

  test('Try to register with exist user', async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test('Send only username', async () => {
    const response = await request(app).post(`${baseUrl}/register`).send({
      username: 'fake',
    });
    expect(response.statusCode).not.toBe(200);
  });
  test('Send only empty username', async () => {
    const response = await request(app).post(`${baseUrl}/register`).send({
      username: '',
      password: 'fakePassword',
    });
    expect(response.statusCode).not.toBe(200);
  });
});
describe('Auth test login', () => {
  test('Success login - get back the same valus and set user', async () => {
    const response = await request(app).post(`${baseUrl}/login`).send(testUser);

    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(response.body.user._id).toBeDefined();

    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    testUser._id = response.body.user._id;
  });

  test('Check tokens are not the same - new login get different tokens', async () => {
    const response = await request(app).post(`${baseUrl}/login`).send(testUser);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;

    expect(accessToken).not.toBe(testUser.accessToken);
    expect(refreshToken).not.toBe(testUser.refreshToken);
  });

  test('Login fail - wrong password', async () => {
    const response = await request(app).post(`${baseUrl}/login`).send({
      username: testUser.username,
      password: 'fakePassword',
    });
    expect(response.statusCode).not.toBe(200);
  });

  test('Login fail - user does not exist', async () => {
    const response = await request(app).post(`${baseUrl}/login`).send({
      username: 'fake',
      password: 'fakePassword',
    });
    expect(response.statusCode).not.toBe(200);
  });

  test('Login fail - login only with username', async () => {
    const responseRegister = await request(app)
      .post(`${baseUrl}/register`)
      .send({
        username: 'fake1',
        password: '123',
      });
    expect(responseRegister.statusCode).toBe(200);
    const response = await request(app).post(`${baseUrl}/login`).send({
      username: 'fake1',
    });
    expect(response.statusCode).toBe(status.BAD_REQUEST);
    expect(response.text).toBe('Username or password are missing');
  });

  describe('Google Login', () => {
    test('Successful Google login', async () => {
      const response = await request(app).post(`${baseUrl}/login`).send({
        credential: 'fake_google_token',
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe('testuser@gmail.com');
      expect(response.body.user.username).toBe('Test User');
    });

    test('Fail Google login - missing credential', async () => {
      const response = await request(app).post(`${baseUrl}/login`).send({});

      expect(response.statusCode).toBe(status.BAD_REQUEST);
      expect(response.text).toBe('Error missing credential');
    });
  });
});

describe('Auth test - try to send post', () => {
  test('With authorization- success upload post', async () => {
    const responseLogin = await request(app)
      .post(`${baseUrl}/login`)
      .send(testUser);

    expect(responseLogin.statusCode).toBe(200);

    const responseNewPost = await request(app)
      .post('/posts')
      .set({ authorization: 'JWT ' + responseLogin.body.accessToken })
      .send({
        title: 'New Post 1',
        content: 'New Content 1',
        postedBy: testUser._id,
        rating: 3,
      });
    expect(responseNewPost.statusCode).toBe(201);
  });

  test('Without authorization- failed upload post', async () => {
    const response = await request(app).post('/posts').send({
      title: 'New post',
      content: 'Important content',
      sender: 'shir',
    });
    expect(response.statusCode).not.toBe(201);
  });
});

describe('Auth test refresh', () => {
  test('Success to refresh and get tokens', async () => {
    const response = await request(app).post(`${baseUrl}/refresh`).send({
      refreshToken: testUser.refreshToken,
    });
    expect(response.statusCode).toBe(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });

  test('Fail to refresh and get tokens due to server error', async () => {
    const originalTokenExpires = process.env.TOKEN_EXPIRES;
    const originalRefreshTokenExpires = process.env.REFRESH_TOKEN_EXPIRES;
    process.env.TOKEN_EXPIRES = '';
    process.env.REFRESH_TOKEN_EXPIRES = '';

    const response = await request(app).post(`${baseUrl}/refresh`).send({
      refreshToken: testUser.refreshToken, // Assuming a valid refresh token for the test
    });

    expect(response.statusCode).toBe(status.INTERNAL_SERVER_ERROR);

    expect(response.body.error).toBe('Server error'); // Example error message
    process.env.TOKEN_EXPIRES = originalTokenExpires;
    process.env.REFRESH_TOKEN_EXPIRES = originalRefreshTokenExpires;
  });

  test('Double use refresh token', async () => {
    const responseLogin = await request(app)
      .post(`${baseUrl}/login`)
      .send(testUser);

    expect(responseLogin.statusCode).toBe(200);
    const accessToken = responseLogin.body.accessToken;
    const refreshToken = responseLogin.body.refreshToken;

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(responseLogin.body.user._id).toBeDefined();

    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    testUser._id = responseLogin.body.user._id;

    const firstAttemptResponse = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({
        refreshToken: testUser.refreshToken,
      });

    expect(firstAttemptResponse.statusCode).toBe(200);

    // get new refresh token
    const newRefreshToken = firstAttemptResponse.body.refreshToken;

    const secondAttemptResponse = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({
        refreshToken: testUser.refreshToken,
      });

    // remove all refresh token and reset to empty array
    expect(secondAttemptResponse.statusCode).not.toBe(200);

    const responseRemoveRefreshToken = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({
        refreshToken: newRefreshToken,
      });

    // no refresh tokens
    expect(responseRemoveRefreshToken.statusCode).not.toBe(200);
  });

  test('Invalid refresh token', async () => {
    const invalidToken = jwt.sign(
      { notUserId: '222222222222222222222222' },
      process.env.TOKEN_SECRET as string,
      {
        expiresIn: '1h',
      }
    );

    const response = await request(app).post(`${baseUrl}/refresh`).send({
      refreshToken: invalidToken,
    });

    expect(response.statusCode).toBe(status.BAD_REQUEST);
    expect(response.text).toBe('Invalid refresh token');
  });

  test('Fake refresh token', async () => {
    const random = Math.random().toString();

    const validTokenForUnexistsUser = jwt.sign(
      { _id: '222222222222222222222222', random },
      process.env.TOKEN_SECRET as string,
      {
        expiresIn: '1h',
      }
    );

    const response = await request(app).post(`${baseUrl}/refresh`).send({
      refreshToken: validTokenForUnexistsUser,
    });

    expect(response.statusCode).toBe(status.BAD_REQUEST);
    expect(response.text).toBe('User not found');
  });
});

describe('Auth test logout', () => {
  test('Success logout - remove the used refresh token', async () => {
    const responseLogin = await request(app)
      .post(`${baseUrl}/login`)
      .send(testUser);
    expect(responseLogin.statusCode).toBe(200);

    testUser.accessToken = responseLogin.body.accessToken;
    testUser.refreshToken = responseLogin.body.refreshToken;

    const responseLogout = await request(app).post(`${baseUrl}/logout`).send({
      refreshToken: testUser.refreshToken,
    });
    expect(responseLogout.statusCode).toBe(200);

    const responseRefresh = await request(app).post(`${baseUrl}/refresh`).send({
      refreshToken: testUser.refreshToken,
    });
    expect(responseRefresh.statusCode).not.toBe(200);
  });
});

describe('Test timeout token', () => {
  jest.setTimeout(10000);

  test('Success - do refresh before upload', async () => {
    const responseLogin = await request(app)
      .post(`${baseUrl}/login`)
      .send(testUser);
    expect(responseLogin.statusCode).toBe(200);
    testUser.accessToken = responseLogin.body.accessToken;
    testUser.refreshToken = responseLogin.body.refreshToken;

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const responseRefresh = await request(app).post(`${baseUrl}/refresh`).send({
      refreshToken: testUser.refreshToken,
    });
    expect(responseRefresh.statusCode).toBe(200);
    testUser.accessToken = responseRefresh.body.accessToken;

    const responseNewPost = await request(app)
      .post('/posts')
      .set({ authorization: `JWT ${testUser.accessToken}` })
      .send({
        title: 'New Post 2',
        content: 'New Content 2',
        postedBy: testUser._id,
        rating: 3,
      });
    expect(responseNewPost.statusCode).toBe(201);
  });

  test('Failed - time has passed', async () => {
    const originalTokenExpires = process.env.TOKEN_EXPIRES;
    const originalRefreshTokenExpires = process.env.REFRESH_TOKEN_EXPIRES;
    process.env.TOKEN_EXPIRES = '1000ms';
    process.env.REFRESH_TOKEN_EXPIRES = '4000ms';

    const responseLogin = await request(app)
      .post(`${baseUrl}/login`)
      .send(testUser);
    expect(responseLogin.statusCode).toBe(200);
    testUser.accessToken = responseLogin.body.accessToken;
    testUser.refreshToken = responseLogin.body.refreshToken;

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const responseNewPost = await request(app)
      .post('/posts')
      .set({ authorization: `JWT ${testUser.accessToken}` })
      .send({
        title: 'New Post 3',
        content: 'New Content 3',
        postedBy: testUser._id,
        rating: 3,
      });

    expect(responseNewPost.statusCode).not.toBe(201);

    process.env.TOKEN_EXPIRES = originalTokenExpires;
    process.env.REFRESH_TOKEN_EXPIRES = originalRefreshTokenExpires;
  });
});
