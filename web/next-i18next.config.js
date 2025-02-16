const path = require('path');
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
  },
  fallbackLng: 'en',
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}