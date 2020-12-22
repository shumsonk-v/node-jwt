import { waterfall } from 'async';
import Seeder from './seeders/seeder.class';
import Users from './seeders/user.seeder';

const seedsList = [Users];

if (seedsList.length) {
  // Open mongo connection
  try {
    const operations = seedsList.map((seed) => {
      const op = new seed();
      return op
        .shouldRun()
        .then((shouldRun) => (shouldRun ? op.run() : Promise.resolve()));
    });
  } catch (e) {
  } finally {
  }

  // Close mongo connection
}
