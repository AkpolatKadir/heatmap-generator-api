const fs = require("fs");
class Logger {
  constructor() {
    this.path = process.cwd();
    this.ensureLogFileExists();
    console.log("Logger is initiated");
  }

  log(message, type) {
    this.ensureLogFileExists();
    const timestamp = new Date().toLocaleString();
    const fulldate = new Date().toLocaleDateString();
    fs.appendFile(
      `${this.path}/logs/${fulldate}_general_log.txt`,
      `${timestamp} - ${type} - ${message}\n`,
      err => {
        if (err) console.log("Logging error:", err);
      }
    );
  }

  ensureLogFileExists() {
    const fulldate = new Date().toLocaleDateString();
    if (!fs.existsSync(`${this.path}/logs/${fulldate}_general_log.txt`)) {
      fs.openSync(`${this.path}/logs/${fulldate}_general_log.txt`, "w");
    }
  }
}

module.exports = new Logger();
