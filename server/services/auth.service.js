// server/services/auth.service.js
const admin = require('../config/firebaseAdmin');
const mailService = require('./mail.service');

class AuthService {
  async generateEmailVerificationLink(email) {
    const link = await admin.auth().generateEmailVerificationLink(email);
    return link;
  }

  async sendVerificationEmail(user) {
    const verificationLink = await this.generateEmailVerificationLink(user.email);
    await mailService.sendVerificationEmail(user, verificationLink);
  }
}

module.exports = new AuthService();