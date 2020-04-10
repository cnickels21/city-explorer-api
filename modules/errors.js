'use strict';

function errorHandler(error, request, response, next) {
    console.log(error);
    response.status(500).json({
        error: true,
        message: error.message,
    });
}

function notFoundHandler(request, response) {
    response.status(404).json({
        notFound: true,
    });
}

module.exports = errorHandler;
module.exports = notFoundHandler;
