const MainLayout = require('./layout/MainLayout');
const WelcomeMailContent = require('./mails/WelcomeMail');

const WelcomeMail = (username = '{{nickname}}') => ({
  id: 1,
  name: '001 | Registration Welcome',
  subject: 'Welcome to IC poker!',
  text: ((username) =>
    `Hi ${username}!\n\nWelcome to IC poker and thank you for registering to our service!\n\nPlay now: https://www.icpoker.net \n\nEnjoy playing on our platform!\n\nThe IC poker Team
    `)(username),
  html: ((username) =>
    `${MainLayout(
      'Welcome to IC poker',
      username,
      WelcomeMailContent(),
    )}`)(username),
});

module.exports = {
  WelcomeMail,
};
