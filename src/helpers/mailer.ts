import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import fs from 'fs';

export const getMailTransporter = (): Mail => {
  const service = process.env.MAIL_SERVICE || 'MAILTRAP';
  let config: SMTPTransport.Options | null = null;

  switch (service.toUpperCase()) {
    case 'SENDGRID': config = {
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    };
      break;
    case 'MAILTRAP':
      if (process.env.MAILTRAP_HOST && process.env.MAILTRAP_PORT &&
        process.env.MAILTRAP_USERNAME && process.env.MAILTRAP_PASSWORD) {
        config = {
          host: process.env.MAILTRAP_HOST,
          port: Number(process.env.MAILTRAP_PORT),
          secure: (process.env.MAILTRAP_SECURE || 'true') === 'true',
          auth: {
            user: process.env.MAILTRAP_USERNAME,
            pass: process.env.MAILTRAP_PASSWORD
          }
        };
      }
      break;
    default: break;
  }

  if (!config) {
    return null;
  }

  return nodemailer.createTransport(config);
};

export const getEmailTemplate = (templatePath: string): string => {
  const targetPath = `../private/email-template/${templatePath}`;
  if (fs.existsSync(targetPath)) {
    fs.readFile(targetPath, 'utf8', (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) {
        return null;
      }

      return data;
    });
  }

  return null;
};

export const getParsedEmailMessage = (templatePath: string, placeholderList: Record<string, string> = null): string => {
  let templateContent = getEmailTemplate(templatePath);
  if (!templateContent) {
    return null;
  }

  if (!placeholderList) {
    return templateContent;
  }

  const paramList = Object.keys(placeholderList);
  for (const paramKey in paramList) {
    const paramRegExp = new RegExp(`\[${paramKey}\]`, 'g');
    templateContent = templateContent.replace(paramRegExp, placeholderList[paramKey]);
  }

  return templateContent;
};
