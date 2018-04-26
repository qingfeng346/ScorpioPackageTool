<script>
var logger = (function () {
    function logger() {
    }
    logger.log_impl = function(level, str) {
        str = `[${level}] ${str}`;
        console.log(str);
        var pre = document.getElementById("logoutput");
        pre.innerHTML = pre.innerHTML + str + "\n";
        if (typeof mainVue != "undefined" && mainVue.autoRoll) {
            pre.parentNode.scrollTop = pre.parentNode.scrollHeight;
        }
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
exports.logger = logger;
</script>