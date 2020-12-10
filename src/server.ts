// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import errorHandler from 'errorhandler';
import app from './app';
import { notify } from './helpers';

const env = process.env.APP_ENV;
const port = process.env.PORT;

/**
 * Error Handler. Provides full stack - remove for production
 */
if (env !== 'production') {
  app.use(errorHandler());
}


/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
  console.log(`App is running at http://localhost:${port} in ${env} mode.\nPress CTRL-C to stop`);
  notify('Node JWT has been compiled and running');
});

export default server;

