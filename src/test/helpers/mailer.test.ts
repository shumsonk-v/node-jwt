import { getParsedEmailMessage } from '../../helpers/mailer';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;

describe('Mailer', () => {
  it('should return error if template does not exist', () => {
    const paramValue = 'test e-mail';
    const parsedEmail = getParsedEmailMessage('undefined.html', {
      PARAM: paramValue
    });

    expect(parsedEmail).toBeNull();
  });

  it('should get proper email content with given template and parameters', () => {
    const paramValue = 'test e-mail';
    const parsedEmail = getParsedEmailMessage('test.html', {
      PARAM: paramValue
    });

    expect(parsedEmail).not.toBeNull();

    const emailContentDom = new JSDOM(parsedEmail);
    const elemBody = emailContentDom.window.document.body;
    const emailContentElem = elemBody.querySelector('p');
    expect(emailContentElem.innerHTML.trim()).toEqual(`Test e-mail body content with parameter value ${paramValue}`);
  });
});
