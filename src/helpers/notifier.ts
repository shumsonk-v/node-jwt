import notifier from 'node-notifier';

export const notify = (message: string): void => {
  if (process.env.NOTIFIER_ENABLE) {
    notifier.notify({
      title: process.env.NOTIFIER_TITLE,
      message,
      wait: false,
      sound: false,
    });
  }
};
