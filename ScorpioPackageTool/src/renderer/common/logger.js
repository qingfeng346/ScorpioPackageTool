const events = require('events')
var logger = (function () {
    function logger() {
    }
    logger.log = function (str) {
        console.log(str);
        this.event.emit("log", "info", str);
    };
    logger.warn = function (str) {
        console.warn(str);
        this.event.emit("log", "warn", str);
    };
    logger.error = function (str) {
        console.error(str);
        this.event.emit("log", "error", str);
    };
    return logger;
}());
logger.event = new events()

export {logger, logger as console};