/* eslint-disable @typescript-eslint/no-explicit-any */
import { authReqHeader } from "./../test-helper";
import request from 'supertest-as-promised';

import app from '../../app';
import { AccountStatus, User, UserRole } from '../../models/user';
import { commonReqHeader } from '../test-helper';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DBManager = require('./../db-manager');

const mockUser = {
  email: 'user001@test.com',
  password: 'testonly',
  role: UserRole.Admin,
  status: AccountStatus.Active,
  profile: {
    displayName: 'Test User',
    firstName: 'Test',
    middleName: '',
    lastname: 'User',
    language: 'en-US'
  }
};
const mockValidLoginCred = {
  username: mockUser.email,
  password: mockUser.password
};
const addUser = async (): Promise<void> => {
  const newUser = new User(mockUser);
  await newUser.save();
};
const login = async (loginBody: any): Promise<any> => {
  await addUser();

  return request(app)
    .post('/api/auth/login')
    .send(loginBody)
    .set(commonReqHeader)
    .expect('Content-Type', /json/);
}
const submitValidPasswordRecovery = async (): Promise<any> => {
  await addUser();

  return request(app)
    .post('/api/auth/forgot-password')
    .send({
      email: mockUser.email
    })
    .set(commonReqHeader)
    .expect(200);
};
const doResetPassword = (res: any, newPassword: string): any => {
  const passRecoveryToken = res.body.data.token;
  expect(passRecoveryToken).toBeTruthy();

  return request(app)
    .post('/api/auth/reset-password')
    .send({
      token: passRecoveryToken,
      password: newPassword,
      passwordConfirmation: newPassword,
    })
    .set(commonReqHeader)
    .expect(200);
}

describe('Auth', () => {
  const db = new DBManager();

  beforeAll(async () => db.start());
  afterEach(async () => db.cleanup());
  afterAll(async () => db.stop());

  it('should register user correctly when valid data provided', (done) => {
    const validRegisterInfo = {
      email: 'user001@test.com',
      password: 'testonly',
      passwordConfirmation: 'testonly',
      firstName: 'Test',
      lastName: 'Only',
      role: UserRole.User
    };

    request(app)
      .post('/api/user/register')
      .send(validRegisterInfo)
      .set(commonReqHeader)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('should not register user and return error when invalid data provided', (done) => {
    const invalidRegisterInfo = {
      email: 'user001@test',
      password: '',
      passwordConfirmation: '',
      firstName: '',
      lastName: '',
      role: UserRole.User,
    };

    request(app)
      .post('/api/user/register')
      .send(invalidRegisterInfo)
      .set(commonReqHeader)
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        const validationResult = res.body.error;
        const emailError = validationResult.find((r: any) => r.param === 'email');
        expect(emailError).toBeTruthy();

        const passwordError = validationResult.find((r: any) => r.param === 'password');
        expect(passwordError).toBeTruthy();

        const passwordConfirmError = validationResult.find((r: any) => r.param === 'passwordConfirmation');
        expect(passwordConfirmError).toBeTruthy();

        const firstNameError = validationResult.find((r: any) => r.param === 'firstName');
        expect(firstNameError).toBeTruthy();

        const lastNameError = validationResult.find((r: any) => r.param === 'lastName');
        expect(lastNameError).toBeTruthy();

        done();
      });
  });

  it('should log in properly if credential is valid', (done) => {
    login(mockValidLoginCred).then((res) => {
      const resp = res.body;
      expect(resp.result).toBeTruthy();
      expect(resp.data.accessToken).toBeTruthy();
      done();
    });
  });

  it('should return error if login is invalid', (done) => {
    login({
      username: mockUser.email,
      password: 'anyinvalidpass'
    }).then((res) => {
      const resp = res.body;
      expect(resp.result).toBeFalsy();
      done();
    });
  });

  it('should logout correctly', (done) => {
    let accessToken = '';
    login(mockValidLoginCred)
      .then((res) => {
        const resp = res.body;
        accessToken = resp.data.accessToken;
        expect(accessToken).toBeTruthy();

        return request(app)
          .post('/api/auth/logout')
          .set(authReqHeader(accessToken));
      })
      .then((res) => {
        const resp = res.body;
        expect(resp.result).toBeTruthy();

        // After logged out, user should not be able to access protected route
        return request(app)
          .get('/api/user/me')
          .set(authReqHeader(accessToken))
          .expect(401);
      })
      .then((res) => {
        const resp = res.body;
        expect(resp.result).toBeFalsy()
        done();
      });
  });

  it('should not be logged out if user is not logged in', (done) => {
    request(app)
      .post('/api/auth/logout')
      .set(authReqHeader(''))
      .expect(401, done);
  });

  it('should get proper result for performing forgot password', (done) => {
    submitValidPasswordRecovery().then((res) => {
      const resp = res.body;
      expect(resp.result).toBeTruthy();
      done();
    });
  });

  it('should not get proper result for performing forgot password if user is not valid', async (done) => {
    await addUser();

    request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'someone@idontknow.com'
      })
      .set(commonReqHeader)
      .expect(400, done);
  });

  it('should reset password correctly', (done) => {
    const newPassword = 'newpassword';

    submitValidPasswordRecovery()
      .then((res) => doResetPassword(res, newPassword))
      .then((res) => {
        const resp = res.body;
        expect(resp.result).toBeTruthy();
        done();
      });
  });

  it('should reset password correctly and new password should be valid', (done) => {
    const newPassword = 'newpassword';

    submitValidPasswordRecovery()
      .then((res) => doResetPassword(res, newPassword))
      .then((res) => {
        const resp = res.body;
        expect(resp.result).toBeTruthy();

        return login({
          username: mockValidLoginCred.username,
          password: newPassword
        });
      })
      .then((res) => {
        const resp = res.body;
        expect(resp.result).toBeTruthy();
        expect(resp.data.accessToken).toBeTruthy();
        done();
      });
  });

  it('should reset password correctly and old password should be no longer valid', async (done) => {
    const newPassword = 'newpassword';

    submitValidPasswordRecovery()
      .then((res) => doResetPassword(res, newPassword))
      .then((res) => {
        const resp = res.body;
        expect(resp.result).toBeTruthy();

        return login({
          username: mockValidLoginCred.username,
          password: mockValidLoginCred.password
        });
      })
      .then((res) => {
        const resp = res.body;
        expect(resp.result).toBeFalsy();
        done();
      });
  });

  it('should obtain profile correctly if logged in', (done) => {
    login(mockValidLoginCred)
      .then((res) => {
        const resp = res.body;
        const accessToken = resp.data.accessToken;
        expect(accessToken).toBeTruthy();

        return request(app)
          .get('/api/user/me')
          .set(authReqHeader(accessToken))
          .expect(200)
      })
      .then((res) => {
        const resp = res.body;
        expect(resp.result).toBeTruthy();
        expect(resp.data.email).toEqual(mockValidLoginCred.username);
        done();
      });
  });
});
