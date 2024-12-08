// server/services/auth.service.js
const mailService = require('./mail.service');

class AuthService {
  async sendVerificationEmail(user, verificationLink) {
    await mailService.sendVerificationEmail(user, verificationLink);
  }
}

module.exports = new AuthService();