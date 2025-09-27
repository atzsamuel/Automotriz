// Modelo base de log para auditoría
class Log {
  constructor({ id, userId, ip, endpoint, action, success, timestamp }) {
    this.id = id;
    this.userId = userId;
    this.ip = ip;
    this.endpoint = endpoint;
    this.action = action;
    this.success = success;
    this.timestamp = timestamp || new Date();
  }
}

module.exports = Log;
