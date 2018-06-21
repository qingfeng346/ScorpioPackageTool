const events = require('events')
var logger = (function () {
    function logger() {
    }
    logger.log_impl = function(level, str) {
        if (level == "error") {
            console.error(str);
        } else if (level == "warn") {
            console.warn(str);
        } else {
            str = `[${level}] ${str}`;
            console.log(str);
        }
        this.event.emit("log", level, str);
    };
    logger.log = function (str) {
        this.log_impl("info", str);
    };
    logger.info = function (str) {
        this.log_impl("info", str);
    };
    logger.warn = function (str) {
        this.log_impl("warn", str);
    };
    logger.error = function (str) {
        this.log_impl("error", str);
    };
    return logger;
}());
logger.event = new events()

export {logger, logger as console};