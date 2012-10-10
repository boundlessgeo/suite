var assert = require("assert");
var fs = require("fs");
var proxy = require("../../../app/root/proxy");
var Headers = require("ringo/utils/http").Headers;

exports["test: getUrlProps"] = function() {
    
    var cases = [{
        url: "http://example.com/", 
        props: {
            url: "http://example.com/",
            scheme: "http",
            username: null,
            password: null,
            host: "example.com",
            port: null,
            path: "/",
            query: null,
            hash: null
        }
    }, {
        url: "https://user:pass@example.com:8080/path/to/file?q=foo#bar", 
        props: {
            url: "https://example.com:8080/path/to/file?q=foo#bar",
            scheme: "https",
            username: "user",
            password: "pass",
            host: "example.com",
            port: 8080,
            path: "/path/to/file",
            query: "q=foo",
            hash: "bar"
        }
    }, {
        url: "http://user@example.com", 
        props: {
            url: "http://example.com",
            scheme: "http",
            username: "user",
            password: null,
            host: "example.com",
            port: null,
            path: "/",
            query: null,
            hash: null
        }
    }, {
        url: "/relative/path/not/supported", 
        props: undefined
    }];
    
    var c, got, key;
    for (var i=0, ii=cases.length; i<ii; ++i) {
        c = cases[i];
        got = proxy.getUrlProps(c.url);
        if (!got) {
            assert.strictEqual(got, c.props, c.url);
        } else {
            for (key in c.props) {
                assert.strictEqual(got[key], c.props[key], key + " for " + c.url);
            }
        }
    }
    
};

exports["test: createProxyRequestProps"] = function() {

    var cases = [{
        msg: "simple get, preserveHost false",
        config: {
            url: "http://example.com/",
            request: {
                method: "GET",
                headers: {
                    "Content-Type": "text/html",
                    "Host": "localhost"
                }
            }
        }, 
        props: {
            method: "GET",
            url: "http://example.com/",
            scheme: "http",
            headers: {
                "Content-Type": "text/html",
                "Host": "example.com"
            },
            data: undefined
        }
    }, {
        msg: "get with port, preserveHost false",
        config: {
            url: "http://example.com:8080/path/to/resource",
            request: {
                method: "GET",
                headers: {
                    "Content-Type": "text/plain",
                    "Host": "localhost"
                }
            }
        }, 
        props: {
            method: "GET",
            url: "http://example.com:8080/path/to/resource",
            username: null,
            password: null,
            headers: {
                "Content-Type": "text/plain",
                "Host": "example.com:8080"
            }
        }
    }, {
        msg: "post with user:pass, preserveHost false",
        config: {
            url: "http://user:pass@example.com/path/to/resource",
            request: {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Length": "3",
                    "Host": "localhost"
                },
                input: ["foo"]
            }
        }, 
        props: {
            method: "POST",
            url: "http://example.com/path/to/resource",
            username: "user",
            password: "pass",
            headers: {
                "Content-Type": "text/plain",
                "Content-Length": "3",
                "Host": "example.com"
            },
            data: ["foo"]
        }
    }, {
        msg: "post with user:pass, preserveHost true",
        config: {
            url: "https://user:pass@example.com/path/to/resource",
            preserveHost: true,
            request: {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Length": "3",
                    "Host": "localhost"
                },
                input: ["foo"]
            }
        }, 
        props: {
            method: "POST",
            url: "https://example.com/path/to/resource",
            username: "user",
            password: "pass",
            scheme: "https",
            headers: {
                "Content-Type": "text/plain",
                "Content-Length": "3",
                "Host": "localhost"
            },
            data: ["foo"]
        }
    }, {
        msg: "put with allowAuth false",
        config: {
            url: "http://example.com/path/to/resource",
            request: {
                method: "PUT",
                headers: {
                    "Content-Type": "text/plain",
                    "Host": "localhost",
                    "Content-Length": "3",
                    "Authorization": "foo",
                    "Cookie": "bar"
                },
                input: ["foo"]
            }
        }, 
        props: {
            method: "PUT",
            url: "http://example.com/path/to/resource",
            headers: {
                "Content-Type": "text/plain",
                "Content-Length": "3",
                "Host": "example.com"
            },
            data: ["foo"]
        }
    }, {
        msg: "put with allowAuth true",
        config: {
            url: "http://example.com/path/to/resource",
            allowAuth: true,
            request: {
                method: "PUT",
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Length": "3",
                    "Host": "localhost",
                    "Authorization": "foo",
                    "Cookie": "bar"
                },
                input: ["foo"]
            }
        }, 
        props: {
            method: "PUT",
            url: "http://example.com/path/to/resource",
            headers: {
                "Content-Type": "text/plain",
                "Content-Length": "3",
                "Host": "example.com",
                "Authorization": "foo",
                "Cookie": "bar"
            },
            data: ["foo"]
        }
    }];
    
    var c, got, key;
    for (var i=0, ii=cases.length; i<ii; ++i) {
        c = cases[i];
        c.config.request.headers = new Headers(c.config.request.headers);
        got = proxy.createProxyRequestProps(c.config);
        if (!got) {
            assert.strictEqual(got, c.props, c.msg);
        } else {
            for (key in c.props) {
                assert.deepEqual(got[key], c.props[key], key + " for " + c.msg);
            }
        }
    }

};

// start the test runner if we're called directly from command line
if (require.main == module.id) {
    system.exit(require("test").run(exports));
}
