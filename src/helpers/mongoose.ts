import { ClientSession } from 'mongoose';

const commitWithRetry = (session: ClientSession): void => {
  while (true) {
    try {
      session.commitTransaction();
      break;
    } catch (error) {
      // Can retry commit
      if (error.hasOwnProperty('errorLabels') && error.errorLabels.includes('UnknownTransactionCommitResult')) {
        continue;
      } else {
        throw error;
      }
    }
  }
}

export { commitWithRetry };
