var {Application} = require("stick");

var app = exports.app = Application();
app.configure("render", "route");
app.render.base = module.resolve("../templates");
app.render.master = "base.html";

var auth = require("../auth");

app.get("/", function(request) {
    var status = auth.getStatus(request);
    return app.render("composer.html", {status: status || 404});
});
