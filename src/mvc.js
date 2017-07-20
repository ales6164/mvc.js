var P = (function () {
    function P() {
    }
    P.init = function (selector) {
        if (selector === void 0) { selector = '.js-l'; }
        P.selector = selector;
        P.initComponents(window.document);
    };
    P.plugin = function (name, plugin) {
        P.plugins[name] = plugin;
    };
    P.initComponents = function (dom) {
        var items = dom.querySelectorAll(P.selector);
        for (var i = 0; i < items.length; i++) {
            var el = items.item(i);
            if (el.hasAttribute("data-c")) {
                var c = new Component(el);
                P.components.push(c);
            }
            else {
                console.error("Missing 'data-c' attribute: " + el);
            }
            /*let c = item.getAttribute('data-c');
            if (c != null) {
                let templ = window.document.querySelector('template#' + c);

                if (templ != null) {
                    let component = new Component(c, item, templ.innerHTML);
                    MVC.components.push(component)
                }
            }*/
        }
    };
    return P;
}());
P.components = [];
P.plugins = {};
var Component = (function () {
    function Component(el) {
        this.el = el;
        this.selector = el.getAttribute("data-c");
        // let's eval script
        if (P.plugins.hasOwnProperty(this.selector)) {
            var ret = P.plugins[this.selector].init.call(P.plugins[this.selector], el);
        }
    }
    return Component;
}());
var _Plugin = (function () {
    function _Plugin() {
    }
    _Plugin.prototype.init = function () {
    };
    return _Plugin;
}());
/*

 var APP = new function () {
 this.dom = {
 components: [],
 links: [],
 outlets: []
 }
 this.links = []
 this.outlets = {}
 this.components = {}
 this.models = {}
 this.scripts = {}
 this.handler = {}
 this.configuration = {
 basePath: '/',
 templatesPath: 'templates/',
 routerOutletAttr: 'router-outlet',
 componentAttr: 'component',
 linkAttr: 'link'
 }
 this.dataBank = []

 this.Configuration = function (o) {
 for (var key in o) {
 if (o.hasOwnProperty(key)) {
 this.configuration[key] = o[key]
 }
 }
 }

 this.Component = function (id, o) {
 if (o && id && o.templateUrl) {
 if (this.components.hasOwnProperty(id)) {
 console.log("Component '" + id + "' already exists. Rewriting.")
 }
 this.components[id] = o
 } else {
 console.error('Invalid component', id, o)
 }
 }

 this.Model = function (id, o) {
 if (o && id && o.url) {
 if (this.models.hasOwnProperty(id)) {
 console.log("Model '" + id + "' already exists. Rewriting.")
 }
 this.models[id] = new Model(o)
 } else {
 console.error('Invalid model', id, o)
 }
 return this.models[id]
 }

 this.Script = function (id, o) {
 if (o && id) {
 if (this.scripts.hasOwnProperty(id)) {
 console.log("Script  with id '" + id + "' already exists. Rewriting.")
 }
 this.scripts[id] = o
 } else {
 console.error('Invalid script', id)
 }
 }

 this.Handle = function (o) {

 // parse and recreate config for use
 this.handler = Object.keys(o)
 // sort longest path first
 .sort(function (a, b) {
 return b.length - a.length;
 })
 // convert into more usable format
 .map(function (path) {
 return {
 // create regex
 vars: path.match(/:[^\s/]+/g),
 path: new RegExp("^" + path.replace(/:[^\s/]+/g, '([\\w-]+)') + "$"),
 module: o[path]
 };
 });
 }

 this.init = function () {
 // todo: check if all functionalities will work otherwise use compatibility
 console.log("INITING");

 this.renderComponents(this.queryComponents(document), function () {
 APP.navigate(document.location.pathname)
 })

 window.onpopstate = function (event) {
 console.log("navigating to", document.location)
 APP.navigate(document.location.pathname)
 };
 }

 this.queryComponents = function (d) {
 return d.querySelectorAll('[data-' + this.configuration.componentAttr + ']');
 }

 this.queryLinks = function (d) {
 return d.querySelectorAll('[data-' + this.configuration.linkAttr + ']');
 }

 this.queryOutlets = function (d) {
 return d.querySelectorAll('[data-' + this.configuration.routerOutletAttr + ']');
 }

 this.navigate = function (url, data, pushState) {
 var str = '/^' + this.configuration.basePath + '/';
 var loc = url.replace(new RegExp(str, "g"), '')

 // loop through all routes, longest first
 for (var i = 0, l = this.handler.length; i < l; i++) {
 // parse if possible
 var found = url.match(this.handler[i].path);
 if (found) { // parsed successfully
 var args = found.slice(1);
 var h = this.handler[i];
 var data = {};

 if (args.length > 0 && h.vars.length > 0) {
 var keys = h.vars.toString().split(',')
 if (keys.length !== args.length) {
 console.error("Error while assigning attributes")
 }
 for (var j = 0; j < args.length; j++) {
 data[keys[j].slice(1)] = args[j]
 }
 }

 var moduleData = {}
 if (h.module.hasOwnProperty('data')) {
 for (var dataKey in h.module.data) {
 moduleData[dataKey] = h.module.data[dataKey].getUrl(data)
 }
 }

 this.renderComponentInLayout(this.outlets['default'], moduleData, h.module.component)


 // it pushes state only if it's a new state; fyi. data is always reloaded
 if (pushState && window.location.pathname !== loc) window.history.pushState('', '', loc);

 break; // ignore the rest of the paths
 }
 }
 }

 this.listener = function (e) {
 e.preventDefault();
 var href = this.getAttribute("href");
 if (this.dataset.hasOwnProperty('href')) {
 // rewrite href if data-href exists
 href = this.dataset['href']
 }
 if (this.dataset.hasOwnProperty('link') && this.dataset.link.length > 0) {
 // rewrite href if data-href exists
 //href = this.dataset['href']
 console.log("link has data", this.dataset.link)
 }
 APP.navigate(href, {}, true)
 }

 this.registerLinks = function (els) {
 for (var i = 0; i < this.links.length; i++) {
 this.links[i].removeEventListener('click', this.listener)
 }

 this.links = [];

 for (var i = 0; i < els.length; i++) {
 els[i].addEventListener('click', this.listener, false);
 this.links.push(els[i]);
 }
 }

 this.registerOutlets = function (els) {
 for (var i = 0; i < els.length; i++) {
 var node = els[i];
 var outlet = node.dataset[this.configuration.routerOutletAttr];
 if (outlet && outlet.length > 0) {
 this.outlets[outlet] = node;
 } else {
 this.outlets['default'] = node;
 }
 }
 }

 this.renderComponents = function (els, cb) {
 var count = els.length;
 for (var i = 0; i < els.length; i++) {
 var node = els[i];
 var selector = node.dataset[this.configuration.componentAttr];

 if (!this.components.hasOwnProperty(selector)) {
 console.error("Error while rendering: component with id '" + selector + "' doesn't exist.");
 continue
 }

 var c = this.components[selector];
 if (!c.hasOwnProperty('template')) {
 (function (app, c, node, count) {
 APPHelper.fetch(app.configuration.basePath + app.configuration.templatesPath + c.templateUrl)
 .success(function (html) {
 count -= 1;

 c.template = html;
 app.insertTemplate(node, c.template)

 // render children as well
 var d = new DOMParser().parseFromString(c.template, "text/html");
 app.renderComponents(app.queryComponents(d))

 if (count === 0) {
 // do this only once after all components are loaded into dom
 APP.registerLinks(APP.queryLinks(document))
 APP.registerOutlets(APP.queryOutlets(document))
 cb()
 }
 })
 .error(function (r) {
 count -= 1;
 console.error('Error while fetching template', r)
 })
 })(this, c, node, count)
 } else {
 this.insertTemplate(node, c.template)

 // render children as well
 var d = new DOMParser().parseFromString(c.template, "text/html");
 this.renderComponents(this.queryComponents(d))
 }
 }
 }

 this.insertTemplate = function (node, template) {
 node.innerHTML = template;
 //console.log("inersting template", node)

 var runs = node.querySelectorAll('[data-run]');
 console.log("runs",runs)

 for(var i = 0; i < runs.length; i++) {
 var run = runs[i].dataset['run'];
 if(!this.scripts.hasOwnProperty(run)) {
 console.log("Script for data-run target '" + run + "' doesn't exist");
 continue;
 }
 this.scripts[run](runs[i], node);
 }
 }

 this.renderComponentInLayout = function (node, data, selector) {
 if (!this.components.hasOwnProperty(selector)) {
 console.error("Error while rendering: component with id '" + selector + "' doesn't exist.");
 return
 }

 var render = function (app, template, data, layout) {
 if (data && !isEmpty(data)) {
 var count = 0;
 for (var key in data) {
 count += 1;
 APPHelper.fetch(data[key])
 .success(function (d) {
 count -= 1;
 data[key] = JSON.parse(d);
 if (count === 0) {
 Mustache.parse(template)
 render(app, Mustache.render(template, data), null, layout)
 }
 })
 .error(function (r) {
 console.error("Error while fetching", data[key], r)
 })
 }
 } else {
 app.insertTemplate(layout, template)

 // render children as well
 var d = new DOMParser().parseFromString(template, "text/html");
 app.renderComponents(app.queryComponents(d))

 app.registerLinks(app.queryLinks(document))
 app.registerOutlets(app.queryOutlets(document))
 }
 }

 var c = this.components[selector];
 if (!c.hasOwnProperty('template')) {
 (function (app, c, data, node) {
 APPHelper.fetch(app.configuration.basePath + app.configuration.templatesPath + c.templateUrl)
 .success(function (html) {
 c.template = html;
 render(app, html, data, node)
 })
 .error(function (r) {
 console.error('Error while fetching template', r)
 })
 })(this, c, data, node)
 } else {
 render(this, c.template, data, node)
 }

 }
 };

 function Model(o, params) {
 this.o = o;
 this.params = params;

 this.with = function (params) {
 return new Model(this.o, params)
 }

 this.getUrl = function (data) {
 var newUrl = this.o.url;

 if (this.params) {
 var as = this.params.split(',')
 for (var i = 1; i < as.length + 1; i++) {
 var a = as[i - 1];
 if (!data.hasOwnProperty(a)) {
 console.log("Handler missing parameter", a)
 newUrl = newUrl.replace('$' + i, '')
 } else {
 newUrl = newUrl.replace('$' + i, data[a])
 }
 }
 }

 return newUrl
 }

 this.fetch = function (cb) {
 //APPHelper.fetch(this.o.url, cb)
 }
 }

 var APPHelper = new function () {

 this.fetch = function (url, method, obj) {
 var job = new AsyncJob();
 var xhr = new XMLHttpRequest();
 var m = 'GET';
 if(method) {
 m = method;
 }
 xhr.open(m, url, true);
 xhr.onreadystatechange = function () {
 if (this.readyState !== 4) {
 return
 }
 if (this.status !== 200) {
 job.onError(this);
 return
 }

 job.onSuccess(this.responseText, this)
 };
 xhr.send(obj);
 return job
 }
 };


 function AsyncJob() {
 this.listeners = {
 error: [],
 success: []
 };

 this.success = function (cb) {
 this.listeners.success.push(cb)
 return this;
 }

 this.error = function (cb) {
 this.listeners.error.push(cb)
 return this;
 }

 this.onSuccess = function (a, b) {
 for (var i = 0; i < this.listeners.success.length; i++) {
 var f = this.listeners.success[i];
 if (typeof f === 'function') {
 f(a, b)
 }
 }
 }

 this.onError = function (a) {
 for (var i = 0; i < this.listeners.error.length; i++) {
 var f = this.listeners.error[i];
 if (typeof f === 'function') {
 f(a)
 }
 }
 }

 }


 function isEmpty(obj) {
 for (var prop in obj) {
 if (obj.hasOwnProperty(prop))
 return false;
 }

 return JSON.stringify(obj) === JSON.stringify({});
 }*/
//# sourceMappingURL=mvc.js.map