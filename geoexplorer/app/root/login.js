var Client = require("ringo/httpclient").Client;
var base64 = require("ringo/base64");
var auth = require("../auth");
var Headers = require("ringo/utils/http").Headers;
var objects = require("ringo/utils/objects");

exports.app = function(request) {
    var details = auth.authenticate(request);
    var status = details.status;
    var cookie;
    if (status === 200) {
        cookie = details.token;
    } else {
        // clear any previously set cookie
        cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    return {
        status: status,
        headers: {
            "Set-Cookie": cookie + ";Path=/"
        },
        body: []
    };
};
