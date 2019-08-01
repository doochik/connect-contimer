var timer = require('contimer'),
    TIMER_LABEL = '__response_timer_label__';

/**
 * @param {String} [label] Contimer timer label
 * @param {Function} cb function(time: Number, req: http.IncomingMessage)
 * @returns {Function} Middleware function(req: http.IncomingMessage, res: http.ServerResponse)
 */
module.exports = function requestTimeMiddleware(label, cb) {
    if (typeof label === 'function') {
        cb = label;
        label = TIMER_LABEL;
    }

    return function(req, res, next) {
        var timerStop = timer.start({}, label);

        res
            .on('finish', onRequestEnd)
            .on('close', onRequestEnd);

        function onRequestEnd() {
            unbind();

            var timeObj = timerStop();
            cb(timeObj.time, req);
        }

        function unbind() {
            res
                .removeListener('close', onRequestEnd)
                .removeListener('finish', onRequestEnd);
        }

        next();
    };
};
