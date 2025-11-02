const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { connectDB, closeDatabase, clearDatabase, createTestFile } = require('../test-utils');
const { app, server } = require('../../server');
const File = require('../../models/File');

describe('File Controller', () => {
  let testFile;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDatabase();
    await server.close();
  });

  afterEach(async () => {
    await clearDatabase();
    if (testFile && testFile.cleanup) {
      testFile.cleanup();
    }
  });

  describe('File Upload', () => {
    it('should upload a file successfully', async () => {
      testFile = createTestFile('test-upload.txt', 1024);
      
      const res = await request(app)
        .post('/api/upload')
        .attach('file', testFile.path);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('file');
      expect(res.body.file).toHaveProperty('filename');
      expect(res.body.file).toHaveProperty('size', 1024);
      expect(res.body.file).toHaveProperty('mimetype', 'text/plain');
      
      // Verify file exists in database
      const file = await File.findOne({ originalname: 'test-upload.txt' });
      expect(file).toBeTruthy();
      expect(file.size).toBe(1024);
    });

    it('should return 400 if no file is provided', async () => {
      const res = await request(app)
        .post('/api/upload')
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'No file uploaded');
    });

    it('should return 400 if file is too large', async () => {
      // Create a file larger than the limit (assuming limit is 100MB)
      testFile = createTestFile('large-file.bin', 101 * 1024 * 1024);
      
      const res = await request(app)
        .post('/api/upload')
        .attach('file', testFile.path);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('File too large');
    });

    it('should return 400 for invalid file types', async () => {
      testFile = createTestFile('test.exe', 1024);
      
      const res = await request(app)
        .post('/api/upload')
        .attach('file', testFile.path);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('Invalid file type');
    });
  });

  describe('File Download', () => {
    let fileId;

    beforeEach(async () => {
      // Upload a test file first
      testFile = createTestFile('test-download.txt', 512);
      const uploadRes = await request(app)
        .post('/api/upload')
        .attach('file', testFile.path);
      
      fileId = uploadRes.body.file._id;
    });

    it('should download an existing file', async () => {
      const res = await request(app)
        .get(`/api/download/${fileId}`)
        .expect(200);
      
      expect(res.headers['content-type']).toBe('text/plain');
      expect(res.headers['content-disposition']).toContain('test-download.txt');
      expect(res.text).toContain('test content');
    });

    it('should return 404 for non-existent file', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/download/${nonExistentId}`)
        .expect(404);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toContain('File not found');
    });
  });

  describe('File Management', () => {
    beforeEach(async () => {
      // Upload multiple test files
      const files = [
        { name: 'file1.txt', size: 1024 },
        { name: 'file2.pdf', size: 2048 },
        { name: 'file3.jpg', size: 3072 }
      ];
      
      for (const file of files) {
        testFile = createTestFile(file.name, file.size);
        await request(app)
          .post('/api/upload')
          .attach('file', testFile.path);
      }
    });

    it('should list all uploaded files', async () => {
      const res = await request(app)
        .get('/api/files')
        .expect(200);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.files).toHaveLength(3);
      expect(res.body.files[0]).toHaveProperty('originalname');
      expect(res.body.files[0]).toHaveProperty('size');
      expect(res.body.files[0]).toHaveProperty('mimetype');
    });

    it('should delete a file', async () => {
      // Get the first file
      const filesRes = await request(app).get('/api/files');
      const fileToDelete = filesRes.body.files[0];
      
      // Delete the file
      const deleteRes = await request(app)
        .delete(`/api/files/${fileToDelete._id}`)
        .expect(200);
      
      expect(deleteRes.body).toHaveProperty('success', true);
      
      // Verify file is deleted
      const getRes = await request(app).get('/api/files');
      expect(getRes.body.files).toHaveLength(2);
      expect(getRes.body.files.some(f => f._id === fileToDelete._id)).toBe(false);
    });
  });
});
