// db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban';
const client = new MongoClient(uri);

let db;

async function connect() {
  try {
    if (!db) {
      await client.connect();
      db = client.db();
      await db.command({ ping: 1 }); // Test connection
      console.log('Connected to MongoDB');
      
      // Create indexes for better performance
      await db.collection('tasks').createIndex({ id: 1 }, { unique: true });
      await db.collection('tasks').createIndex({ status: 1 });
    }
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call connect() first.');
  return db;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = { connect, getDb };