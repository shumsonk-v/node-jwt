import { ClientSession } from 'mongoose';

export type TransactionFunction = {
  (): void;
}

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
};

const runSessionWithRetry = (txnFunc: { (): void }): void => {
  while (true) {
    try {
      txnFunc();
      break;
    } catch (error) {
      if (error.hasOwnProperty('errorLabels') && error.errorLabels.includes('TransientTransactionError')) {
        console.log('TransientTransactionError, retrying transaction ...');
        continue;
      } else {
        throw error;
      }
    }
  }
};

export { commitWithRetry, runSessionWithRetry };
