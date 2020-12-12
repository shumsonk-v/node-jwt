/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';

// const COLLECTIONS = ['users'];
mongoose.Promise = Bluebird;

class DBManager {
  private db: any;
  private server: MongoMemoryServer;
  private connection: MongoClient;

  constructor() {
    this.db = null;
    this.server = new MongoMemoryServer();
    this.connection = null;
  }

  async start() {
    const url = await this.server.getUri();
    const mongooseOpts = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    };
    await mongoose.connect(url, mongooseOpts);
  }

  async stop() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.server.stop();
  }

  async cleanup() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(({ name }: any) => name);
    for (const colName of collectionNames) {
      await mongoose.connection.db.collection(colName).drop();
    }
  }
}

module.exports = DBManager;