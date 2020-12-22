import Seeder from './seeder.class';
import { AccountStatus, User, UserRole } from '../models/user';

const data = [
  {
    email: 'super_admin@node-app.local',
    password: 'P!k^EIBvr#83',
    role: UserRole.SuperAdmin,
    status: AccountStatus.Active,
    profile: {
      displayName: 'Vissanu.S',
      firstName: 'Vissanu',
      middleName: '',
      lastname: 'Shumsonk',
      language: 'en',
    },
  },
];

class UsersSeeder extends Seeder {
  async shouldRun(): Promise<boolean> {
    return User.countDocuments()
      .exec()
      .then((count: number) => count === 0);
  }

  async run(): Promise<void> {
    await User.insertMany(data);
    return;
  }
}

export default UsersSeeder;
