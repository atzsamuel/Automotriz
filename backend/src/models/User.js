// Modelo base de usuario
class User {
  constructor({ id, username, passwordHash, role, mfaSecret, deleted }) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = role; // visitante, administrador, super-administrador
    this.mfaSecret = mfaSecret;
    this.deleted = deleted || false;
  }
}

module.exports = User;
