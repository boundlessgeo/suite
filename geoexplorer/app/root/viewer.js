var {Application} = require("stick");

var app = exports.app = Application();
app.configure("render", "route");
app.render.base = module.resolve("../templates");
app.render.master = "base.html";

app.get("/", function(request) {
    return app.render("viewer.html", {});
});
