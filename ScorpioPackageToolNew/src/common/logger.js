const events = require('events')
class LoggerClass {
    constructor() {
        this.event = new events()
    }
    log(str) {
        console.log(str)
        this.event.emit("log", "info", str);
    }
    warn(str) {
        console.warn(str);
        this.event.emit("log", "warn", str);
    }
    error(str) {
        console.error(str);
        this.event.emit("log", "error", str);
    }
}
var logger = new LoggerClass();
export {logger, logger as console};