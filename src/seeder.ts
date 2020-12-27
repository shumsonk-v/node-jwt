// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import mongoose from 'mongoose';
import Users from './seeders/user.seeder';

const seedsList = [Users];

const runSeed = () => {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(async () => {
    console.log('Database connection established');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const results = await Promise.all(seedsList.map(async (seed) => {
        const op = new seed();
        return await op.shouldRun()
          .then((shouldRun) => (shouldRun ? op.run() : Promise.resolve(0)))
          .then((rowInserted) => `${op.name}: ${rowInserted} row(s) inserted.`);
      }));

      if (results.length) {
        results.forEach((msg) => {
          console.log(msg);
        });
        session.commitTransaction();
        console.log('Seeding successful!');
      }
    } catch (e) {
      session.abortTransaction();
      console.log('An error occurred, transaction aborted.');
    } finally {
      session.endSession();
      mongoose.disconnect();
      console.log('Database connection closed');
    }
  }).catch(() => {
    console.log('Cannot connect to the database.');
  });
};

if (seedsList.length) {
  runSeed();
}
