import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import session from 'express-session';
import mongo from 'connect-mongo';
import mongoose from 'mongoose';
import bluebird from 'bluebird';
import passport from 'passport';
import lusca from 'lusca';
import swaggerUi from 'swagger-ui-express';

// App import
import './config/passport-config';
import apiRoutes from './routes/api';
import webRoutes from './routes/web';

// Swagger
import swaggerDocument from '../swagger.json';
import { camelCaseRequestTransformer } from './middleware';

// MongoDB settings
const mongoStore = mongo(session);
mongoose.Promise = bluebird;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
  () => { console.log(`MongoDB connected.`) },
).catch(err => {
  console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
});

// App settings
const app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'views/pages')
]);
app.set('view engine', 'pug');
app.use(compression())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new mongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Prevent access to private resources
app.use((req: Request, res: Response, next: NextFunction) => {
  if (/\/?(private)\//gi.test(req.url)) {
    return res.status(403).send();
  }

  next();
});

// Static path
app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);

// Camel case transformer
app.use(camelCaseRequestTransformer());

/**
 * APIs Routes
 * Target only /api/* path
 */
app.use('/api', apiRoutes());

/**
 * Web routes.
 * Visible webpage 
 */
app.use('/', webRoutes());

/**
 * Swagger Doc
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Not-found page redirect
app.use((req: Request, res: Response) => {
  res.status(404).render('not-found', {
    title: 'Page Not Found'
  });
});

export default app;
