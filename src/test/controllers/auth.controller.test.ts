/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole } from '../../models/user';
import request from 'supertest';
import app from '../../app';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DBManager = require('./../db-manager');

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
      role: UserRole.User,
      loginAfterRegister: false
    };

    request(app)
      .post('/api/user/register')
      .send(validRegisterInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('should not register user when invalid data provided', (done) => {
    const invalidRegisterInfo = {
      email: 'user001@test',
      password: '',
      passwordConfirmation: '',
      firstName: '',
      lastName: '',
      role: UserRole.User,
      loginAfterRegister: false
    };

    request(app)
      .post('/api/user/register')
      .send(invalidRegisterInfo)
      .set('Accept', 'application/json')
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
});
