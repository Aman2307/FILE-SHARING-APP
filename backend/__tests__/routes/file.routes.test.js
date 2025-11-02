const request = require('supertest');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB, closeDatabase, clearDatabase, createTestFile } = require('../test-utils');
const app = require('../../server');

describe('File Routes', () => {
  let testFile;
  let server;

  beforeAll(async () => {
    await connectDB();
    server = app.listen(process.env.PORT);
  });

  afterAll(async () => {
    await server.close();
    await closeDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
    if (testFile && testFile.cleanup) {
      testFile.cleanup();
    }
  });

  describe('POST /api/upload', () => {
    beforeEach(() => {
      testFile = createTestFile('test-upload.txt', 1024);
    });

    it('should upload a file successfully', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('file', testFile.path);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('file');
      expect(res.body.file).toHaveProperty('filename');
      expect(res.body.file).toHaveProperty('size');
      expect(res.body.file).toHaveProperty('mimetype');
    });

    it('should return 400 if no file is uploaded', async () => {
      const res = await request(app)
        .post('/api/upload')
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/files', () => {
    it('should return list of uploaded files', async () => {
      // First upload a test file
      testFile = createTestFile('test-get-files.txt', 512);
      await request(app)
        .post('/api/upload')
        .attach('file', testFile.path);

      // Then fetch the list of files
      const res = await request(app)
        .get('/api/files')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.files)).toBe(true);
      expect(res.body.files.length).toBe(1);
    });
  });
});
