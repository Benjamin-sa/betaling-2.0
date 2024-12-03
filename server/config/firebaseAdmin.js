// server/config/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.cert(path.join(__dirname, 'scoutswinkel-firebase-adminsdk-ucote-7f034f7aec.json')),
  databaseURL: 'https://scoutswinkel.firebaseio.com'
});

module.exports = admin;