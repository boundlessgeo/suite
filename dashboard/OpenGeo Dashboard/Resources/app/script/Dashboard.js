Ext.namespace("og");

og.Dashboard = Ext.extend(Ext.util.Observable, {
    
    /** api: property[debug]
     *  ``Boolean``
     *  Run in debug mode (useful when services are not running on same origin).
     *  Default is false.
     */
    debug: false,

    /** api: property[config]
     *  ``Object``
     *  The dashboard configuration.
     */
    config: null,
    
    /** private: property[configDirty]
     *  ``Boolean``
     *  Flag to track if the configuration has been changed.
     */
    configDirty: false,
    
    /** private: property[platform]
     * ``Object``
     * 
     * Instance of og.platform that encapsulates os specific operations.
     */
    platform: null,
    
    /** api: property[DEFAULTS]
     *  ``Object``
     *  Default preferences.
     *
     *  Members:
     *   * helpOnStart - ``Boolean`` Show help dialog on start.  Default is true.
     */
    DEFAULTS: {
        helpOnStart: true
    },
    
    /** api: property[revision]
     *  ``Number``
     *  The subversion revision number of this build.
     */
    revision: null,
    
    /** private: property[dbName]
     *  ``String``
     *  Database name for storage of user preferences.
     */
    dbName: "org.opengeo.suite",
    
    constructor: function() {
        
        var versionInfo = og.util.getVersionInfo();
        this.revision = versionInfo["build_revision"];
        this.buildProfile = versionInfo["build_profile"];
        var targetVersion = versionInfo["suite_version"];
        var config = og.util.getUserConfig();
        if (config) {
            // previous install
            if (targetVersion !== config["suite_version"]) {
                // upgrade
                config = og.util.upgradeConfig(config, targetVersion);
            }
        } else {
            // fresh install
            config = og.util.getBundledConfig();
            config["suite_version"] = targetVersion;
            // write to user's .opengeo dir
            og.util.saveConfig(config);
        }

        // apply default preferences
        this.setPreferences(Ext.applyIf(this.getPreferences(), this.DEFAULTS));

        // apply config
        this.initialConfig = config;
        this.config = Ext.apply({}, config);
        
        this.suite = new og.Suite(config); // TODO: extract just suite config?
        og.util.tirun(function() {
            this.platform = og.platform[Titanium.Platform.name];
        }, this, function(){}    );
        
        var startingDialog = this.createWorkingDialog("Starting the OpenGeo Suite");
        var stoppingDialog = this.createWorkingDialog("Stopping the OpenGeo Suite");

        this.suite.on({
            starting: function() {
                var previousStarts = this.getPreferences("previousStarts") || {};
                if (!previousStarts[this.revision]) {
                    startingDialog.html = 
                        "Please wait while the OpenGeo Suite starts for the first time.<br>" +
                        " This process may take up to a few minutes.";
                }
                startingDialog.show().center();
            }, 
            startfailure: function(msg) {
                startingDialog.hide();
                Ext.Msg.show({
                    title: "Trouble Starting the Suite",
                    msg: msg,
                    icon: Ext.MessageBox.WARNING,
                    width: 300
                });
            },
            started: function() {
                this.ok("The OpenGeo Suite is online.");
                startingDialog.hide();
                var previousStarts = this.getPreferences("previousStarts") || {};
                if (!previousStarts[this.revision]) {
                    previousStarts[this.revision] = true;
                    this.setPreferences({previousStarts: previousStarts});
                    var html = "Starting the OpenGeo Suite";
                    if (startingDialog.body) {
                        startingDialog.body.update(html);
                    } else {
                        startingDialog.html = html;
                    }
                }
                this.updateOnlineLinks(true);
            }, 
            stopping: function() {
                stoppingDialog.show();
            }, 
            stopped: function() {
                this.warn("Offline");
                stoppingDialog.hide();
                
                //if the current config is dirty, update the suite config
                if (this.configDirty == true) {
                    Ext.apply(this.suite.config, this.config); // TODO: extract just suite config?
                    this.configDirty = false;
                }
                
                this.updateOnlineLinks(false);
            },
            scope: this
        });

        og.Dashboard.superclass.constructor.call(this);
        
        Ext.onReady(this.createViewport, this);
    },
    
    getPreferences: function(key) {
        var preferences = og.util.tirun(function() {
            var db = Titanium.Database.open(this.dbName);
            db.execute("CREATE TABLE IF NOT EXISTS preferences (blob TEXT)");
            var results = db.execute("SELECT * FROM preferences");
            var preferences = Ext.decode(results.field(0)) || {};
            results.close();
            db.close();
            return preferences;
        }, this, function() {
            return this.DEFAULTS;
        });
        
        return key ? preferences[key] : preferences;      
    },
    
    setPreferences: function(preferences) {
        preferences = Ext.apply(this.getPreferences(), preferences);
        this.clearPreferences();
        og.util.tirun(function() {
            var db = Titanium.Database.open(this.dbName);
            db.execute("INSERT INTO preferences (blob) VALUES (?)", Ext.encode(preferences));
            db.close();
        }, this, function(){});
        
        return preferences;
    },
    
    clearPreferences: function() {
        og.util.tirun(function() {
            var db = Titanium.Database.open(this.dbName);
            db.execute("DROP TABLE IF EXISTS preferences");
            db.close();
        }, this, function(){});
        
        this.getPreferences();
    },
    
    createWorkingDialog: function(msg) {
        var dialog = new Ext.Window({
            title: "Working...",
            closeAction: "hide",
            bodyCssClass: "working-dialog",
            modal: true,
            constrain: true,
            html: msg
        });
        return dialog;
    }, 
    
    createViewport: function() {

        Ext.QuickTips.init();
        
        var dashPanelListeners = {
            render: {
                fn: function() {
                    this.processLinks();
                    this.renderConfigValues();
                },
                scope: this,
                delay: 1
            }
        };
        
        this.initControlPanel();
        this.initLogPanel();
        
        this.viewport = new Ext.Viewport({
            layout: "border",
            items: [{
                xtype: "container",
                cls: "app-panels-control",
                items: [this.controlPanel]                
            }, {
                xtype: "grouptabpanel",
                region: "center", 
                cls: "app-panels-wrap",
                tabWidth: 130,
                activeGroup: 0,
                items: [{
                    defaults: {
                        border: false, 
                        autoScroll: true,
                        listeners: dashPanelListeners
                    },
                    items: [{
                        title: "Dashboard",
                        tabTip: "OpenGeo Suite Dashboard",
                        cls: "dash-panel",
                        bodyStyle: '',
                        html: og.util.loadSync("app/markup/dash/main.html"),
                        id: "app-panels-dash-main"
                    },  {
                        title: "Components",
                        tabTip: "Learn about the components of the OpenGeo Suite",
                        cls: "dash-panel",
                        html: og.util.loadSync("app/markup/dash/components.html"),
                        id: "app-panels-dash-components"
                    }, {
                        xtype: "container",
                        layout: "fit",
                        title: "Logs",
                        tabTip: "View the logs",
                        cls: "dash-panel",
                        id: "app-panels-help-logs",
                        disabled: !window.Titanium,
                        items: [this.logPanel]
                    }, {
                        border: false,
                        autoScroll: true,
                        defaults: {border: false, autoScroll: true},
                        title: "Preferences", 
                        tabTip: "Configure the OpenGeo Suite",
                        cls: "dash-panel",
                        id: "app-panels-pref-main",
                        disabled: !window.Titanium,
                        listeners: {
                           render: {
                               fn: function() {
                                   this.processLinks();
                                   this.createPrefForm();
                               }, 
                               scope: this,
                               delay: 1
                           } 
                        }, 
                        items: [{
                            xtype: "box", 
                            autoEl: {
                                tag: "div",
                                html: og.util.loadSync("app/markup/pref/main.html")
                            }
                        }]
                    }]
                }, {
                    defaults: {
                        border: false, 
                        autoScroll: true,
                        listeners: dashPanelListeners
                    },
                    items: [{
                        title: "Documentation",
                        tabTip: "Read the full documentation for each component",
                        cls: "dash-panel",
                        id: "app-panels-help-main",
                        html: og.util.loadSync("app/markup/help/main.html")
                    },  {
                        title: "Getting Started",
                        tabTip: "A simple workflow to get started with the OpenGeo Suite",
                        cls: "dash-panel",
                        html: og.util.loadSync("app/markup/help/quickstart.html"),
                        id: "app-panels-dash-quickstart"
                    },  {
                        title: "FAQ",
                        tabTip: "Frequently Asked Questions",
                        cls: "dash-panel",
                        html: og.util.loadSync("app/markup/help/faq.html"),
                        id: "app-panels-help-faq"
                    }, {
                        title: "About",
                        tabTip: "For more information",
                        cls: "dash-panel",
                        html: og.util.loadSync("app/markup/help/opengeo.html"),
                        id: "app-panels-help-about"
                    }]
                }]
            }], 
            listeners: {
                render: {
                    fn: function() {
                        this.suite.run();                            
                    }, 
                    scope: this,
                    delay: 1
                }
            }
        });
        
        // parse hash to activate relevant tab
        this.openPanel(window.location.hash.substring(1));
        
        if (window.Titanium && this.getPreferences("helpOnStart")) {
            this.showStartHelp();
        }
        og.util.tirun(this.initStatsCollector, this, Ext.emptyFn);
        
    },
    
    showStartHelp: function() {
        var win = new Ext.Window({
            modal: true,
            title: "Welcome",
            html: og.util.loadSync("app/markup/help/start.html"),
            width: "50%",
            constrain: true,
            bbar: [" ", {
                xtype: "checkbox",
                boxLabel: "Show this dialog at startup",
                checked: this.getPreferences("helpOnStart"),
                handler: function(box, checked) {
                    this.setPreferences({helpOnStart: checked});
                },
                scope: this
            }, "->", {
                text: "Close",
                iconCls: "cancel-button",
                handler: function() {
                    win.close();
                }
            }]
        });
        win.show();
        this.processLinks(win.el.dom);
        this.renderConfigValues(win.el.dom);
        
        Ext.select("#app-start-pref-link").on({
            click: function() {
                win.close();
            }, 
            delay: 1
        });
    },
    
    createPrefForm: function() {
        
        var onlineDisabled = ["suite_port", "suite_stop_port", "pgsql_port"];
        this.suite.on({
            "started": function() {
                Ext.each(onlineDisabled, function(cmpId) {
                    var cmp = Ext.getCmp(cmpId);
                    if (cmp) {
                        cmp.setDisabled(true);
                        Ext.QuickTips.register({
                            target: cmp.el.dom.parentElement,
                            text: "Stop the Suite to modify this value."
                        });                        
                    }
                });
            },
            "stopped": function() {
                Ext.each(onlineDisabled, function(cmpId) {
                    var cmp = Ext.getCmp(cmpId);
                    if (cmp) {
                        cmp.setDisabled(false);
                        Ext.QuickTips.unregister(cmp.el.dom.parentElement);
                    }
                });
            },
            scope: this
        })
        
        this.prefPanel = new Ext.FormPanel({
            renderTo: "app-panels-pref-form",
            border: false,
            buttonAlign: "right",
            monitorValid: true,
            items: [{
                xtype: "fieldset",
                style: "margin-top: 0.5em;",
                collapsible: true,
                title: "Service Ports",
                defaultType: 'textfield',
                defaults: { 
                    width: 50
                },
                items: [{ 
                    xtype: "numberfield",
                    fieldLabel: "Primary Port",
                    id: "suite_port",
                    name: "suite_port",
                    allowDecimals: false,
                    allowBlank: false,
                    minValue: 1,
                    maxValue: 65535,
                    invalidText: "Invalid port number.",
                    value: this.config["suite_port"],
                    disabled: this.suite.online
                },  {
                    xtype: "numberfield",
                    fieldLabel: "Shutdown Port",
                    id: "suite_stop_port",
                    name: "suite_stop_port",
                    allowDecimals: false,
                    allowBlank: false,
                    minValue: 1,
                    maxValue: 65535,
                    invalidText: "Invalid port number.",
                    value: this.config["suite_stop_port"],
                    disabled: this.suite.online
                }]
            }, {
                xtype: "fieldset",
                style: "margin-top: 0.5em;",
                collapsible: true,
                title: "GeoServer",
                defaults: { 
                    width: 250,
                    allowBlank: false
                },
                items: [{ 
                    xtype: 'textfield',
                    fieldLabel: "Data Directory",
                    name: "geoserver_data_dir",
                    value: this.config["geoserver_data_dir"],
                    validationEvent: "change",
                    validator: function(value) {
                        var valid = true;
                        if (window.Titanium) {
                            var file = Titanium.Filesystem.getFile(value);
                            valid = file.exists() || "Directory does not exist.";
                        }
                        return valid;
                    }
                }]
            }, {
                xtype: "fieldset",
                style: "margin-top: 0.5em;",
                collapsible: true,
                title: "PostGIS",
                defaults: { 
                    width: 50
                },
                defaultType: "textfield",
                items: [{ 
                    xtype: "numberfield",
                    fieldLabel: "Port",
                    id: "pgsql_port",
                    name: "pgsql_port",
                    allowDecimals: false,
                    allowBlank: false,
                    minValue: 1,
                    maxValue: 65535,
                    invalidText: "Invalid port number.",
                    value: this.config["pgsql_port"],
                    disabled: this.suite.online
                }]
            }],
            buttons: [{
                text: "Save",
                formBind: true,
                handler: function(btn, evt) {
                    var form = this.prefPanel.getForm();
                    var config = this.config;
                    
                    // update suite config
                    config["suite_port"] = form.findField("suite_port").getValue();
                    config["suite_stop_port"] =  form.findField("suite_stop_port").getValue();
                    
                    // update geoserver config
                    config["geoserver_data_dir"] = form.findField("geoserver_data_dir").getValue();
                    
                    // update postgres port
                    config["pgsql_port"] = form.findField("pgsql_port").getValue();
                    
                    og.util.saveConfig(this.config, 'config.ini');
                    Ext.Msg.alert(
                        "Configuration saved", 
                        !this.suite.online ? "Your changes have been saved." : "The OpenGeo Suite must be restarted for changes to take effect."
                    );
                    
                    //if the suite is running then we need to keep the old
                    // config around in order to shut it down, so set the dirty
                    // flag and we update the suite config after it shuts down
                    if (this.suite.online == true) {
                        this.configDirty = true;
                    } else {
                        Ext.apply(this.suite.config, this.config);
                    }
                },
                scope: this
            }, {
                text: "Reset", 
                handler: function(btn, evt) {
                    this.prefPanel.getForm().reset();
                },
                scope: this
            }]
        })
        return this.prefPanel;
    }, 
    
    /** private: method[processLinks]
     *  :arg root: ``Element`` or ``String`` Optional element or element id
     *      that is the root of any elements that need behavior modification.
     *
     *  Add behavior to links after a panel renders.
     */
    processLinks: function(root) {
        var xlinks = Ext.select(".app-xlink", false, root);
        xlinks.on({
            click: function(evt, el) {
                var xEl = new Ext.Element(el);
                var follow = xEl.hasClass("app-online") ? this.suite.online : true;
                if (follow) {
                    var url;
                    if (el.href.indexOf("#") >= 0) {
                        var id = el.href.split("#").pop();
                        var path = this.config[id];
                        if (path) {
                            if (!path.match(/^(https?|file):\/\//)) {
                                if (window.Titanium) {
                                    var port = this.config["suite_port"];
                                    var host = this.config["suite_host"];
                                    url = "http://" + host + (port ? ":" + port : "") + path;                                    
                                } else {
                                    url = path;
                                }
                            }
                        }
                    }
                    if (!url) {
                        // href may be to arbitrary url
                        url = el.href;
                        el.href = "#";
                    }
                    this.openURL(url);
                }
                return follow;
            },
            scope: this
        });
        xlinks.removeClass("app-xlink");

        var ilinks = Ext.select(".app-ilink", false, root);
        ilinks.on({
            click: function(evt, el) {
                var id = el.href.split("#").pop();
                this.openPanel(id);
            },
            scope: this
        });
        ilinks.removeClass("app-ilink");
        
        var plinks = Ext.select(".app-plink", false, root);
        if (window.Titanium) {
            plinks.on({
                click: function(evt, el) {
                    var xEl = new Ext.Element(el);
                    var follow = xEl.hasClass("app-online") ? this.suite.online : true;
                    if (follow) {
                        var key = el.href.split("#").pop();
                        this.launchProcess(key);
                    }
                    return follow;
                },
                scope: this
            });
        } else {
            plinks.addClass("app-disabled-permanently");
        }
        plinks.removeClass("app-plink");        
        
        this.updateOnlineLinks(this.suite.online);
    },
    
    /** private: method[launchProcess]
     *  :arg key: ``String`` Configuration key for process.
     *  
     *  Launch a process identified by the given key.
     *  Key syntax: {env_key1:env_val2,env_key2:env_val2}config_key
     */
    launchProcess: function(key) {
        var match = key.match(/^(?:{\s*(.*?)\s*})?(\w+)/);
        if (match) {
            var env;
            if (match[1]) {
                // extract environment variables
                env = {};
                var pairs = match[1].split(/\s*,\s*/);
                var pair;
                for (var i=0, ii=pairs.length; i<ii; ++i) {
                    pair = pairs[i].split(/\s*:\s*/);
                    env[pair[0]] = this.config[pair[1]] || pair[1];
                }
            }
            var app = this.config[match[2]] || match[2];
            var file = Titanium.Filesystem.getFile(app);
            if (file.exists()) {
                var process = Titanium.Process.createProcess({
                    args: [app], env: env
                });
                process.launch();
            } else {
                Ext.Msg.alert(
                    "Warning",
                    "Could not launch application: " + app
                );
            }
        }
    },
    
    /** private: method[renderConfigValues]
     *  :arg root: ``Element`` or ``String`` Optional element or element id
     *      that is the root of any elements that need behavior modification.
     *
     *  Replace content of elements with configuration values.
     */
    renderConfigValues: function(root) {
        var els = Ext.select(".app-config-value", false, root);
        els.each(function(el) {
            var id = el.dom.id;
            if (id) {
                var parts = id.split("-");
                if (parts.length > 1) {
                    var key = parts.pop();
                    var value = this.config[key];
                    if (value) {
                        el.dom.innerHTML = value;
                    }
                }
            }
        }, this);
        els.removeClass("app-config-value");
    },
    
    initControlPanel: function() {

        this.messageBox = new Ext.BoxComponent({
            autoEl: {
                tag: "div",
                html: "",
                cls: "app-panels-control-msg"
            }
        });
        
        var controlButton = new Ext.Button({
            text: !!this.suite.online ? "Shutdown" : "Start",
            enableToggle: true,
            cls: "control-button",
            pressed: !!this.suite.online,
            hidden: !window.Titanium,
            handler: function(btn) {
                if (btn.pressed) {
                    controlButton.setText("Shutdown");
                    this.suite.start();                        
                } else {
                    controlButton.setText("Start");
                    this.suite.stop();                        
                }
            },
            scope: this
        })

        this.suite.on({
            starting: function() {
                controlButton.setText("Starting ...");
                controlButton.disable();
            },
            started: function() {
                controlButton.enable();
                controlButton.toggle(true);
                controlButton.setText("Shutdown");
            },
            stopping: function() {
                controlButton.setText("Shutting down ...");
                controlButton.disable();
            },
            stopped: function() {
                controlButton.enable();
                controlButton.toggle(false);
                controlButton.setText("Start");
            }
        });

        this.controlPanel = new Ext.Container({
            layout: "hbox",
            layoutConfig: {
                align: "middle"
            },
            items: [
                {
                    xtype: "box",
                    autoEl: {
                        tag: "div",
                        html: "<strong>OpenGeo Suite " + (("ee" == this.buildProfile) ? "Enterprise Edition " : "") + "<small ext:qtip='Revision " + this.revision + "'>" + this.config["suite_version"] + "</small></strong>"
                    }
                },
                controlButton
            ]
        });

    },
    
    initLogPanel: function() {

        this.logTextArea = new Ext.form.TextArea({
            readOnly: true,
            border: false,
            style: {
                padding: 10
            }
        });
        
        var refreshButton = new Ext.Button({
            text: "Refresh",
            tooltip: "View the logs",
            iconCls: "refresh-button",
            handler: function() {
                 this.refreshLog();
            },
            scope: this
        });
        
        var viewButton = new Ext.Button({
            text: "Open",
            tooltip: "Open logs with default system viewer",
            iconCls: "view-button",
            handler: function() {
                this.openLog();
            }, 
            scope: this
        });
        
        var refreshing = false;
        this.logPanel = new Ext.Panel({
            border: false,
            layout: "fit",
            items: [this.logTextArea],
            bbar: [
                "->",
                refreshButton,
                viewButton
            ],
            listeners: {
                afterlayout: function() {
                    if (!refreshing) {
                        refreshing = true;
                        this.refreshLog();
                        refreshing = false;
                    }
                },
                scope: this
            } 
        });
    }, 
    
    /**
     * api: method[refreshLog]
     * 
     * Refreshes the log view by reading from the suite log file and 
     * displaying the contents in the log view text area.
     */
    refreshLog: function() {

        //start a worker to read the log
        og.util.tirun(function() {
            var worker = Titanium.Worker.createWorker("app/script/workers/log.js");
            var self = this;
            worker.onmessage = function(e) {
                var area = self.logTextArea;
                area.setValue(e.message);
                area.el.dom.scrollTop = area.el.dom.scrollHeight
                worker.terminate();
            }
            worker.start();
            worker.postMessage({path: this.suite.getLogFile()});
        }, this);

    }, 
    
    /** private: method[initStatsCollector]
     *
     *  Initialize the stats collection worker.
     */
    initStatsCollector: function() {
        
        var worker = Titanium.Worker.createWorker("app/script/workers/stats.js");
        var self = this;
        
        worker.onmessage = function(e) {
            if (e.message && e.message.stats) {
                self.updateStats(e.message.stats);
            }
        }
        worker.start();
        
        var timer;
        var startCollecting = function() {
            worker.postMessage({collect: true, config: self.config});
            timer = window.setInterval(function() {
                worker.postMessage({
                    collect: true,
                    config: self.config
                });
            }, 10000);
        };
        var stopCollecting = function() {
            window.clearInterval(timer);
        };
        
        this.suite.on({
            started: startCollecting,
            stopping: stopCollecting
        });
        
        if (this.suite.online) {
            startCollecting();
        }
        
    },
    
    updateStats: function(stats) {

        var layerEls = Ext.select(".app-stats-layers");
        layerEls.each(function(el) {
            el.dom.innerHTML = stats.layers || "0"
        });

        var mapEls = Ext.select(".app-stats-maps");
        mapEls.each(function(el) {
            el.dom.innerHTML = stats.maps || "0"
        });

        var storeEls = Ext.select(".app-stats-stores");
        storeEls.each(function(el) {
            el.dom.innerHTML = stats.stores || "0"
        });


    },
    
    /**
     * api: method[openLog]
     * 
     * Opens the log file in the default system editor.
     */
    openLog: function() {
        og.util.tirun(
            function() {
                var f = Titanium.Filesystem.getFile(this.suite.getLogFile());
                if (f.exists() === true) {
                    var path = f.nativePath().replace(" ", "%20");
                    var url;
                    if (this.platform && this.platform.toURL) {
                        url = this.platform.toURL(path);
                    }
                    else {
                        url = "file://" + path;
                    }
                    Titanium.Desktop.openURL(url);
                }
            }, 
            this
        );
    }, 
    
    /**
     * api: method[clearLog]
     *
     * Clears the log view by clearing the contents of teh log view text area.
     */
    clearLog: function() {
        this.logTextArea.setValue("");
    }, 
    
    /** private method[updateOnlineLinks]
     *  :arg online: ``Boolean`` Flag inidciating if services are online.
     * 
     *  Enables/disables all links that require online services to be active.
     */
    updateOnlineLinks: function(online) {
        var olinks = Ext.select(".app-online");
        olinks.each(function(el, c, idx) {
            var dom = el.dom;
            if (online == true) {
                el.removeClass("app-disabled");
                Ext.QuickTips.unregister(dom);
                var href = dom.getAttribute("href_off");
                if (href) {
                    dom.setAttribute("href", href);
                    dom.removeAttribute("href_off");
                }
            } else {
                el.addClass("app-disabled");
                Ext.QuickTips.register({
                    target: dom,
                    text: "Start the OpenGeo Suite to activate this link."
                });
                var href = dom.getAttribute("href");
                if (href && !dom.getAttribute("href_off")) {
                    dom.setAttribute("href_off", href);
                    dom.setAttribute("href", "#");
                }
            }
        });
    }, 

    openURL: function(url) {
        url = encodeURI(url);
        if (window.Titanium) {
            Titanium.Desktop.openURL(url);
        } else {
            window.open(url);
        }
    },
    
    openPanel: function(id) {
        var panel = Ext.getCmp(id);
        if (panel && panel.ownerCt) {
            panel.ownerCt.setActiveTab(panel);
        }
    },
    
    /** api method[info]
     *  :arg msg: ``String`` The message.
     *
     *  Displays a message in the status panel to relay information.
     */
    info: function(msg) {
        this.message(msg, "info");
    }, 
    
    /** api method[warn]
     *  :arg msg: ``String`` The message.
     *
     *  Displays a message in the status panel to indicate a warning state.
     */
    warn: function(msg) {
        this.message(msg, "warn");
    }, 
    
    /** api method[ok]
     *  :arg msg: ``String`` The message.
     *
     *  Displays a message in the status panel to indicate an ok state.
     */
    ok: function(msg) {
        this.message(msg, "ok");
    }, 
    
    /** private method[message]
     *  :arg msg: ``String`` The message.
     *
     *  Displays a message in the status panel.
     */
    message: function(msg, cls) {
        // TODO: decide whether we need a regular place for messages
        
        // var classes = this.messageBox.el.dom.getAttribute("class").split(" ");
        // for (var i = 0; i < classes.length; i++) {
        //     if (classes[i].search("app-msg-") != -1){
        //         this.messageBox.el.removeClass(classes[i]);
        //     }
        // }
        // this.messageBox.el.addClass("app-msg-"+cls);
        // this.messageBox.el.dom.innerHTML = msg;
    }

});
