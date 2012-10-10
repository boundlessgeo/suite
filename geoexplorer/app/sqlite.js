var driver = new Packages.org.sqlite.JDBC();

var connect = function(url, options) {

    var info = new Packages.java.util.Properties();
    for (var key in options) {
        info.setProperty(key, String(options[key]));
    }
    
    if (!driver.acceptsURL(url)) {
        throw new Error("SQLITE driver doesn't accept url '" + url + "'.");
    }
    var conn = driver.connect(url, info);

    return conn;

};

var open = function(path) {
    return connect("jdbc:sqlite:" + path);
};

var memory = function() {
    return connect("jdbc:sqlite::memory:")
};

exports.open = open;
exports.memory = memory;