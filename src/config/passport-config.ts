import passport from 'passport';
import passportLocal from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import { User, UserDocument } from '../models/user';

/**
 * NOTE: Mongoose id has 'any' type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser<UserDocument, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Passport local strategy config
 */
const LocalStrategy = passportLocal.Strategy;
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ email: username.toLowerCase() }, (err, user: UserDocument) => {
    if (err) { return done(err); }
    if (!user) {
      return done(undefined, false, { message: `Username ${username} was not found.` });
    }
    user.comparePassword(password, (err: Error, isMatch: boolean) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(undefined, user);
      }
      return done(undefined, false, { message: 'Invalid username or password.' });
    });
  });
}));

/**
 * Passport JWT strategy config
 */
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE
};
passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  return done(null, jwtPayload);
}));
