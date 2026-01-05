const MainLayout = require('./layout/MainLayout');
const WelcomeMailContent = require('./mails/WelcomeMail');

const WelcomeMail = (username = '{{nickname}}') => ({
  id: 1,
  name: '001 | Registration Welcome',
  subject: 'Welcome to Hawkeye Poker!',
  text: ((username) =>
    `Hi ${username}!\n\nWelcome to Hawkeye Poker and thank you for registering to our service!\n\nPlay now: https://www.hawkeyepoker.net \n\nEnjoy playing on our platform!\n\nThe Hawkeye Poker Team
    `)(username),
  html: ((username) =>
    `${MainLayout(
      'Welcome to Hawkeye Poker',
      username,
      WelcomeMailContent(),
    )}`)(username),
});

module.exports = {
  WelcomeMail,
};
