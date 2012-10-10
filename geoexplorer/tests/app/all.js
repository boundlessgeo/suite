exports["test: root"] = require("./root/all");

if (require.main == module || require.main == module.id) {
    system.exit(require("test").run(exports));
}
