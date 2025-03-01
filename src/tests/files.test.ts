import request from 'supertest';
import { createExpress } from '../createExpress';
import mongoose from 'mongoose';
import { Express } from 'express';

let app: Express;

beforeAll(async () => {
  console.log('before all files tests');
  app = await createExpress();
});

afterAll((done) => {
  console.log('after all files tests');
  mongoose.connection.close();
  done();
});

describe('File Tests', () => {
  test('upload file', async () => {
    const filePath = `${__dirname}/testFile.txt`;

    try {
      const response = await request(app)
        .post('/file?file=testFile.txt')
        .attach('file', filePath);
      expect(response.statusCode).toEqual(200);
      let url = response.body.url;
      url = url.replace(/^.*\/\/[^/]+/, '');
      const res = await request(app).get(url);
      expect(res.statusCode).toEqual(200);
    } catch (err) {
      expect(1).toEqual(2);
    }
  });
});
