import Seeder from './seeder.class';
import {
  AccountStatus,
  User,
  UserAccount,
  UserDocument,
  UserRole,
} from '../models/user';

const data: UserAccount[] = [
  {
    email: 'super_admin@node-app.local',
    password: 'P!k^EIBvr#83',
    role: UserRole.SuperAdmin,
    status: AccountStatus.Active,
    profile: {
      displayName: 'Vissanu.S',
      firstName: 'Vissanu',
      middleName: '',
      lastName: 'Shumsonk',
      language: 'en',
    },
    passwordResetToken: null,
    passwordResetExpires: null,
    tokens: [],
  },
];

class UsersSeeder extends Seeder {
  name = 'Users';

  async shouldRun(): Promise<boolean> {
    return User.countDocuments()
      .exec()
      .then((count: number) => count === 0);
  }

  async run(): Promise<number> {
    const users = await User.create<UserDocument>(data as UserDocument[]);
    return users.length;
  }
}

export default UsersSeeder;
