const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

// Create a new in-memory database connection
const mongod = new MongoMemoryServer({
  instance: {
    dbName: 'file-share-test',
    port: 27017,
    dbPath: path.resolve(__dirname, '../test-db-data'),
    storageEngine: 'wiredTiger',
  },
  binary: {
    version: '6.0.12',
  },
  autoStart: false,
});

// Connect to the in-memory database
const connectDB = async () => {
  await mongod.start();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

// Drop database and close the connection
const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

// Clear all test data after each test
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Create a test file for upload testing
const createTestFile = (filename = 'test.txt', size = 1024) => {
  const filePath = path.join(__dirname, 'test-files', filename);
  const dirPath = path.dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Create a test file with random content
  const content = Buffer.alloc(size, 'test content');
  fs.writeFileSync(filePath, content);
  
  return {
    path: filePath,
    cleanup: () => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  };
};

module.exports = {
  connectDB,
  closeDatabase,
  clearDatabase,
  createTestFile,
};
