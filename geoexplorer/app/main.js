var {Application} = require("stick");

var app = Application();
app.configure("notfound", "error", "static", "params", "mount");
app.static(module.resolve("static"));

app.mount("/", function(request) {
    if (request.pathInfo.length > 1) {
        throw {notfound: true};
    }
    var target = request.scheme + "://" + request.host + ":" + request.port + request.scriptName + "/composer/";
    return {
        status: 303,
        headers: {"Location": target},
        body: []
    };
});
app.mount("/composer", require("./root/composer").app);
app.mount("/login", require("./root/login").app);
app.mount("/maps/", require("./root/maps").app);
app.mount("/proxy", require("./root/proxy").app);
// TODO: remove workaround for added slashes
app.mount("/viewer/proxy", require("./root/proxy").app);
app.mount("/composer/proxy", require("./root/proxy").app);
app.mount("/viewer", require("./root/viewer").app);


// debug mode loads unminified scripts
// assumes markup pulls in scripts under the path /servlet_name/script/
if (java.lang.System.getProperty("app.debug")) {
    var fs = require("fs");
    var config = fs.normal(fs.join(module.directory, "..", "buildjs.cfg"));
    app.mount("/script/", require("./autoloader").App(config));

    // proxy a remote geoserver on /geoserver by setting app.proxy.geoserver to remote URL
    // only recommended for debug mode
    var geoserver = java.lang.System.getProperty("app.proxy.geoserver");
    if (geoserver) {
        if (geoserver.charAt(geoserver.length-1) !== "/") {
            geoserver = geoserver + "/";
        }
        // debug specific proxy
        app.mount("/geoserver/", require("./root/proxy").pass({url: geoserver, preserveHost: true, allowAuth: true}));
    }
}

// Redirect requests for servlet name without a trailing slash.
// Jetty does this automatically for /servlet_name, Tomcat does not.
function slash(app) {
    return function(request) {
        var servletRequest = request.env.servletRequest;
        var pathInfo = servletRequest.getPathInfo();
        if (pathInfo === "/") {
            var uri = servletRequest.getRequestURI();
            if (uri.charAt(uri.length-1) !== "/") {
                var location = servletRequest.getScheme() + "://" + 
                    servletRequest.getServerName() + ":" + servletRequest.getServerPort() + 
                    uri + "/";
                return {
                    status: 301,
                    headers: {"Location": location},
                    body: []
                };
            }
        }
        return app(request);
    };
}

exports.app = slash(app);

// main script to start application
if (require.main === module) {
    require("ringo/httpserver").main(module.id);
}
