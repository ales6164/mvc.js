/**
 * Script (without dependencies) that you can include on any website, without any configuration, and it works
 * out of the box.
 *
 * It has routing and rendering functions.
 */

class R {
    containers: { [key: string]: Element };
    handler: { [key: string]: any };
    linkSelector: string;
    page: string; // current page

    constructor(public doc: Document, public config: _R_C) {
        this.containers = {};
        this.handler = {};
    }

    static init(containerSelector: string, config?: _R_C) {
        let c: _R_C = new _R_C();
        if (config != null) {
            for (let k in config) {
                c[k] = config[k]
            }
        }

        let r = new R(window.document, c);
        r.containers[c.containerName] = r.doc.querySelector(containerSelector);
        r.linkSelector = c.linkSelector;
        r.page = r.containers[c.containerName].getAttribute('data-page');
        r.registerLinks(r.doc);

        window.addEventListener('popstate', function (e) {
            r.navigate(document.location.pathname)
        });

        return r;
    }

    registerLinks(el: Document | Element = window.document) {
        let it = this;
        let arr = el.querySelectorAll(this.linkSelector);
        for (let i = 0; i < arr.length; i++) {
            let item = arr.item(i);

            // Get all attrs from clicked tag
            let href: string = item.getAttribute('href') || item.getAttribute('data-href') || '/';
            let page: string = item.getAttribute('data-page') || 'not-found';
            let container: string = item.getAttribute('data-container') || 'default';

            this.handler[href] = {page: page, container: container};

            item.addEventListener('click', function (e: Event) {
                e.preventDefault();
                let el: Element = this;

                // Get all attrs from clicked tag
                let href: string = el.getAttribute('href') || el.getAttribute('data-href') || '/';

                it.navigate(href)
            });

            // Save HTML of current SSR loaded page
            //if (window.location.pathname === href) it.storage[page] = it.containers[container].innerHTML;
        }
    }

    navigate(path: string) {
        // Push state
        let p = this.handler[path] || {page: this.page, container: 'default'};

        if (window.location.pathname !== path) window.history.pushState(p.page, p.page, path);

        // Load page
        this.loadPage(p.page, p.container)
    }

    loadPage(page: string, container: string = 'default') {
        this.containers[container].setAttribute('data-page', page);
        if (_R_P.storage.hasOwnProperty(page)) {
            this.containers[container].innerHTML = _R_P.storage[page].template;
            R.onLoaded(this.containers[container]);
            return;
        }
        let it = this;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/.p_S/' + page, true);
        xhr.onreadystatechange = function () {
            if (this.readyState !== 4) {
                return
            }
            if (this.status !== 200) {
                console.error(this);
                return
            }

            // Success
            console.log("Network loaded", page);

            let r_p = new _R_P(page, this.responseText);

            it.containers[container].innerHTML = r_p.template;

            R.onLoaded(it.containers[container]);
        };

        // User can modify the request before send()
        this.config.middleware(xhr);

        xhr.send();
    }

    static onLoaded(el: Element) {
        if (P != null) {
            try {
                P.initComponents(el);
            } catch (e) {
            }
        }
    }
}

class _R_P {
    _template: HTMLElement;
    _style: HTMLElement;
    _script: HTMLElement;

    static storage: { [key: string]: _R_P } = {};

    constructor(public name: string, public html: string) {
        this.save(name, html)
    }

    save(name: string, html: string) {
        let el = document.createElement('html');
        el.innerHTML = html;

        this._template = el.querySelector('template');
        this._style = el.querySelector('style');
        this._script = el.querySelector('script');

        _R_P.storage[name] = this;
    }

    get template() {
        return this._template != null ? this._template.innerHTML : ''
    }

    get style() {
        return this._style != null ? this._style.innerHTML : ''
    }

    get script() {
        return this._script != null ? this._script.innerHTML : ''
    }

    static load(name: string) {
        let tem = window.document.querySelector('template#' + '_p-' + name);
        if (tem != null) {
            return new _R_P(name, tem.innerHTML)
        }
        return null
    }
}

class _R_C {
    containerName: string = 'default';
    linkSelector: string = '.js-r';

    middleware(xhr: XMLHttpRequest) {

    }
}