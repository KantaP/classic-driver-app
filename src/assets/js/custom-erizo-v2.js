var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(m, q, h) {
    m != Array.prototype && m != Object.prototype && (m[q] = h.value)
};
$jscomp.getGlobal = function(m) {
    return "undefined" != typeof window && window === m ? m : "undefined" != typeof global && null != global ? global : m
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function() {
    $jscomp.initSymbol = function() {};
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol)
};
$jscomp.Symbol = function() {
    var m = 0;
    return function(q) {
        return $jscomp.SYMBOL_PREFIX + (q || "") + m++
    }
}();
$jscomp.initSymbolIterator = function() {
    $jscomp.initSymbol();
    var m = $jscomp.global.Symbol.iterator;
    m || (m = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
    "function" != typeof Array.prototype[m] && $jscomp.defineProperty(Array.prototype, m, {
        configurable: !0,
        writable: !0,
        value: function() {
            return $jscomp.arrayIterator(this)
        }
    });
    $jscomp.initSymbolIterator = function() {}
};
$jscomp.arrayIterator = function(m) {
    var q = 0;
    return $jscomp.iteratorPrototype(function() {
        return q < m.length ? {
            done: !1,
            value: m[q++]
        } : {
            done: !0
        }
    })
};
$jscomp.iteratorPrototype = function(m) {
    $jscomp.initSymbolIterator();
    m = {
        next: m
    };
    m[$jscomp.global.Symbol.iterator] = function() {
        return this
    };
    return m
};
$jscomp.makeIterator = function(m) {
    $jscomp.initSymbolIterator();
    var q = m[Symbol.iterator];
    return q ? q.call(m) : $jscomp.arrayIterator(m)
};
$jscomp.arrayFromIterator = function(m) {
    for (var q, h = []; !(q = m.next()).done;) h.push(q.value);
    return h
};
$jscomp.arrayFromIterable = function(m) {
    return m instanceof Array ? m : $jscomp.arrayFromIterator($jscomp.makeIterator(m))
};
$jscomp.polyfill = function(m, q, h, f) {
    if (q) {
        h = $jscomp.global;
        m = m.split(".");
        for (f = 0; f < m.length - 1; f++) {
            var g = m[f];
            g in h || (h[g] = {});
            h = h[g]
        }
        m = m[m.length - 1];
        f = h[m];
        q = q(f);
        q != f && null != q && $jscomp.defineProperty(h, m, {
            configurable: !0,
            writable: !0,
            value: q
        })
    }
};
$jscomp.polyfill("Array.from", function(m) {
    return m ? m : function(m, h, f) {
        $jscomp.initSymbolIterator();
        h = null != h ? h : function(a) {
            return a
        };
        var g = [],
            d = m[Symbol.iterator];
        if ("function" == typeof d)
            for (m = d.call(m); !(d = m.next()).done;) g.push(h.call(f, d.value));
        else {
            d = m.length;
            for (var a = 0; a < d; a++) g.push(h.call(f, m[a]))
        }
        return g
    }
}, "es6", "es3");
$jscomp.iteratorFromArray = function(m, q) {
    $jscomp.initSymbolIterator();
    m instanceof String && (m += "");
    var h = 0,
        f = {
            next: function() {
                if (h < m.length) {
                    var g = h++;
                    return {
                        value: q(g, m[g]),
                        done: !1
                    }
                }
                f.next = function() {
                    return {
                        done: !0,
                        value: void 0
                    }
                };
                return f.next()
            }
        };
    f[Symbol.iterator] = function() {
        return f
    };
    return f
};
$jscomp.polyfill("Array.prototype.keys", function(m) {
    return m ? m : function() {
        return $jscomp.iteratorFromArray(this, function(m) {
            return m
        })
    }
}, "es6", "es3");
$jscomp.owns = function(m, q) {
    return Object.prototype.hasOwnProperty.call(m, q)
};
$jscomp.polyfill("WeakMap", function(m) {
    function q(a) {
        $jscomp.owns(a, f) || $jscomp.defineProperty(a, f, {
            value: {}
        })
    }

    function h(a) {
        var e = Object[a];
        e && (Object[a] = function(a) {
            q(a);
            return e(a)
        })
    }
    if (function() {
            if (!m || !Object.seal) return !1;
            try {
                var a = Object.seal({}),
                    e = Object.seal({}),
                    k = new m([
                        [a, 2],
                        [e, 3]
                    ]);
                if (2 != k.get(a) || 3 != k.get(e)) return !1;
                k.delete(a);
                k.set(e, 4);
                return !k.has(a) && 4 == k.get(e)
            } catch (b) {
                return !1
            }
        }()) return m;
    var f = "$jscomp_hidden_" + Math.random().toString().substring(2);
    h("freeze");
    h("preventExtensions");
    h("seal");
    var g = 0,
        d = function(a) {
            this.id_ = (g += Math.random() + 1).toString();
            if (a) {
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                a = $jscomp.makeIterator(a);
                for (var e; !(e = a.next()).done;) e = e.value, this.set(e[0], e[1])
            }
        };
    d.prototype.set = function(a, e) {
        q(a);
        if (!$jscomp.owns(a, f)) throw Error("WeakMap key fail: " + a);
        a[f][this.id_] = e;
        return this
    };
    d.prototype.get = function(a) {
        return $jscomp.owns(a, f) ? a[f][this.id_] : void 0
    };
    d.prototype.has = function(a) {
        return $jscomp.owns(a, f) && $jscomp.owns(a[f], this.id_)
    };
    d.prototype.delete =
        function(a) {
            return $jscomp.owns(a, f) && $jscomp.owns(a[f], this.id_) ? delete a[f][this.id_] : !1
        };
    return d
}, "es6", "es3");
$jscomp.MapEntry = function() {};
$jscomp.polyfill("Map", function(m) {
    if (!$jscomp.ASSUME_NO_NATIVE_MAP && function() {
            if (!m || !m.prototype.entries || "function" != typeof Object.seal) return !1;
            try {
                var a = Object.seal({
                        x: 4
                    }),
                    k = new m($jscomp.makeIterator([
                        [a, "s"]
                    ]));
                if ("s" != k.get(a) || 1 != k.size || k.get({
                        x: 4
                    }) || k.set({
                        x: 4
                    }, "t") != k || 2 != k.size) return !1;
                var b = k.entries(),
                    c = b.next();
                if (c.done || c.value[0] != a || "s" != c.value[1]) return !1;
                c = b.next();
                return c.done || 4 != c.value[0].x || "t" != c.value[1] || !b.next().done ? !1 : !0
            } catch (t) {
                return !1
            }
        }()) return m;
    $jscomp.initSymbol();
    $jscomp.initSymbolIterator();
    var q = new WeakMap,
        h = function(a) {
            this.data_ = {};
            this.head_ = d();
            this.size = 0;
            if (a) {
                a = $jscomp.makeIterator(a);
                for (var e; !(e = a.next()).done;) e = e.value, this.set(e[0], e[1])
            }
        };
    h.prototype.set = function(a, k) {
        var b = f(this, a);
        b.list || (b.list = this.data_[b.id] = []);
        b.entry ? b.entry.value = k : (b.entry = {
            next: this.head_,
            previous: this.head_.previous,
            head: this.head_,
            key: a,
            value: k
        }, b.list.push(b.entry), this.head_.previous.next = b.entry, this.head_.previous = b.entry, this.size++);
        return this
    };
    h.prototype.delete =
        function(a) {
            a = f(this, a);
            return a.entry && a.list ? (a.list.splice(a.index, 1), a.list.length || delete this.data_[a.id], a.entry.previous.next = a.entry.next, a.entry.next.previous = a.entry.previous, a.entry.head = null, this.size--, !0) : !1
        };
    h.prototype.clear = function() {
        this.data_ = {};
        this.head_ = this.head_.previous = d();
        this.size = 0
    };
    h.prototype.has = function(a) {
        return !!f(this, a).entry
    };
    h.prototype.get = function(a) {
        return (a = f(this, a).entry) && a.value
    };
    h.prototype.entries = function() {
        return g(this, function(a) {
            return [a.key,
                a.value
            ]
        })
    };
    h.prototype.keys = function() {
        return g(this, function(a) {
            return a.key
        })
    };
    h.prototype.values = function() {
        return g(this, function(a) {
            return a.value
        })
    };
    h.prototype.forEach = function(a, k) {
        for (var b = this.entries(), c; !(c = b.next()).done;) c = c.value, a.call(k, c[1], c[0], this)
    };
    h.prototype[Symbol.iterator] = h.prototype.entries;
    var f = function(e, k) {
            var b = k && typeof k;
            "object" == b || "function" == b ? q.has(k) ? b = q.get(k) : (b = "" + ++a, q.set(k, b)) : b = "p_" + k;
            var c = e.data_[b];
            if (c && $jscomp.owns(e.data_, b))
                for (e = 0; e < c.length; e++) {
                    var d =
                        c[e];
                    if (k !== k && d.key !== d.key || k === d.key) return {
                        id: b,
                        list: c,
                        index: e,
                        entry: d
                    }
                }
            return {
                id: b,
                list: c,
                index: -1,
                entry: void 0
            }
        },
        g = function(a, k) {
            var b = a.head_;
            return $jscomp.iteratorPrototype(function() {
                if (b) {
                    for (; b.head != a.head_;) b = b.previous;
                    for (; b.next != b.head;) return b = b.next, {
                        done: !1,
                        value: k(b)
                    };
                    b = null
                }
                return {
                    done: !0,
                    value: void 0
                }
            })
        },
        d = function() {
            var a = {};
            return a.previous = a.next = a.head = a
        },
        a = 0;
    return h
}, "es6", "es3");
$jscomp.polyfill("Array.prototype.values", function(m) {
    return m ? m : function() {
        return $jscomp.iteratorFromArray(this, function(m, h) {
            return h
        })
    }
}, "es8", "es3");
$jscomp.findInternal = function(m, q, h) {
    m instanceof String && (m = String(m));
    for (var f = m.length, g = 0; g < f; g++) {
        var d = m[g];
        if (q.call(h, d, g, m)) return {
            i: g,
            v: d
        }
    }
    return {
        i: -1,
        v: void 0
    }
};
$jscomp.polyfill("Array.prototype.find", function(m) {
    return m ? m : function(m, h) {
        return $jscomp.findInternal(this, m, h).v
    }
}, "es6", "es3");
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill("Promise", function(m) {
    function q() {
        this.batch_ = null
    }

    function h(a) {
        return a instanceof g ? a : new g(function(e, k) {
            e(a)
        })
    }
    if (m && !$jscomp.FORCE_POLYFILL_PROMISE) return m;
    q.prototype.asyncExecute = function(a) {
        null == this.batch_ && (this.batch_ = [], this.asyncExecuteBatch_());
        this.batch_.push(a);
        return this
    };
    q.prototype.asyncExecuteBatch_ = function() {
        var a = this;
        this.asyncExecuteFunction(function() {
            a.executeBatch_()
        })
    };
    var f = $jscomp.global.setTimeout;
    q.prototype.asyncExecuteFunction = function(a) {
        f(a,
            0)
    };
    q.prototype.executeBatch_ = function() {
        for (; this.batch_ && this.batch_.length;) {
            var a = this.batch_;
            this.batch_ = [];
            for (var e = 0; e < a.length; ++e) {
                var k = a[e];
                delete a[e];
                try {
                    k()
                } catch (b) {
                    this.asyncThrow_(b)
                }
            }
        }
        this.batch_ = null
    };
    q.prototype.asyncThrow_ = function(a) {
        this.asyncExecuteFunction(function() {
            throw a;
        })
    };
    var g = function(a) {
        this.state_ = 0;
        this.result_ = void 0;
        this.onSettledCallbacks_ = [];
        var e = this.createResolveAndReject_();
        try {
            a(e.resolve, e.reject)
        } catch (k) {
            e.reject(k)
        }
    };
    g.prototype.createResolveAndReject_ =
        function() {
            function a(b) {
                return function(a) {
                    k || (k = !0, b.call(e, a))
                }
            }
            var e = this,
                k = !1;
            return {
                resolve: a(this.resolveTo_),
                reject: a(this.reject_)
            }
        };
    g.prototype.resolveTo_ = function(a) {
        if (a === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
        else if (a instanceof g) this.settleSameAsPromise_(a);
        else {
            a: switch (typeof a) {
                case "object":
                    var e = null != a;
                    break a;
                case "function":
                    e = !0;
                    break a;
                default:
                    e = !1
            }
            e ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a)
        }
    };
    g.prototype.resolveToNonPromiseObj_ = function(a) {
        var e =
            void 0;
        try {
            e = a.then
        } catch (k) {
            this.reject_(k);
            return
        }
        "function" == typeof e ? this.settleSameAsThenable_(e, a) : this.fulfill_(a)
    };
    g.prototype.reject_ = function(a) {
        this.settle_(2, a)
    };
    g.prototype.fulfill_ = function(a) {
        this.settle_(1, a)
    };
    g.prototype.settle_ = function(a, e) {
        if (0 != this.state_) throw Error("Cannot settle(" + a + ", " + e | "): Promise already settled in state" + this.state_);
        this.state_ = a;
        this.result_ = e;
        this.executeOnSettledCallbacks_()
    };
    g.prototype.executeOnSettledCallbacks_ = function() {
        if (null != this.onSettledCallbacks_) {
            for (var a =
                    this.onSettledCallbacks_, e = 0; e < a.length; ++e) a[e].call(), a[e] = null;
            this.onSettledCallbacks_ = null
        }
    };
    var d = new q;
    g.prototype.settleSameAsPromise_ = function(a) {
        var e = this.createResolveAndReject_();
        a.callWhenSettled_(e.resolve, e.reject)
    };
    g.prototype.settleSameAsThenable_ = function(a, e) {
        var k = this.createResolveAndReject_();
        try {
            a.call(e, k.resolve, k.reject)
        } catch (b) {
            k.reject(b)
        }
    };
    g.prototype.then = function(a, e) {
        function k(a, e) {
            return "function" == typeof a ? function(e) {
                try {
                    b(a(e))
                } catch (y) {
                    c(y)
                }
            } : e
        }
        var b, c, d = new g(function(a,
            e) {
            b = a;
            c = e
        });
        this.callWhenSettled_(k(a, b), k(e, c));
        return d
    };
    g.prototype.catch = function(a) {
        return this.then(void 0, a)
    };
    g.prototype.callWhenSettled_ = function(a, e) {
        function k() {
            switch (b.state_) {
                case 1:
                    a(b.result_);
                    break;
                case 2:
                    e(b.result_);
                    break;
                default:
                    throw Error("Unexpected state: " + b.state_);
            }
        }
        var b = this;
        null == this.onSettledCallbacks_ ? d.asyncExecute(k) : this.onSettledCallbacks_.push(function() {
            d.asyncExecute(k)
        })
    };
    g.resolve = h;
    g.reject = function(a) {
        return new g(function(e, k) {
            k(a)
        })
    };
    g.race = function(a) {
        return new g(function(e,
            k) {
            for (var b = $jscomp.makeIterator(a), c = b.next(); !c.done; c = b.next()) h(c.value).callWhenSettled_(e, k)
        })
    };
    g.all = function(a) {
        var e = $jscomp.makeIterator(a),
            k = e.next();
        return k.done ? h([]) : new g(function(b, a) {
            function c(a) {
                return function(c) {
                    d[a] = c;
                    f--;
                    0 == f && b(d)
                }
            }
            var d = [],
                f = 0;
            do d.push(void 0), f++, h(k.value).callWhenSettled_(c(d.length - 1), a), k = e.next(); while (!k.done)
        })
    };
    return g
}, "es6", "es3");
$jscomp.polyfill("Object.assign", function(m) {
    return m ? m : function(m, h) {
        for (var f = 1; f < arguments.length; f++) {
            var g = arguments[f];
            if (g)
                for (var d in g) $jscomp.owns(g, d) && (m[d] = g[d])
        }
        return m
    }
}, "es6", "es3");
var Erizo = function(m) {
    function q(f) {
        if (h[f]) return h[f].exports;
        var g = h[f] = {
            i: f,
            l: !1,
            exports: {}
        };
        m[f].call(g.exports, g, g.exports, q);
        g.l = !0;
        return g.exports
    }
    var h = {};
    q.m = m;
    q.c = h;
    q.d = function(f, g, d) {
        q.o(f, g) || Object.defineProperty(f, g, {
            configurable: !1,
            enumerable: !0,
            get: d
        })
    };
    q.n = function(f) {
        var g = f && f.__esModule ? function() {
            return f["default"]
        } : function() {
            return f
        };
        q.d(g, "a", g);
        return g
    };
    q.o = function(f, g) {
        return Object.prototype.hasOwnProperty.call(f, g)
    };
    q.p = "";
    return q(q.s = 24)
}([function(m, q, h) {
    var f =
        function() {
            var g = "";
            var d = function(a) {
                console.log.apply(console, [].concat($jscomp.arrayFromIterable(a)))
            };
            return {
                DEBUG: 0,
                TRACE: 1,
                INFO: 2,
                WARNING: 3,
                ERROR: 4,
                NONE: 5,
                setLogLevel: function(a) {
                    var e = a;
                    a > f.NONE ? e = f.NONE : a < f.DEBUG && (e = f.DEBUG);
                    f.logLevel = e
                },
                setOutputFunction: function(a) {
                    d = a
                },
                setLogPrefix: function(a) {
                    g = a
                },
                log: function(a, e) {

                    //enablelogs
                    if (false) {
                        for (var k = [], b = 1; b < arguments.length; ++b) k[b - 1] = arguments[b];
                        b = g;
                        if (!(a < f.logLevel))
                            if (a === f.DEBUG ? b += "DEBUG" : a === f.TRACE ? b += "TRACE" : a === f.INFO ? b += "INFO" : a === f.WARNING ? b +=
                                "WARNING" : a === f.ERROR && (b += "ERROR"), k = [b + ": "].concat(k), void 0 !== f.panel) {
                                b = "";
                                for (var c = 0; c < k.length; c += 1) b += k[c];
                                f.panel.value = f.panel.value + "\n" + b
                            } else d.apply(f, [k])
                    }
                },
                debug: function(a) {

                    if (false) {
                        for (var e = [], k = 0; k < arguments.length; ++k) e[k - 0] = arguments[k];
                        f.log.apply(f, [].concat([f.DEBUG], $jscomp.arrayFromIterable(e)))
                    }
                },
                trace: function(a) {
                    for (var e = [], k = 0; k < arguments.length; ++k) e[k - 0] = arguments[k];
                    f.log.apply(f, [].concat([f.TRACE], $jscomp.arrayFromIterable(e)))
                },
                info: function(a) {
                    if (false) {
                        for (var e = [], k = 0; k < arguments.length; ++k) e[k -
                            0] = arguments[k];
                        f.log.apply(f, [].concat([f.INFO], $jscomp.arrayFromIterable(e)))
                    }

                },
                warning: function(a) {
                    if (false) {
                        for (var e = [], k = 0; k < arguments.length; ++k) e[k - 0] = arguments[k];
                        f.log.apply(f, [].concat([f.WARNING], $jscomp.arrayFromIterable(e)))
                    }
                },
                error: function(a) {
                    for (var e = [], k = 0; k < arguments.length; ++k) e[k - 0] = arguments[k];
                    f.log.apply(f, [].concat([f.ERROR], $jscomp.arrayFromIterable(e)))
                }
            }
        }();
    q.a = f
}, function(m, q, h) {
    h.d(q, "a", function() {
        return g
    });
    h.d(q, "b", function() {
        return d
    });
    h.d(q, "c", function() {
        return a
    });
    h.d(q,
        "d",
        function() {
            return e
        });
    var f = h(0),
        g = function() {
            var a = {},
                b = {};
            a.addEventListener = function(a, e) {
                void 0 === b[a] && (b[a] = []);
                b[a].push(e)
            };
            a.removeEventListener = function(a, e) {
                b[a] && (e = b[a].indexOf(e), -1 !== e && b[a].splice(e, 1))
            };
            a.dispatchEvent = function(a) {
                if (!a || !a.type) throw Error("Undefined event");
                f.a.debug("Event: " + a.type);
                for (var c = b[a.type] || [], e = 0; e < c.length; e += 1) c[e](a)
            };
            a.on = a.addEventListener;
            a.off = a.removeEventListener;
            a.emit = a.dispatchEvent;
            return a
        },
        d = function(a) {
            var b = {};
            b.type = a.type;
            return b
        },
        a = function(a) {
            var b = d(a);
            b.streams = a.streams;
            b.message = a.message;
            return b
        },
        e = function(a) {
            var b = d(a);
            b.stream = a.stream;
            b.msg = a.msg;
            b.bandwidth = a.bandwidth;
            b.attrs = a.attrs;
            return b
        }
}, function(m, q, h) {
    var f = h(5)("SEND", "RECV");
    f.byValue = function(g) {
        return f[g.toUpperCase()]
    };
    f.toString = function(g) {
        switch (g) {
            case f.SEND:
                return "send";
            case f.RECV:
                return "recv";
            default:
                return "unknown"
        }
    };
    f.reverse = function(g) {
        switch (g) {
            case f.SEND:
                return f.RECV;
            case f.RECV:
                return f.SEND;
            default:
                return f.SEND
        }
    };
    m.exports =
        f
}, function(m, q, h) {
    var f = h(1);
    q.a = function() {
        var g = Object(f.a)({});
        g.url = "";
        return g
    }
}, function(m, q, h) {
    var f = h(5)("ACTIVE", "PASSIVE", "ACTPASS", "INACTIVE");
    f.byValue = function(g) {
        return f[g.toUpperCase()]
    };
    f.toString = function(g) {
        switch (g) {
            case f.ACTIVE:
                return "active";
            case f.PASSIVE:
                return "passive";
            case f.ACTPASS:
                return "actpass";
            case f.INACTIVE:
                return "inactive";
            default:
                return "unknown"
        }
    };
    f.reverse = function(g) {
        switch (g) {
            case f.ACTIVE:
                return f.PASSIVE;
            case f.PASSIVE:
                return f.ACTIVE;
            case f.ACTPASS:
                return f.PASSIVE;
            case f.INACTIVE:
                return f.INACTIVE;
            default:
                return f.ACTIVE
        }
    };
    m.exports = f
}, function(m, q) {
    function h(f) {
        for (var g = [], d = 0; d < arguments.length; ++d) g[d - 0] = arguments[d];
        var a = this;
        if (!(this instanceof h)) return new(Function.prototype.bind.apply(h, [null].concat(Array.prototype.slice.call(g))));
        Array.from(g).forEach(function(e) {
            $jscomp.initSymbol();
            a[e] = Symbol.for("LICODE_SEMANTIC_SDP_" + e)
        })
    }
    m.exports = h
}, function(m, q, h) {
    var f = h(5)("SENDRECV", "SENDONLY", "RECVONLY", "INACTIVE");
    f.byValue = function(g) {
        return f[g.toUpperCase()]
    };
    f.toString = function(g) {
        switch (g) {
            case f.SENDRECV:
                return "sendrecv";
            case f.SENDONLY:
                return "sendonly";
            case f.RECVONLY:
                return "recvonly";
            case f.INACTIVE:
                return "inactive";
            default:
                return "unknown"
        }
    };
    f.reverse = function(g) {
        switch (g) {
            case f.SENDRECV:
                return f.SENDRECV;
            case f.SENDONLY:
                return f.RECVONLY;
            case f.RECVONLY:
                return f.SENDONLY;
            case f.INACTIVE:
                return f.INACTIVE;
            default:
                return f.SENDRECV
        }
    };
    m.exports = f
}, function(m, q, h) {
    (function(f) {
        var g = h(27),
            d = h(36),
            a = h(37),
            e = h(0),
            k = 103,
            b = function() {
                var a = "none";
                "undefined" !==
                typeof f && f.exports ? a = "fake" : null !== window.navigator.userAgent.match("Firefox") ? a = "mozilla" : null !== window.navigator.userAgent.match("Chrome") ? (a = "chrome-stable", null !== window.navigator.userAgent.match("Electron") && (a = "electron")) : null !== window.navigator.userAgent.match("Safari") ? a = "safari" : null !== window.navigator.userAgent.match("AppleWebKit") && (a = "safari");
                return a
            };
        q.a = {
            GetUserMedia: function(a, d, k) {
                d = void 0 === d ? function() {} : d;
                k = void 0 === k ? function() {} : k;
                var c, n = function(a, b, c) {
                        navigator.mediaDevices.getUserMedia(a).then(b).catch(c)
                    },
                    t = function() {
                        e.a.debug("Screen access requested");
                        switch (b()) {
                            case "electron":
                                e.a.debug("Screen sharing in Electron");
                                c = {};
                                c.video = a.video || {};
                                c.video.mandatory = a.video.mandatory || {};
                                c.video.mandatory.chromeMediaSource = "screen";
                                n(c, d, k);
                                break;
                            case "mozilla":
                                e.a.debug("Screen sharing in Firefox");
                                c = {};
                                void 0 !== a.video ? (c.video = a.video, c.video.mediaSource = "window") : c = {
                                    audio: a.audio,
                                    video: {
                                        mediaSource: "window"
                                    }
                                };
                                n(c, d, k);
                                break;
                            case "chrome-stable":
                                e.a.debug("Screen sharing in Chrome");
                                c = {};
                                if (a.desktopStreamId) c.video =
                                    a.video || {
                                        mandatory: {}
                                    }, c.video.mandatory = c.video.mandatory || {}, c.video.mandatory.chromeMediaSource = "desktop", c.video.mandatory.chromeMediaSourceId = a.desktopStreamId, n(c, d, k);
                                else {
                                    var r = "okeephmleflklcdebijnponpabbmmgeo";
                                    a.extensionId && (e.a.debug("extensionId supplied, using " + a.extensionId), r = a.extensionId);
                                    e.a.debug("Screen access on chrome stable, looking for extension");
                                    try {
                                        chrome.runtime.sendMessage(r, {
                                            getStream: !0
                                        }, function(b) {
                                            void 0 === b ? (e.a.error("Access to screen denied"), k({
                                                    code: "Access to screen denied"
                                                })) :
                                                (b = b.streamId, void 0 !== a.video.mandatory ? (c.video = a.video || {
                                                    mandatory: {}
                                                }, c.video.mandatory.chromeMediaSource = "desktop", c.video.mandatory.chromeMediaSourceId = b) : c = {
                                                    video: {
                                                        mandatory: {
                                                            chromeMediaSource: "desktop",
                                                            chromeMediaSourceId: b
                                                        }
                                                    }
                                                }, n(c, d, k))
                                        })
                                    } catch (l) {
                                        e.a.debug("Screensharing plugin is not accessible "), k({
                                            code: "no_plugin_present"
                                        })
                                    }
                                }
                                break;
                            default:
                                e.a.error("This browser does not support ScreenSharing")
                        }
                    };
                a.screen ? t() : "undefined" !== typeof f && f.exports ? e.a.error("Video/audio streams not supported in erizofc yet") :
                    (e.a.debug("Calling getUserMedia with config", a), n(a, d, k))
            },
            buildConnection: function(c) {
                var f = {};
                k += 1;
                c.sessionId = k;
                f.browser = b();
                if ("fake" === f.browser) e.a.warning("Publish/subscribe video/audio streams not supported in erizofc yet"), f = Object(a.a)(c);
                else if ("mozilla" === f.browser) e.a.debug("Firefox Stack"), f = Object(d.a)(c);
                else if ("safari" === f.browser) e.a.debug("Safari using Chrome Stable Stack"), f = Object(g.a)(c);
                else if ("chrome-stable" === f.browser || "electron" === f.browser) e.a.debug("Chrome Stable Stack"),
                    f = Object(g.a)(c);
                else throw e.a.error("No stack available for this browser"), Error("WebRTC stack not available");
                f.updateSpec || (f.updateSpec = function(a, b) {
                    b = void 0 === b ? function() {} : b;
                    e.a.error("Update Configuration not implemented in this browser");
                    b("unimplemented")
                });
                return f
            },
            getBrowser: b
        }
    }).call(q, h(26)(m))
}, function(m, q, h) {
    m = h(28);
    var f = h.n(m),
        g = h(20),
        d = h(0);
    q.a = function(a) {
        var e = {},
            k, b, c, t;
        d.a.info("Starting Base stack", a);
        e.pcConfig = {
            iceServers: []
        };
        e.con = {};
        void 0 !== a.iceServers && (e.pcConfig.iceServers =
            a.iceServers);
        !0 === a.forceTurn && (e.pcConfig.iceTransportPolicy = "relay");
        void 0 === a.audio && (a.audio = !0);
        void 0 === a.video && (a.video = !0);
        a.remoteCandidates = [];
        a.localCandidates = [];
        a.remoteDescriptionSet = !1;
        e.mediaConstraints = {
            offerToReceiveVideo: void 0 !== a.video && !1 !== a.video,
            offerToReceiveAudio: void 0 !== a.audio && !1 !== a.audio
        };
        e.peerConnection = new RTCPeerConnection(e.pcConfig, e.con);
        var n = function(a, b, c) {
                d.a.error("message:", c, "in baseStack at", a);
                void 0 !== b && b("error")
            },
            p = function(a) {
                d.a.info("Success in BaseStack",
                    a)
            },
            v = function(b, l) {
                k = l;
                b || (k.sdp = e.enableSimulcast(k.sdp));
                c = f.a.SDPInfo.processString(k.sdp);
                g.a.setMaxBW(c, a);
                k.sdp = c.toString();
                a.callback({
                    type: k.type,
                    sdp: k.sdp
                })
            },
            y = function(b) {
                k = b;
                c = f.a.SDPInfo.processString(k.sdp);
                g.a.setMaxBW(c, a);
                k.sdp = c.toString();
                a.callback({
                    type: k.type,
                    sdp: k.sdp
                });
                d.a.info("Setting local description p2p", k);
                e.peerConnection.setLocalDescription(k).then(p).catch(n)
            },
            r = function(b) {
                t = f.a.SDPInfo.processString(b.sdp);
                g.a.setMaxBW(t, a);
                b.sdp = t.toString();
                e.peerConnection.setRemoteDescription(b).then(function() {
                    e.peerConnection.createAnswer(e.mediaConstraints).then(y).catch(n.bind(null,
                        "createAnswer p2p", void 0));
                    a.remoteDescriptionSet = !0
                }).catch(n.bind(null, "process Offer", void 0))
            },
            l = function(c) {
                d.a.info("Set remote and local description");
                d.a.debug("Remote Description", c.sdp);
                d.a.debug("Local Description", k.sdp);
                t = f.a.SDPInfo.processString(c.sdp);
                g.a.setMaxBW(t, a);
                c.sdp = t.toString();
                b = c;
                e.peerConnection.setLocalDescription(k).then(function() {
                    e.peerConnection.setRemoteDescription(new RTCSessionDescription(c)).then(function() {
                        a.remoteDescriptionSet = !0;
                        for (d.a.info("Candidates to be added: ",
                                a.remoteCandidates.length, a.remoteCandidates); 0 < a.remoteCandidates.length;) e.peerConnection.addIceCandidate(a.remoteCandidates.shift());
                        for (d.a.info("Local candidates to send:", a.localCandidates.length); 0 < a.localCandidates.length;) a.callback({
                            type: "candidate",
                            candidate: a.localCandidates.shift()
                        })
                    }).catch(n.bind(null, "processAnswer", void 0))
                }).catch(n.bind(null, "processAnswer", void 0))
            };
        e.peerConnection.onicecandidate = function(b) {
            (b = b.candidate) ? (b.candidate.match(/a=/) || (b.candidate = "a\x3d" + b.candidate),
                b = {
                    sdpMLineIndex: b.sdpMLineIndex,
                    sdpMid: b.sdpMid,
                    candidate: b.candidate
                }) : (d.a.info("Gathered all candidates. Sending END candidate"), b = {
                sdpMLineIndex: -1,
                sdpMid: "end",
                candidate: "end"
            });
            a.remoteDescriptionSet ? a.callback({
                type: "candidate",
                candidate: b
            }) : (a.localCandidates.push(b), d.a.info("Storing candidate: ", a.localCandidates.length, b))
        };
        e.peerConnection.onaddstream = function(a) {
            if (e.onaddstream) e.onaddstream(a)
        };
        e.peerConnection.onremovestream = function(a) {
            if (e.onremovestream) e.onremovestream(a)
        };
        e.peerConnection.oniceconnectionstatechange =
            function(a) {
                if (e.oniceconnectionstatechange) e.oniceconnectionstatechange(a.target.iceConnectionState)
            };
        e.enableSimulcast = function(a) {
            d.a.error("Simulcast not implemented");
            return a
        };
        e.close = function() {
            e.state = "closed";
            e.peerConnection.close()
        };
        e.updateSpec = function(l, r) {
            r = void 0 === r ? function() {} : r;
            if (l.maxVideoBW || l.maxAudioBW) l.maxVideoBW && (d.a.debug("Maxvideo Requested:", l.maxVideoBW, "limit:", a.limitMaxVideoBW), l.maxVideoBW > a.limitMaxVideoBW && (l.maxVideoBW = a.limitMaxVideoBW), a.maxVideoBW = l.maxVideoBW,
                d.a.debug("Result", a.maxVideoBW)), l.maxAudioBW && (l.maxAudioBW > a.limitMaxAudioBW && (l.maxAudioBW = a.limitMaxAudioBW), a.maxAudioBW = l.maxAudioBW), c = f.a.SDPInfo.processString(k.sdp), g.a.setMaxBW(c, a), k.sdp = c.toString(), l.Sdp || l.maxAudioBW ? (d.a.debug("Updating with SDP renegotiation", a.maxVideoBW, a.maxAudioBW), e.peerConnection.setLocalDescription(k).then(function() {
                t = f.a.SDPInfo.processString(b.sdp);
                g.a.setMaxBW(t, a);
                b.sdp = t.toString();
                return e.peerConnection.setRemoteDescription(new RTCSessionDescription(b))
            }).then(function() {
                a.remoteDescriptionSet = !0;
                a.callback({
                    type: "updatestream",
                    sdp: k.sdp
                })
            }).catch(n.bind(null, "updateSpec", r))) : (d.a.debug("Updating without SDP renegotiation, newVideoBW:", a.maxVideoBW, "newAudioBW:", a.maxAudioBW), a.callback({
                type: "updatestream",
                sdp: k.sdp
            }));
            if (l.minVideoBW || void 0 !== l.slideShowMode || void 0 !== l.muteStream || void 0 !== l.qualityLayer || void 0 !== l.video) d.a.debug("MinVideo Changed to ", l.minVideoBW), d.a.debug("SlideShowMode Changed to ", l.slideShowMode), d.a.debug("muteStream changed to ", l.muteStream), d.a.debug("Video Constraints",
                l.video), a.callback({
                type: "updatestream",
                config: l
            })
        };
        e.createOffer = function(a) {
            !0 !== a && (e.mediaConstraints = {
                offerToReceiveVideo: !1,
                offerToReceiveAudio: !1
            });
            d.a.debug("Creating offer", e.mediaConstraints);
            e.peerConnection.createOffer(e.mediaConstraints).then(v.bind(null, a)).catch(n.bind(null, "Create Offer", void 0))
        };
        e.addStream = function(a) {
            e.peerConnection.addStream(a)
        };
        e.processSignalingMessage = function(b) {
            if ("offer" === b.type) r(b);
            else if ("answer" === b.type) l(b);
            else if ("candidate" === b.type) try {
                var c =
                    "object" === typeof b.candidate ? b.candidate : JSON.parse(b.candidate);
                if ("end" !== c.candidate) {
                    c.candidate = c.candidate.replace(/a=/g, "");
                    c.sdpMLineIndex = parseInt(c.sdpMLineIndex, 10);
                    var k = new RTCIceCandidate(c);
                    a.remoteDescriptionSet ? e.peerConnection.addIceCandidate(k) : a.remoteCandidates.push(k)
                }
            } catch (B) {
                d.a.error("Error parsing candidate", b.candidate)
            }
        };
        return e
    }
}, function(m, q) {
    var h = m.exports = {
        v: [{
            name: "version",
            reg: /^(\d*)$/
        }],
        o: [{
            name: "origin",
            reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
            names: "username sessionId sessionVersion netType ipVer address".split(" "),
            format: "%s %s %d %s IP%d %s"
        }],
        s: [{
            name: "name"
        }],
        i: [{
            name: "description"
        }],
        u: [{
            name: "uri"
        }],
        e: [{
            name: "email"
        }],
        p: [{
            name: "phone"
        }],
        z: [{
            name: "timezones"
        }],
        r: [{
            name: "repeats"
        }],
        t: [{
            name: "timing",
            reg: /^(\d*) (\d*)/,
            names: ["start", "stop"],
            format: "%d %d"
        }],
        c: [{
            name: "connection",
            reg: /^IN IP(\d) (\S*)/,
            names: ["version", "ip"],
            format: "IN IP%d %s"
        }],
        b: [{
            push: "bandwidth",
            reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
            names: ["type", "limit"],
            format: "%s:%s"
        }],
        m: [{
            reg: /^(\w*) (\d*) ([\w\/]*)(?: (.*))?/,
            names: ["type", "port", "protocol",
                "payloads"
            ],
            format: "%s %d %s %s"
        }],
        a: [{
            push: "rtp",
            reg: /^rtpmap:(\d*) ([\w\-\.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
            names: ["payload", "codec", "rate", "encoding"],
            format: function(f) {
                return f.encoding ? "rtpmap:%d %s/%s/%s" : f.rate ? "rtpmap:%d %s/%s" : "rtpmap:%d %s"
            }
        }, {
            push: "fmtp",
            reg: /^fmtp:(\d*) ([\S| ]*)/,
            names: ["payload", "config"],
            format: "fmtp:%d %s"
        }, {
            name: "control",
            reg: /^control:(.*)/,
            format: "control:%s"
        }, {
            name: "rtcp",
            reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
            names: ["port", "netType", "ipVer", "address"],
            format: function(f) {
                return null !=
                    f.address ? "rtcp:%d %s IP%d %s" : "rtcp:%d"
            }
        }, {
            push: "rtcpFbTrrInt",
            reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
            names: ["payload", "value"],
            format: "rtcp-fb:%d trr-int %d"
        }, {
            push: "rtcpFb",
            reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
            names: ["payload", "type", "subtype"],
            format: function(f) {
                return null != f.subtype ? "rtcp-fb:%s %s %s" : "rtcp-fb:%s %s"
            }
        }, {
            push: "ext",
            reg: /^extmap:(\d+)(?:\/(\w+))? (\S*)(?: (\S*))?/,
            names: ["value", "direction", "uri", "config"],
            format: function(f) {
                return "extmap:%d" + (f.direction ? "/%s" : "%v") +
                    " %s" + (f.config ? " %s" : "")
            }
        }, {
            push: "crypto",
            reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
            names: ["id", "suite", "config", "sessionConfig"],
            format: function(f) {
                return null != f.sessionConfig ? "crypto:%d %s %s %s" : "crypto:%d %s %s"
            }
        }, {
            name: "setup",
            reg: /^setup:(\w*)/,
            format: "setup:%s"
        }, {
            name: "mid",
            reg: /^mid:([^\s]*)/,
            format: "mid:%s"
        }, {
            name: "msid",
            reg: /^msid:(.*)/,
            format: "msid:%s"
        }, {
            name: "ptime",
            reg: /^ptime:(\d*)/,
            format: "ptime:%d"
        }, {
            name: "maxptime",
            reg: /^maxptime:(\d*)/,
            format: "maxptime:%d"
        }, {
            name: "direction",
            reg: /^(sendrecv|recvonly|sendonly|inactive)/
        }, {
            name: "icelite",
            reg: /^(ice-lite)/
        }, {
            name: "iceUfrag",
            reg: /^ice-ufrag:(\S*)/,
            format: "ice-ufrag:%s"
        }, {
            name: "icePwd",
            reg: /^ice-pwd:(\S*)/,
            format: "ice-pwd:%s"
        }, {
            name: "fingerprint",
            reg: /^fingerprint:(\S*) (\S*)/,
            names: ["type", "hash"],
            format: "fingerprint:%s %s"
        }, {
            push: "candidates",
            reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
            names: "foundation component transport priority ip port type raddr rport tcptype generation network-id network-cost".split(" "),
            format: function(f) {
                var g = "candidate:%s %d %s %d %s %d typ %s" + (null != f.raddr ? " raddr %s rport %d" : "%v%v");
                g += null != f.tcptype ? " tcptype %s" : "%v";
                null != f.generation && (g += " generation %d");
                g += null != f["network-id"] ? " network-id %d" : "%v";
                return g += null != f["network-cost"] ? " network-cost %d" : "%v"
            }
        }, {
            name: "endOfCandidates",
            reg: /^(end-of-candidates)/
        }, {
            name: "remoteCandidates",
            reg: /^remote-candidates:(.*)/,
            format: "remote-candidates:%s"
        }, {
            name: "iceOptions",
            reg: /^ice-options:(\S*)/,
            format: "ice-options:%s"
        }, {
            push: "ssrcs",
            reg: /^ssrc:(\d*) ([\w_]*)(?::(.*))?/,
            names: ["id", "attribute", "value"],
            format: function(f) {
                var g = "ssrc:%d";
                null != f.attribute && (g += " %s", null != f.value && (g += ":%s"));
                return g
            }
        }, {
            push: "ssrcGroups",
            reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
            names: ["semantics", "ssrcs"],
            format: "ssrc-group:%s %s"
        }, {
            name: "msidSemantic",
            reg: /^msid-semantic:\s?(\w*) (\S*)/,
            names: ["semantic", "token"],
            format: "msid-semantic: %s %s"
        }, {
            push: "groups",
            reg: /^group:(\w*) (.*)/,
            names: ["type", "mids"],
            format: "group:%s %s"
        }, {
            name: "rtcpMux",
            reg: /^(rtcp-mux)/
        }, {
            name: "rtcpRsize",
            reg: /^(rtcp-rsize)/
        }, {
            name: "sctpmap",
            reg: /^sctpmap:([\w_\/]*) (\S*)(?: (\S*))?/,
            names: ["sctpmapNumber", "app", "maxMessageSize"],
            format: function(f) {
                return null != f.maxMessageSize ? "sctpmap:%s %s %s" : "sctpmap:%s %s"
            }
        }, {
            name: "xGoogleFlag",
            reg: /^x-google-flag:([^\s]*)/,
            format: "x-google-flag:%s"
        }, {
            push: "rids",
            reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
            names: ["id", "direction", "params"],
            format: function(f) {
                return f.params ? "rid:%s %s %s" : "rid:%s %s"
            }
        }, {
            push: "imageattrs",
            reg: /^imageattr:(\d+|\*)[\s\t]+(send|recv)[\s\t]+(\*|\[\S+\](?:[\s\t]+\[\S+\])*)(?:[\s\t]+(recv|send)[\s\t]+(\*|\[\S+\](?:[\s\t]+\[\S+\])*))?/,
            names: ["pt", "dir1", "attrs1", "dir2", "attrs2"],
            format: function(f) {
                return "imageattr:%s %s %s" + (f.dir2 ? " %s %s" : "")
            }
        }, {
            name: "simulcast",
            reg: /^simulcast:(send|recv) ([a-zA-Z0-9\-_~;,]+)(?:\s?(send|recv) ([a-zA-Z0-9\-_~;,]+))?$/,
            names: ["dir1", "list1", "dir2", "list2"],
            format: function(f) {
                return "simulcast:%s %s" + (f.dir2 ? " %s %s" : "")
            }
        }, {
            name: "simulcast_03",
            reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
            names: ["value"],
            format: "simulcast: %s"
        }, {
            name: "framerate",
            reg: /^framerate:(\d+(?:$|\.\d+))/,
            format: "framerate:%s"
        }, {
            push: "invalid",
            names: ["value"]
        }]
    };
    Object.keys(h).forEach(function(f) {
        h[f].forEach(function(f) {
            f.reg || (f.reg = /(.*)/);
            f.format || (f.format = "%s")
        })
    })
}, function(m, q) {
    var h = function(f, g, d, a, e, k, b, c, t, n) {
        this.foundation = f;
        this.componentId = g;
        this.transport = d;
        this.priority = a;
        this.address = e;
        this.port = k;
        this.type = b;
        this.generation = c;
        this.relAddr = t;
        this.relPort = n
    };
    h.prototype.clone = function() {
        return new h(this.foundation,
            this.componentId, this.transport, this.priority, this.address, this.port, this.type, this.generation, this.relAddr, this.relPort)
    };
    h.prototype.plain = function() {
        var f = {
            foundation: this.foundation,
            componentId: this.componentId,
            transport: this.transport,
            priority: this.priority,
            address: this.address,
            port: this.port,
            type: this.type,
            generation: this.generation
        };
        this.relAddr && (f.relAddr = this.relAddr);
        this.relPort && (f.relPort = this.relPort);
        return f
    };
    h.prototype.getFoundation = function() {
        return this.foundation
    };
    h.prototype.getComponentId =
        function() {
            return this.componentId
        };
    h.prototype.getTransport = function() {
        return this.transport
    };
    h.prototype.getPriority = function() {
        return this.priority
    };
    h.prototype.getAddress = function() {
        return this.address
    };
    h.prototype.getPort = function() {
        return this.port
    };
    h.prototype.getType = function() {
        return this.type
    };
    h.prototype.getGeneration = function() {
        return this.generation
    };
    h.prototype.getRelAddr = function() {
        return this.relAddr
    };
    h.prototype.getRelPort = function() {
        return this.relPort
    };
    m.exports = h
}, function(m, q) {
    var h =
        function(f, g, d, a, e, k) {
            this.codec = f;
            this.type = g;
            this.rate = d;
            this.encoding = a;
            this.params = e || {};
            this.feedback = k || []
        };
    h.prototype.clone = function() {
        var f = new h(this.codec, this.type, this.rate, this.encoding, this.params, this.feedback);
        this.rtx && f.setRTX(this.rtx);
        return f
    };
    h.prototype.plain = function() {
        return {
            codec: this.codec,
            type: this.type,
            rate: this.rate,
            encoding: this.encoding,
            params: this.params,
            feedback: this.feedback
        }
    };
    h.prototype.setRTX = function(f) {
        this.rtx = f
    };
    h.prototype.getType = function() {
        return this.type
    };
    h.prototype.setType = function(f) {
        this.type = f
    };
    h.prototype.getCodec = function() {
        return this.codec
    };
    h.prototype.getParams = function() {
        return this.params
    };
    h.prototype.hasRTX = function() {
        return this.rtx
    };
    h.prototype.getRTX = function() {
        return this.rtx
    };
    h.prototype.getRate = function() {
        return this.rate
    };
    h.prototype.getEncoding = function() {
        return this.encoding
    };
    h.prototype.getFeedback = function() {
        return this.feedback
    };
    h.mapFromNames = function(f, g) {
        var d = new Map,
            a = 96;
        f.forEach(function(e) {
            e = e.toLowerCase();
            var k = "pcmu" ===
                e ? 0 : "pcma" === e ? 8 : a += 1;
            k = new h(e, k);
            g && "ulpfec" !== e && "flexfec-03" !== e && "red" !== e && (a += 1, k.setRTX(a));
            d.set(k.getCodec().toLowerCase(), k)
        });
        return d
    };
    m.exports = h
}, function(m, q, h) {
    var f = h(4),
        g = function(d, a, e) {
            this.setup = d;
            this.hash = a;
            this.fingerprint = e
        };
    g.prototype.clone = function() {
        return new g(this.setup, this.hash, this.fingerprint)
    };
    g.prototype.plain = function() {
        return {
            setup: f.toString(this.setup),
            hash: this.hash,
            fingerprint: this.fingerprint
        }
    };
    g.prototype.getFingerprint = function() {
        return this.fingerprint
    };
    g.prototype.getHash = function() {
        return this.hash
    };
    g.prototype.getSetup = function() {
        return this.setup
    };
    g.prototype.setSetup = function(d) {
        this.setup = d
    };
    m.exports = g
}, function(m, q) {
    function h(d) {
        d = new Uint8Array(d);
        for (var a = 0; a < d.length; a += 1) d[a] = Math.floor(256 * Math.random() + 0);
        return d
    }

    function f(d) {
        return Array.prototype.map.call(new Uint8Array(d), function(a) {
            return ("00" + a.toString(16)).slice(-2)
        }).join("")
    }
    var g = function(d, a, e) {
        this.ufrag = d;
        this.pwd = a;
        this.opts = e;
        this.endOfCandidates = this.lite = !1
    };
    g.prototype.clone =
        function() {
            var d = new g(this.ufrag, this.pwd, this.opts);
            d.setLite(this.lite);
            d.setEndOfCandidates(this.endOfCandidates);
            return d
        };
    g.prototype.plain = function() {
        var d = {
            ufrag: this.ufrag,
            pwd: this.pwd
        };
        this.lite && (d.lite = this.lite);
        this.endOfCandidates && (d.endOfCandidates = this.endOfCandidates);
        return d
    };
    g.prototype.getUfrag = function() {
        return this.ufrag
    };
    g.prototype.getPwd = function() {
        return this.pwd
    };
    g.prototype.isLite = function() {
        return this.lite
    };
    g.prototype.getOpts = function() {
        return this.opts
    };
    g.prototype.setLite =
        function(d) {
            this.lite = d
        };
    g.prototype.isEndOfCandidates = function() {
        return this.endOfCandidates
    };
    g.prototype.setEndOfCandidates = function(d) {
        this.endOfCandidates = d
    };
    g.generate = function() {
        var d = new g,
            a = h(8),
            e = h(24);
        d.ufrag = f(a);
        d.pwd = f(e);
        return d
    };
    m.exports = g
}, function(m, q, h) {
    var f = h(15),
        g = h(6),
        d = h(2),
        a = function(a, d, b) {
            this.id = a;
            this.type = b;
            this.port = d;
            this.direction = g.SENDRECV;
            this.extensions = new Map;
            this.codecs = new Map;
            this.rids = new Map;
            this.simulcast_03 = this.simulcast = null;
            this.bitrate = 0;
            this.connection =
                this.dtls = this.ice = null;
            this.candidates = []
        };
    a.prototype.clone = function() {
        var e = new a(this.id, this.port, this.type);
        e.setDirection(this.direction);
        e.setBitrate(this.bitrate);
        e.setConnection(this.connection);
        this.codecs.forEach(function(a) {
            e.addCodec(a.clone())
        });
        this.extensions.forEach(function(a, b) {
            e.addExtension(b, a)
        });
        this.rids.forEach(function(a, b) {
            e.addRID(b, a.clone())
        });
        this.simulcast && e.setSimulcast(this.simulcast.clone());
        this.xGoogleFlag && e.setXGoogleFlag(this.xGoogleFlag);
        this.ice && e.setICE(this.ice.clone());
        this.dtls && e.setDTLS(this.dtls.clone());
        this.candidates.forEach(function(a) {
            e.addCandidate(a.clone())
        });
        return e
    };
    a.prototype.plain = function() {
        var a = {
            id: this.id,
            port: this.port,
            type: this.type,
            connection: this.connection,
            direction: g.toString(this.direction),
            xGoogleFlag: this.xGoogleFlag,
            extensions: {},
            rids: [],
            codecs: [],
            candidates: []
        };
        this.bitrate && (a.bitrate = this.bitrate);
        this.codecs.forEach(function(e) {
            a.codecs.push(e.plain())
        });
        this.extensions.forEach(function(e) {
            a.extensions.push(e.plain())
        });
        this.rids.forEach(function(e) {
            a.rids.push(e.plain())
        });
        this.simulcast && (a.simulcast = this.simulcast.plain());
        this.candidates.forEach(function(e) {
            a.candidates.push(e.plain())
        });
        a.ice = this.ice && this.ice.plain();
        a.dtls = this.dtls && this.dtls.plain();
        return a
    };
    a.prototype.getType = function() {
        return this.type
    };
    a.prototype.getPort = function() {
        return this.port
    };
    a.prototype.getId = function() {
        return this.id
    };
    a.prototype.addExtension = function(a, d) {
        this.extensions.set(a, d)
    };
    a.prototype.addRID = function(a) {
        this.rids.set(a.getId(), a)
    };
    a.prototype.addCodec = function(a) {
        this.codecs.set(a.getType(),
            a)
    };
    a.prototype.getCodecForType = function(a) {
        return this.codecs.get(a)
    };
    a.prototype.getCodec = function(a) {
        var e;
        this.codecs.forEach(function(b) {
            b.getCodec().toLowerCase() === a.toLowerCase() && (e = b)
        });
        return e
    };
    a.prototype.hasCodec = function(a) {
        return null !== this.getCodec(a)
    };
    a.prototype.getCodecs = function() {
        return this.codecs
    };
    a.prototype.getExtensions = function() {
        return this.extensions
    };
    a.prototype.getRIDs = function() {
        return this.rids
    };
    a.prototype.getRID = function(a) {
        return this.rids.get(a)
    };
    a.prototype.getBitrate =
        function() {
            return this.bitrate
        };
    a.prototype.setBitrate = function(a) {
        this.bitrate = a
    };
    a.prototype.getDirection = function() {
        return this.direction
    };
    a.prototype.setDirection = function(a) {
        this.direction = a
    };
    a.prototype.getDTLS = function() {
        return this.dtls
    };
    a.prototype.setDTLS = function(a) {
        this.dtls = a
    };
    a.prototype.getICE = function() {
        return this.ice
    };
    a.prototype.setICE = function(a) {
        this.ice = a
    };
    a.prototype.addCandidate = function(a) {
        this.candidates.push(a)
    };
    a.prototype.addCandidates = function(a) {
        var d = this;
        a.forEach(function(a) {
            d.addCandidate(a)
        })
    };
    a.prototype.getCandidates = function() {
        return this.candidates
    };
    a.prototype.setXGoogleFlag = function(a) {
        this.xGoogleFlag = a
    };
    a.prototype.getXGoogleFlag = function() {
        return this.xGoogleFlag
    };
    a.prototype.getConnection = function() {
        return this.connection
    };
    a.prototype.setConnection = function(a) {
        this.connection = a
    };
    a.prototype.answer = function(e) {
        var k = new a(this.id, this.port, this.type);
        k.setDirection(g.reverse(this.direction));
        e.codecs && this.codecs.forEach(function(a) {
            if (e.codecs.has(a.getCodec().toLowerCase())) {
                var b =
                    e.codecs.get(a.getCodec().toLowerCase()).clone();
                b.setType(a.getType());
                b.hasRTX() && b.setRTX(a.getRTX());
                k.addCodec(b)
            }
        });
        this.extensions.forEach(function(a, b) {
            e.extensions.has(b) && k.addExtension(b, a)
        });
        if (e.simulcast && this.simulcast) {
            var b = new f,
                c = this.simulcast.getSimulcastStreams(d.SEND);
            c && c.forEach(function(a) {
                var c = [];
                a.forEach(function(a) {
                    c.push(a.clone())
                });
                b.addSimulcastAlternativeStreams(d.RECV, c)
            });
            (c = this.simulcast.getSimulcastStreams(d.RECV)) && c.forEach(function(a) {
                var c = [];
                a.forEach(function(a) {
                    c.push(a.clone())
                });
                b.addSimulcastAlternativeStreams(d.SEND, c)
            });
            this.rids.forEach(function(a) {
                var b = a.clone();
                b.setDirection(d.reverse(a.getDirection()));
                k.addRID(b)
            });
            k.setSimulcast(b)
        }
        return k
    };
    a.prototype.getSimulcast = function() {
        return this.simulcast
    };
    a.prototype.setSimulcast = function(a) {
        this.simulcast = a
    };
    a.prototype.getSimulcast03 = function() {
        return this.simulcast_03
    };
    a.prototype.setSimulcast03 = function(a) {
        this.simulcast_03 = a
    };
    m.exports = a
}, function(m, q, h) {
    var f = h(2),
        g = function() {
            this.send = [];
            this.recv = [];
            this.plainString =
                null
        };
    g.prototype.clone = function() {
        var d = new g;
        this.send.forEach(function(a) {
            var e = [];
            a.forEach(function(a) {
                e.push(a.clone())
            });
            d.addSimulcastAlternativeStreams(e)
        });
        this.recv.forEach(function(a) {
            var e = [];
            a.forEach(function(a) {
                e.push(a.clone())
            });
            d.addSimulcastAlternativeStreams(e)
        });
        return d
    };
    g.prototype.plain = function() {
        var d = {
            send: [],
            recv: []
        };
        this.send.forEach(function(a) {
            var e = [];
            a.forEach(function(a) {
                e.push(a.plain())
            });
            d.send.push(e)
        });
        this.recv.forEach(function(a) {
            var e = [];
            a.forEach(function(a) {
                e.push(a.plain())
            });
            d.recv.push(e)
        });
        return d
    };
    g.prototype.addSimulcastAlternativeStreams = function(d, a) {
        return d === f.SEND ? this.send.push(a) : this.recv.push(a)
    };
    g.prototype.addSimulcastStream = function(d, a) {
        return d === f.SEND ? this.send.push([a]) : this.recv.push([a])
    };
    g.prototype.getSimulcastStreams = function(d) {
        return d === f.SEND ? this.send : this.recv
    };
    g.prototype.setSimulcastPlainString = function(d) {
        this.plainString = d
    };
    g.prototype.getSimulcastPlainString = function() {
        return this.plainString
    };
    m.exports = g
}, function(m, q) {
    var h = function(f,
        g) {
        var d = this;
        this.semantics = f;
        this.ssrcs = [];
        g.forEach(function(a) {
            d.ssrcs.push(parseInt(a, 10))
        })
    };
    h.prototype.clone = function() {
        return new h(this.semantics, this.ssrcs)
    };
    h.prototype.plain = function() {
        var f = {
            semantics: this.semantics,
            ssrcs: []
        };
        f.ssrcs = this.ssrcs;
        return f
    };
    h.prototype.getSemantics = function() {
        return this.semantics
    };
    h.prototype.getSSRCs = function() {
        return this.ssrcs
    };
    m.exports = h
}, function(m, q) {
    var h = function(f) {
        this.ssrc = f
    };
    h.prototype.clone = function() {
        var f = new h(this.ssrc);
        f.setCName(this.cname);
        f.setStreamId(this.streamId);
        this.setTrackId(this.trackId)
    };
    h.prototype.plain = function() {
        var f = {
            ssrc: this.ssrc
        };
        this.cname && (f.cname = this.cname);
        this.label && (f.label = this.label);
        this.mslabel && (f.mslabel = this.mslabel);
        this.streamId && (f.streamId = this.streamId);
        this.trackId && (f.trackid = this.trackId);
        return f
    };
    h.prototype.getCName = function() {
        return this.cname
    };
    h.prototype.setCName = function(f) {
        this.cname = f
    };
    h.prototype.getStreamId = function() {
        return this.streamId
    };
    h.prototype.setStreamId = function(f) {
        this.streamId =
            f
    };
    h.prototype.getTrackId = function() {
        return this.trackId
    };
    h.prototype.setTrackId = function(f) {
        this.trackId = f
    };
    h.prototype.getMSLabel = function() {
        return this.mslabel
    };
    h.prototype.setMSLabel = function(f) {
        this.mslabel = f
    };
    h.prototype.getLabel = function() {
        return this.label
    };
    h.prototype.setLabel = function(f) {
        this.label = f
    };
    h.prototype.getSSRC = function() {
        return this.ssrc
    };
    m.exports = h
}, function(m, q) {
    var h = function(f) {
        this.id = f;
        this.tracks = new Map
    };
    h.prototype.clone = function() {
        var f = new h(this.id);
        this.tracks.forEach(function(g) {
            f.addTrack(g.clone())
        });
        return f
    };
    h.prototype.plain = function() {
        var f = {
            id: this.id,
            tracks: []
        };
        this.tracks.forEach(function(g) {
            f.tracks.push(g.plain())
        });
        return f
    };
    h.prototype.getId = function() {
        return this.id
    };
    h.prototype.addTrack = function(f) {
        this.tracks.set(f.getId(), f)
    };
    h.prototype.getFirstTrack = function(f) {
        var g;
        this.tracks.forEach(function(d) {
            d.getMedia().toLowerCase() === f.toLowerCase() && (g = d)
        });
        return g
    };
    h.prototype.getTracks = function() {
        return this.tracks
    };
    h.prototype.removeAllTracks = function() {
        this.tracks.clear()
    };
    h.prototype.getTrack =
        function(f) {
            return this.tracks.get(f)
        };
    m.exports = h
}, function(m, q) {
    var h = function(f, g) {
        this.media = f;
        this.id = g;
        this.ssrcs = [];
        this.groups = [];
        this.encodings = []
    };
    h.prototype.clone = function() {
        var f = new h(this.media, this.id);
        this.mediaId && f.setMediaId(this.mediaId);
        this.ssrcs.forEach(function(g) {
            f.addSSRC(g)
        });
        this.groups.forEach(function(g) {
            f.addSourceGroup(g.clone())
        });
        this.encodings.forEach(function(g) {
            var d = [];
            g.forEach(function(a) {
                d.push(a.cloned())
            });
            f.addAlternativeEncoding(d)
        });
        return f
    };
    h.prototype.plain =
        function() {
            var f = {
                media: this.media,
                id: this.id,
                ssrcs: [],
                groups: [],
                encodings: []
            };
            this.mediaId && (f.mediaId = this.mediaId);
            this.ssrcs.forEach(function(g) {
                f.ssrcs.push(g)
            });
            this.groups.forEach(function(g) {
                f.groups.push(g.plain())
            });
            this.encodings.forEach(function(g) {
                var d = [];
                g.forEach(function(a) {
                    d.push(a.plain())
                });
                f.encodings.push(d)
            });
            return f
        };
    h.prototype.getMedia = function() {
        return this.media
    };
    h.prototype.setMediaId = function(f) {
        this.mediaId = f
    };
    h.prototype.getMediaId = function() {
        return this.mediaId
    };
    h.prototype.getId = function() {
        return this.id
    };
    h.prototype.addSSRC = function(f) {
        this.ssrcs.push(f)
    };
    h.prototype.getSSRCs = function() {
        return this.ssrcs
    };
    h.prototype.addSourceGroup = function(f) {
        this.groups.push(f)
    };
    h.prototype.getSourceGroup = function(f) {
        var g;
        this.groups.forEach(function(d) {
            d.getSemantics().toLowerCase() === f.toLowerCase() && (g = d)
        });
        return g
    };
    h.prototype.getSourceGroups = function() {
        return this.groups
    };
    h.prototype.hasSourceGroup = function(f) {
        var g = !1;
        this.groups.forEach(function(d) {
            d.getSemantics().toLowerCase() ===
                f.toLowerCase() && (g = !0)
        });
        return g
    };
    h.prototype.getEncodings = function() {
        return this.encodings
    };
    h.prototype.addAlternaticeEncodings = function(f) {
        this.encodings.push(f)
    };
    h.prototype.setEncodings = function(f) {
        this.encodings = f
    };
    m.exports = h
}, function(m, q, h) {
    q.a = {
        addSim: function(f) {
            var g = "a\x3dssrc-group:SIM";
            f.forEach(function(d) {
                g += " " + d
            });
            return g + "\r\n"
        },
        addGroup: function(f, g) {
            return "a\x3dssrc-group:FID " + f + " " + g + "\r\n"
        },
        addSpatialLayer: function(f, g, d, a, e, k) {
            return "a\x3dssrc:" + e + " cname:" + f + "\r\n" + ("a\x3dssrc:" +
                e + " msid:" + g + "\r\n") + ("a\x3dssrc:" + e + " mslabel:" + d + "\r\n") + ("a\x3dssrc:" + e + " label:" + a + "\r\n") + ("a\x3dssrc:" + k + " cname:" + f + "\r\n") + ("a\x3dssrc:" + k + " msid:" + g + "\r\n") + ("a\x3dssrc:" + k + " mslabel:" + d + "\r\n") + ("a\x3dssrc:" + k + " label:" + a + "\r\n")
        },
        setMaxBW: function(f, g) {
            if (g.video && g.maxVideoBW) {
                var d = f.getMedia("video");
                d && d.setBitrate(g.maxVideoBW)
            }
            g.audio && g.maxAudioBW && (f = f.getMedia("audio")) && f.setBitrate(g.maxVideoBW)
        },
        enableOpusNacks: function(f) {
            var g = f.match(/a=rtpmap:(.*)opus.*\r\n/);
            null !== g &&
                (f = f.replace(g[0], g[0] + "a\x3drtcp-fb:" + g[1] + "nack\r\n"));
            return f
        }
    }
}, function(m, q, h) {
    var f = h(1),
        g = h(7),
        d = h(40),
        a = h(42),
        e = h(0);
    q.a = function(k, b) {
        var c = Object(f.a)(b);
        c.stream = b.stream;
        c.url = b.url;
        c.recording = b.recording;
        c.room = void 0;
        c.showing = !1;
        c.local = !1;
        c.video = b.video;
        c.audio = b.audio;
        c.screen = b.screen;
        c.videoSize = b.videoSize;
        c.videoFrameRate = b.videoFrameRate;
        c.extensionId = b.extensionId;
        c.desktopStreamId = b.desktopStreamId;
        c.audioMuted = !1;
        c.videoMuted = !1;
        c.Connection = void 0 === k ? g.a : k;
        if (!(void 0 ===
                c.videoSize || c.videoSize instanceof Array && 4 === c.videoSize.length)) throw Error("Invalid Video Size");
        if (void 0 === b.local || !0 === b.local) c.local = !0;
        c.getID = function() {
            return c.local && !b.streamID ? "local" : b.streamID
        };
        c.getAttributes = function() {
            return b.attributes
        };
        c.setAttributes = function(a) {
            c.local ? c.emit(Object(f.d)({
                type: "internal-set-attributes",
                stream: c,
                attrs: a
            })) : e.a.error("Failed to set attributes data. This Stream object has not been published.")
        };
        c.updateLocalAttributes = function(a) {
            b.attributes =
                a
        };
        c.hasAudio = function() {
            return !1 !== b.audio && void 0 !== b.audio
        };
        c.hasVideo = function() {
            return !1 !== b.video && void 0 !== b.video
        };
        c.hasData = function() {
            return !1 !== b.data && void 0 !== b.data
        };
        c.hasScreen = function() {
            return b.screen
        };
        c.hasMedia = function() {
            return b.audio || b.video || b.screen
        };
        c.isExternal = function() {
            return void 0 !== c.url || void 0 !== c.recording
        };
        c.sendData = function(a) {
            c.local && c.hasData() ? c.emit(Object(f.d)({
                type: "internal-send-data",
                stream: c,
                msg: a
            })) : e.a.error("Failed to send data. This Stream object has not been published.")
        };
        c.init = function() {
            try {
                if ((b.audio || b.video || b.screen) && void 0 === b.url) {
                    e.a.info("Requested access to local media");
                    var a = b.video;
                    !0 === a || !0 === b.screen ? (a = !0 === a ? {} : a, void 0 !== c.videoSize && (a.width = {
                        min: c.videoSize[0],
                        max: c.videoSize[2]
                    }, a.height = {
                        min: c.videoSize[1],
                        max: c.videoSize[3]
                    }), void 0 !== c.videoFrameRate && (a.frameRate = {
                        min: c.videoFrameRate[0],
                        max: c.videoFrameRate[1]
                    })) : !0 === b.screen && void 0 === a && (a = !0);
                    c.Connection.GetUserMedia({
                        video: a,
                        audio: b.audio,
                        fake: b.fake,
                        screen: b.screen,
                        extensionId: c.extensionId,
                        desktopStreamId: c.desktopStreamId
                    }, function(a) {
                        e.a.info("User has granted access to local media.");
                        c.stream = a;
                        c.dispatchEvent(Object(f.d)({
                            type: "access-accepted"
                        }));
                        c.stream.getTracks().forEach(function(a) {
                            e.a.info("getTracks", a);
                            a.onended = function() {
                                c.stream.getTracks().forEach(function(a) {
                                    a.onended = null
                                });
                                var b = Object(f.d)({
                                    type: "stream-ended",
                                    stream: c,
                                    msg: a.kind
                                });
                                c.dispatchEvent(b)
                            }
                        })
                    }, function(a) {
                        e.a.error("Failed to get access to local media. Error code was " + a.code + ".");
                        a = Object(f.d)({
                            type: "access-denied",
                            msg: a
                        });
                        c.dispatchEvent(a)
                    })
                } else {
                    var d = Object(f.d)({
                        type: "access-accepted"
                    });
                    c.dispatchEvent(d)
                }
            } catch (r) {
                e.a.error("Failed to get access to local media. Error was " + r + "."), a = Object(f.d)({
                    type: "access-denied",
                    msg: r
                }), c.dispatchEvent(a)
            }
        };
        c.close = function() {
            c.local && (void 0 !== c.room && c.room.unpublish(c), c.hide(), void 0 !== c.stream && c.stream.getTracks().forEach(function(a) {
                a.onended = null;
                a.stop()
            }), c.stream = void 0)
        };
        c.play = function(b, e) {
            e = e || {};
            c.elementID = b;
            c.hasVideo() || c.hasScreen() ? void 0 !== b &&
                (b = Object(d.a)({
                    id: c.getID(),
                    stream: c,
                    elementID: b,
                    options: e
                }), c.player = b, c.showing = !0) : c.hasAudio() && (b = Object(a.a)({
                    id: c.getID(),
                    stream: c,
                    elementID: b,
                    options: e
                }), c.player = b, c.showing = !0)
        };
        c.stop = function() {
            c.showing && void 0 !== c.player && (c.player.destroy(), c.showing = !1)
        };
        c.show = c.play;
        c.hide = c.stop;
        var t = function() {
            if (void 0 !== c.player && void 0 !== c.stream) {
                var a = c.player.video,
                    b = document.defaultView.getComputedStyle(a),
                    r = parseInt(b.getPropertyValue("width"), 10),
                    l = parseInt(b.getPropertyValue("height"),
                        10),
                    d = parseInt(b.getPropertyValue("left"), 10);
                b = parseInt(b.getPropertyValue("top"), 10);
                var e = "object" === typeof c.elementID && "function" === typeof c.elementID.appendChild ? c.elementID : document.getElementById(c.elementID);
                var f = document.defaultView.getComputedStyle(e);
                e = parseInt(f.getPropertyValue("width"), 10);
                f = parseInt(f.getPropertyValue("height"), 10);
                var k = document.createElement("canvas");
                k.id = "testing";
                k.width = e;
                k.height = f;
                k.setAttribute("style", "display: none");
                k.getContext("2d").drawImage(a, d, b,
                    r, l);
                return k
            }
            return null
        };
        c.getVideoFrameURL = function(a) {
            var b = t();
            return null !== b ? a ? b.toDataURL(a) : b.toDataURL() : null
        };
        c.getVideoFrame = function() {
            var a = t();
            return null !== a ? a.getContext("2d").getImageData(0, 0, a.width, a.height) : null
        };
        c.checkOptions = function(a, b) {
            if (!0 === b) {
                if (a.audio || a.screen) e.a.warning("Cannot update type of subscription"), a.audio = void 0, a.screen = void 0
            } else !1 === c.local && (!0 === a.video && !1 === c.hasVideo() && (e.a.warning("Trying to subscribe to video when there is no video, won't subscribe to video"),
                a.video = !1), !0 === a.audio && !1 === c.hasAudio() && (e.a.warning("Trying to subscribe to audio when there is no audio, won't subscribe to audio"), a.audio = !1));
            !1 !== c.local || c.hasVideo() || !0 !== a.slideShowMode || (e.a.warning("Cannot enable slideShowMode if it is not a video subscription, please check your parameters"), a.slideShowMode = !1)
        };
        var n = function(a) {
            a = void 0 === a ? function() {} : a;
            if (c.room && c.room.p2p) e.a.warning("muteAudio/muteVideo are not implemented in p2p streams"), a("error");
            else {
                if (c.stream)
                    for (var b =
                            0; b < c.stream.getVideoTracks().length; b += 1) c.stream.getVideoTracks()[b].enabled = !c.videoMuted;
                b = {
                    muteStream: {
                        audio: c.audioMuted,
                        video: c.videoMuted
                    }
                };
                c.checkOptions(b, !0);
                c.pc && c.pc.updateSpec(b, a)
            }
        };
        c.muteAudio = function(a, b) {
            c.audioMuted = a;
            n(void 0 === b ? function() {} : b)
        };
        c.muteVideo = function(a, b) {
            c.videoMuted = a;
            n(void 0 === b ? function() {} : b)
        };
        c._setStaticQualityLayer = function(a, b, r) {
            r = void 0 === r ? function() {} : r;
            c.room && c.room.p2p ? (e.a.warning("setStaticQualityLayer is not implemented in p2p streams"), r("error")) :
                (a = {
                    qualityLayer: {
                        spatialLayer: a,
                        temporalLayer: b
                    }
                }, c.checkOptions(a, !0), c.pc.updateSpec(a, r))
        };
        c._setDynamicQualityLayer = function(a) {
            if (c.room && c.room.p2p) e.a.warning("setDynamicQualityLayer is not implemented in p2p streams"), a("error");
            else {
                var b = {
                    qualityLayer: {
                        spatialLayer: -1,
                        temporalLayer: -1
                    }
                };
                c.checkOptions(b, !0);
                c.pc.updateSpec(b, a)
            }
        };
        var p = function(a, b, r) {
            !0 !== b && (b = !1);
            a = "string" === typeof a ? [a] : a;
            a = a instanceof Array ? a : [];
            0 < a.length && c.room.sendControlMessage(c, "control", {
                name: "controlhandlers",
                enable: r,
                publisherSide: b,
                handlers: a
            })
        };
        c.disableHandlers = function(a, b) {
            p(a, b, !1)
        };
        c.enableHandlers = function(a, b) {
            p(a, b, !0)
        };
        c.updateConfiguration = function(a, b) {
            b = void 0 === b ? function() {} : b;
            if (void 0 !== a)
                if (c.pc)
                    if (c.checkOptions(a, !0), c.local)
                        if (c.room.p2p)
                            for (var r = 0; r < c.pc.length; r += 1) c.pc[r].updateSpec(a, b);
                        else c.pc.updateSpec(a, b);
            else c.pc.updateSpec(a, b);
            else b("This stream has no peerConnection attached, ignoring")
        };
        return c
    }
}, function(m, q, h) {
    var f = h(3),
        g = h(41);
    q.a = function(d) {
        var a = Object(f.a)({}),
            e;
        a.elementID = d.elementID;
        a.id = d.id;
        a.div = document.createElement("div");
        a.div.setAttribute("id", "bar_" + a.id);
        a.div.setAttribute("class", "licode_bar");
        a.bar = document.createElement("div");
        a.bar.setAttribute("style", "width: 100%; height: 15%; max-height: 30px; position: absolute; bottom: 0; right: 0; background-color: rgba(255,255,255,0.62)");
        a.bar.setAttribute("id", "subbar_" + a.id);
        a.bar.setAttribute("class", "licode_subbar");
        a.link = document.createElement("a");
        a.link.setAttribute("href", "http://www.lynckia.com/");
        a.link.setAttribute("class", "licode_link");
        a.link.setAttribute("target", "_blank");
        a.logo = document.createElement("img");
        a.logo.setAttribute("style", "width: 100%; height: 100%; max-width: 30px; position: absolute; top: 0; left: 2px;");
        a.logo.setAttribute("class", "licode_logo");
        a.logo.setAttribute("alt", "Lynckia");
        a.logo.setAttribute("src", a.url + "/assets/star.svg");
        var k = function(b) {
            var c = b;
            "block" !== b ? c = "none" : clearTimeout(e);
            a.div.setAttribute("style", "width: 100%; height: 100%; position: relative; bottom: 0; right: 0; display: " +
                c)
        };
        a.display = function() {
            k("block")
        };
        a.hide = function() {
            e = setTimeout(k, 1E3)
        };
        document.getElementById(a.elementID).appendChild(a.div);
        a.div.appendChild(a.bar);
        a.bar.appendChild(a.link);
        a.link.appendChild(a.logo);
        d.stream.screen || void 0 !== d.options && void 0 !== d.options.speaker && !0 !== d.options.speaker || (a.speaker = Object(g.a)({
            elementID: "subbar_" + a.id,
            id: a.id,
            stream: d.stream,
            media: d.media
        }));
        a.display();
        a.hide();
        return a
    }
}, function(m, q) {
    q = function() {
        return this
    }();
    try {
        q = q || Function("return this")() || (0, eval)("this")
    } catch (h) {
        "object" ===
        typeof window && (q = window)
    }
    m.exports = q
}, function(m, q, h) {
    Object.defineProperty(q, "__esModule", {
        value: !0
    });
    m = h(25);
    var f = h(1),
        g = h(21),
        d = h(0);
    h(45);
    h(47);
    h = {
        Room: m.a.bind(null, void 0, void 0),
        LicodeEvent: f.b,
        RoomEvent: f.c,
        StreamEvent: f.d,
        Stream: g.a.bind(null, void 0),
        Logger: d.a
    };
    q["default"] = h
}, function(m, q, h) {
    var f = h(7),
        g = h(1),
        d = h(38),
        a = h(21),
        e = h(43),
        k = h(44),
        b = h(0);
    q.a = function(c, t, n) {
        var p = Object(g.a)(n);
        p.remoteStreams = Object(e.a)();
        p.localStreams = Object(e.a)();
        p.roomID = "";
        p.state = 0;
        p.p2p = !1;
        p.Connection =
            void 0 === t ? f.a : t;
        var v = Object(d.a)(c);
        p.socket = v;
        var h = p.remoteStreams,
            r = p.localStreams,
            l = function(a) {
                a.stream && (a.hide(), a.stop(), a.close(), delete a.stream);
                a.pc && (a.local && p.p2p ? a.pc.forEach(function(b, c) {
                    b.close();
                    a.pc.remove(c)
                }) : (a.pc.close(), delete a.pc))
            },
            u = function(a, b) {
                0 !== p.state && a && !a.failed && (a.failed = !0, b = Object(g.d)({
                    type: "stream-failed",
                    msg: b || "Stream failed after connection",
                    stream: a
                }), p.dispatchEvent(b), a.local ? p.unpublish(a) : p.unsubscribe(a))
            },
            w = function(a, c) {
                b.a.info("Stream subscribed");
                a.stream = c.stream;
                a = Object(g.d)({
                    type: "stream-subscribed",
                    stream: a
                });
                p.dispatchEvent(a)
            },
            x = function(a, b) {
                return {
                    callback: function(c) {
                        v.sendSDP("signaling_message", {
                            streamId: a.getID(),
                            peerSocket: b,
                            msg: c
                        })
                    },
                    audio: a.hasAudio(),
                    video: a.hasVideo(),
                    iceServers: p.iceServers,
                    maxAudioBW: a.maxAudioBW,
                    maxVideoBW: a.maxVideoBW,
                    limitMaxAudioBW: n.maxAudioBW,
                    limitMaxVideoBW: n.maxVideoBW,
                    forceTurn: a.forceTurn
                }
            },
            B = function(a, b) {
                a.pc = p.Connection.buildConnection(x(a, b));
                a.pc.onaddstream = w.bind(null, a);
                a.pc.oniceconnectionstatechange =
                    function(b) {
                        "failed" === b && u(a)
                    }
            },
            C = function(a, b) {
                void 0 === a.pc && (a.pc = Object(e.a)());
                var c = p.Connection.buildConnection(x(a, b));
                a.pc.add(b, c);
                c.oniceconnectionstatechange = function(c) {
                    "failed" === c && (a.pc.get(b).close(), a.pc.remove(b))
                };
                c.addStream(a.stream);
                c.createOffer()
            },
            D = function(a, c, l) {
                var r = {
                    callback: function(c) {
                        b.a.info("Sending message", c);
                        v.sendSDP("signaling_message", {
                            streamId: a.getID(),
                            msg: c,
                            browser: a.pc.browser
                        }, void 0, function() {})
                    },
                    nop2p: !0,
                    audio: c.audio && a.hasAudio(),
                    video: c.video &&
                        a.hasVideo(),
                    maxAudioBW: c.maxAudioBW,
                    maxVideoBW: c.maxVideoBW,
                    limitMaxAudioBW: n.maxAudioBW,
                    limitMaxVideoBW: n.maxVideoBW,
                    iceServers: p.iceServers,
                    forceTurn: a.forceTurn
                };
                l || (r.simulcast = c.simulcast);
                return r
            },
            F = function(a, b) {
                a.pc = p.Connection.buildConnection(D(a, b, !0));
                a.pc.onaddstream = w.bind(null, a);
                a.pc.oniceconnectionstatechange = function(b) {
                    "failed" === b && u(a)
                };
                a.pc.createOffer(!0)
            },
            m = function(a, b) {
                a.pc = p.Connection.buildConnection(D(a, b));
                a.pc.addStream(a.stream);
                a.pc.oniceconnectionstatechange = function(b) {
                    "failed" ===
                    b && u(a)
                };
                b.createOffer || a.pc.createOffer()
            },
            A = function(a) {
                var c = a.stream;
                a = a.msg;
                c.local ? v.sendMessage("sendDataStream", {
                    id: c.getID(),
                    msg: a
                }) : b.a.error("You can not send data through a remote stream")
            },
            G = function(a) {
                var c = a.stream;
                a = a.attrs;
                c.local ? (c.updateLocalAttributes(a), v.sendMessage("updateStreamAttributes", {
                    id: c.getID(),
                    attrs: a
                })) : b.a.error("You can not update attributes in a remote stream")
            };
        c = function(a, b) {
            b.args ? a.apply(null, [].concat($jscomp.arrayFromIterable(b.args))) : a()
        };
        var q = function(a,
                b, c) {
                return {
                    state: a,
                    data: b.hasData(),
                    audio: b.hasAudio(),
                    video: b.hasVideo(),
                    screen: b.hasScreen(),
                    attributes: b.getAttributes(),
                    metadata: c.metadata,
                    createOffer: c.createOffer,
                    muteStream: c.muteStream
                }
            },
            H = function(a, c, l, d) {
                d = void 0 === d ? function() {} : d;
                null === a ? (b.a.error("Error when publishing the stream", l), d(void 0, l)) : (b.a.info("Stream published"), c.getID = function() {
                    return a
                }, c.on("internal-send-data", A), c.on("internal-set-attributes", G), r.add(a, c), c.room = p, d(a))
            },
            J = function(a, c, l) {
                l = void 0 === l ? function() {} :
                    l;
                if (a.url) {
                    var d = "url";
                    var r = a.url
                } else d = "recording", r = a.recording;
                b.a.info("Checking publish options for", a.getID());
                a.checkOptions(c);
                v.sendSDP("publish", q(d, a, c), r, function(b, c) {
                    H(b, a, c, l)
                })
            },
            I = function(a, b, c) {
                c = void 0 === c ? function() {} : c;
                a.maxAudioBW = b.maxAudioBW;
                a.maxVideoBW = b.maxVideoBW;
                v.sendSDP("publish", q("p2p", a, b), void 0, function(b, l) {
                    H(b, a, l, c)
                })
            },
            K = function(a, b, c) {
                c = void 0 === c ? function() {} : c;
                v.sendSDP("publish", q("data", a, b), void 0, function(b, l) {
                    H(b, a, l, c)
                })
            },
            M = function(a, c, l) {
                l = void 0 ===
                    l ? function() {} : l;
                b.a.info("Publishing to Erizo Normally, is createOffer", c.createOffer);
                var d = q("erizo", a, c);
                d.minVideoBW = c.minVideoBW;
                d.scheme = c.scheme;
                v.sendSDP("publish", d, void 0, function(b, d) {
                    H(b, a, d, void 0);
                    m(a, c);
                    l(b)
                })
            },
            N = function(a, b) {
                a = b && a.hasVideo();
                var c = b && b.width,
                    l = b && b.height;
                b = b && b.frameRate;
                return c || l || b ? {
                    width: c,
                    height: l,
                    frameRate: b
                } : a
            },
            O = function(a, c, l) {
                l = void 0 === l ? function() {} : l;
                c.maxVideoBW = c.maxVideoBW || n.defaultVideoBW;
                c.maxVideoBW > n.maxVideoBW && (c.maxVideoBW = n.maxVideoBW);
                c.audio = void 0 === c.audio ? !0 : c.audio;
                c.video = void 0 === c.video ? !0 : c.video;
                c.data = void 0 === c.data ? !0 : c.data;
                a.checkOptions(c);
                var d = {
                    streamId: a.getID(),
                    audio: c.audio && a.hasAudio(),
                    video: N(a, c.video),
                    data: c.data && a.hasData(),
                    browser: p.Connection.getBrowser(),
                    createOffer: c.createOffer,
                    metadata: c.metadata,
                    muteStream: c.muteStream,
                    slideShowMode: c.slideShowMode
                };
                v.sendSDP("subscribe", d, void 0, function(d, r) {
                    null === d ? (b.a.error("Error subscribing to stream ", r), l(void 0, r)) : (b.a.info("Subscriber added"), F(a,
                        c), l(!0))
                })
            },
            P = function(a, c, l) {
                l = void 0 === l ? function() {} : l;
                v.sendSDP("subscribe", {
                    streamId: a.getID(),
                    data: c.data,
                    metadata: c.metadata
                }, void 0, function(c, d) {
                    null === c ? (b.a.error("Error subscribing to stream ", d), l(void 0, d)) : (b.a.info("Stream subscribed"), c = Object(g.d)({
                        type: "stream-subscribed",
                        stream: a
                    }), p.dispatchEvent(c), l(!0))
                })
            };
        p.connect = function() {
            var c = k.a.decodeBase64(n.token);
            0 !== p.state && b.a.warning("Room already connected");
            p.state = 1;
            v.connect(JSON.parse(c), function(c) {
                var l = [],
                    d = c.streams || [],
                    r = c.id;
                p.p2p = c.p2p;
                p.iceServers = c.iceServers;
                p.state = 2;
                n.defaultVideoBW = c.defaultVideoBW;
                n.maxVideoBW = c.maxVideoBW;
                for (var e = Object.keys(d), f = 0; f < e.length; f += 1) {
                    var k = d[e[f]];
                    c = Object(a.a)(p.Connection, {
                        streamID: k.id,
                        local: !1,
                        audio: k.audio,
                        video: k.video,
                        data: k.data,
                        screen: k.screen,
                        attributes: k.attributes
                    });
                    l.push(c);
                    h.add(k.id, c)
                }
                p.roomID = r;
                b.a.info("Connected to room " + p.roomID);
                l = Object(g.c)({
                    type: "room-connected",
                    streams: l
                });
                p.dispatchEvent(l)
            }, function(a) {
                b.a.error("Not Connected! Error: " +
                    a);
                a = Object(g.c)({
                    type: "room-error",
                    message: a
                });
                p.dispatchEvent(a)
            })
        };
        p.disconnect = function() {
            b.a.debug("Disconnection requested");
            var a = Object(g.c)({
                type: "room-disconnected",
                message: "expected-disconnection"
            });
            p.dispatchEvent(a)
        };
        p.publish = function(a, c, l) {
            c = void 0 === c ? {} : c;
            l = void 0 === l ? function() {} : l;
            c.maxVideoBW = c.maxVideoBW || n.defaultVideoBW;
            c.maxVideoBW > n.maxVideoBW && (c.maxVideoBW = n.maxVideoBW);
            void 0 === c.minVideoBW && (c.minVideoBW = 0);
            c.minVideoBW > n.defaultVideoBW && (c.minVideoBW = n.defaultVideoBW);
            a.forceTurn = c.forceTurn;
            c.simulcast = c.simulcast || !1;
            c.muteStream = {
                audio: a.audioMuted,
                video: a.videoMuted
            };
            a && a.local && !a.failed && !r.has(a.getID()) ? a.hasMedia() ? a.isExternal() ? J(a, c, l) : p.p2p ? I(a, c, l) : M(a, c, l) : a.hasData() && K(a, c, l) : (b.a.error("Trying to publish invalid stream"), l(void 0, "Invalid Stream"))
        };
        p.startRecording = function(a, c) {
            c = void 0 === c ? function() {} : c;
            void 0 === a ? (b.a.error("Trying to start recording on an invalid stream", a), c(void 0, "Invalid Stream")) : (b.a.debug("Start Recording stream: " +
                a.getID()), v.sendMessage("startRecorder", {
                to: a.getID()
            }, function(a, l) {
                null === a ? (b.a.error("Error on start recording", l), c(void 0, l)) : (b.a.info("Start recording", a), c(a))
            }))
        };
        p.stopRecording = function(a, c) {
            c = void 0 === c ? function() {} : c;
            v.sendMessage("stopRecorder", {
                id: a
            }, function(l, d) {
                null === l ? (b.a.error("Error on stop recording", d), c(void 0, d)) : (b.a.info("Stop recording", a), c(!0))
            })
        };
        p.unpublish = function(a, c) {
            c = void 0 === c ? function() {} : c;
            a && a.local ? (v.sendMessage("unpublish", a.getID(), function(l, d) {
                null ===
                    l ? (b.a.error("Error unpublishing stream", d), c(void 0, d)) : (delete a.failed, b.a.info("Stream unpublished"), c(!0))
            }), a.room = void 0, a.hasMedia() && !a.isExternal() && l(a), r.remove(a.getID()), a.getID = function() {}, a.off("internal-send-data", A), a.off("internal-set-attributes", G)) : (b.a.error("Cannot unpublish, stream does not exist or is not local"), c(void 0, "Cannot unpublish, stream does not exist or is not local"))
        };
        p.sendControlMessage = function(a, b, c) {
            a && a.getID() && (b = {
                type: "control",
                action: c
            }, v.sendSDP("signaling_message", {
                streamId: a.getID(),
                msg: b
            }))
        };
        p.subscribe = function(a, c, l) {
            c = void 0 === c ? {} : c;
            l = void 0 === l ? function() {} : l;
            if (!a || a.local || a.failed) c = "Error on subscribe", a ? a.local ? (b.a.warning("Cannot subscribe to local stream, you should subscribe to the remote version of your local stream"), c = "Local copy of stream") : a.failed && (b.a.warning("Cannot subscribe to failed stream."), c = "Failed stream") : (b.a.warning("Cannot subscribe to invalid stream"), c = "Invalid or undefined stream"), l(void 0, c);
            else {
                if (a.hasMedia()) a.hasVideo() ||
                    a.hasScreen() || (c.video = !1), a.hasAudio() || (c.audio = !1), c.muteStream = {
                        audio: a.audioMuted,
                        video: a.videoMuted
                    }, a.forceTurn = c.forceTurn, p.p2p ? (v.sendSDP("subscribe", {
                        streamId: a.getID(),
                        metadata: c.metadata
                    }), l(!0)) : O(a, c, l);
                else if (a.hasData() && !1 !== c.data) P(a, c, l);
                else {
                    b.a.warning("There's nothing to subscribe to");
                    l(void 0, "Nothing to subscribe to");
                    return
                }
                b.a.info("Subscribing to: " + a.getID())
            }
        };
        p.unsubscribe = function(a, c) {
            c = void 0 === c ? function() {} : c;
            void 0 !== v && a && !a.local && v.sendMessage("unsubscribe",
                a.getID(),
                function(b, d) {
                    null === b ? c(void 0, d) : (l(a), delete a.failed, c(!0))
                },
                function() {
                    b.a.error("Error calling unsubscribe.")
                })
        };
        p.getStreamStats = function(a, b) {
            b = void 0 === b ? function() {} : b;
            if (!v) return "Error getting stats - no socket";
            if (!a) return "Error getting stats - no stream";
            v.sendMessage("getStreamStats", a.getID(), function(a) {
                a && b(a)
            })
        };
        p.getStreamsByAttribute = function(a, b) {
            var c = [];
            h.forEach(function(l) {
                void 0 !== l.getAttributes() && l.getAttributes()[a] === b && c.push(l)
            });
            return c
        };
        p.on("room-disconnected",
            function() {
                p.state = 0;
                v.state = v.DISCONNECTED;
                h.forEach(function(a, b) {
                    l(a);
                    h.remove(b);
                    a && !a.failed && (a = Object(g.d)({
                        type: "stream-removed",
                        stream: a
                    }), p.dispatchEvent(a))
                });
                h = Object(e.a)();
                r.forEach(function(a, b) {
                    l(a);
                    r.remove(b)
                });
                r = Object(e.a)();
                try {
                    v.disconnect()
                } catch (Q) {
                    b.a.debug("Socket already disconnected")
                }
                v = void 0
            });
        v.on("onAddStream", c.bind(null, function(b) {
            var c = Object(a.a)(p.Connection, {
                streamID: b.id,
                local: !1,
                audio: b.audio,
                video: b.video,
                data: b.data,
                screen: b.screen,
                attributes: b.attributes
            });
            c.room = p;
            h.add(b.id, c);
            b = Object(g.d)({
                type: "stream-added",
                stream: c
            });
            p.dispatchEvent(b)
        }));
        v.on("signaling_message_erizo",

            c.bind(null, function(a) {
                try {
                    var b;
                    (b = a.peerId ? h.get(a.peerId) : r.get(a.streamId)) && !b.failed && b.pc.processSignalingMessage(a.mess)
                } catch (err) {
                    console.log('processSignalingMessage error : ' + err);
                    w.disconnect() // dis and reconnect in wk service.  
                }

            }));
        v.on("signaling_message_peer", c.bind(null, function(a) {
            var b = r.get(a.streamId);
            b && !b.failed ? b.pc.get(a.peerSocket).processSignalingMessage(a.msg) : (b = h.get(a.streamId), b.pc || B(b, a.peerSocket), b.pc.processSignalingMessage(a.msg))
        }));
        v.on("publish_me", c.bind(null,
            function(a) {
                var b = r.get(a.streamId);
                C(b, a.peerSocket)
            }));
        v.on("unpublish_me", c.bind(null, function(a) {
            var b = r.get(a.streamId);
            b && (a = a.peerSocket, void 0 !== b.pc && b.pc.has(a) && (b.pc.get(a).close(), b.pc.remove(a)))
        }));
        v.on("onBandwidthAlert", c.bind(null, function(a) {
            b.a.info("Bandwidth Alert on", a.streamID, "message", a.message, "BW:", a.bandwidth);
            if (a.streamID) {
                var c = h.get(a.streamID);
                c && !c.failed && (a = Object(g.d)({
                    type: "bandwidth-alert",
                    stream: c,
                    msg: a.message,
                    bandwidth: a.bandwidth
                }), c.dispatchEvent(a))
            }
        }));
        v.on("onDataStream", c.bind(null, function(a) {
            var b = h.get(a.id);
            a = Object(g.d)({
                type: "stream-data",
                msg: a.msg,
                stream: b
            });
            b.dispatchEvent(a)
        }));
        v.on("onUpdateAttributeStream", c.bind(null, function(a) {
            var b = h.get(a.id),
                c = Object(g.d)({
                    type: "stream-attributes-update",
                    attrs: a.attrs,
                    stream: b
                });
            b.updateLocalAttributes(a.attrs);
            b.dispatchEvent(c)
        }));
        v.on("onRemoveStream", c.bind(null, function(a) {
            var b = r.get(a.id);
            if (b) u(b);
            else if (b = h.get(a.id)) h.remove(a.id), l(b), a = Object(g.d)({
                    type: "stream-removed",
                    stream: b
                }),
                p.dispatchEvent(a)
        }));
        v.on("disconnect", c.bind(null, function() {
            b.a.info("Socket disconnected, lost connection to ErizoController");
            if (0 !== p.state) {
                b.a.error("Unexpected disconnection from ErizoController");
                var a = Object(g.c)({
                    type: "room-disconnected",
                    message: "unexpected-disconnection"
                });
                p.dispatchEvent(a)
            }
        }));
        v.on("connection_failed", c.bind(null, function(a) {
            if (a.streamId) {
                var c = "ICE Connection Failed on " + a.type + " " + a.streamId + " " + p.state;
                b.a.error(c);
                a = "publish" === a.type ? r.get(a.streamId) : h.get(a.streamId);
                u(a, c)
            }
        }));
        v.on("error", c.bind(null, function(a) {
            b.a.error("Cannot connect to erizo Controller");
            a = Object(g.c)({
                type: "room-error",
                message: a
            });
            p.dispatchEvent(a)
        }));
        return p
    }
}, function(m, q) {
    m.exports = function(h) {
        if (!h.webpackPolyfill) {
            var f = Object.create(h);
            f.children || (f.children = []);
            Object.defineProperty(f, "loaded", {
                enumerable: !0,
                get: function() {
                    return f.l
                }
            });
            Object.defineProperty(f, "id", {
                enumerable: !0,
                get: function() {
                    return f.i
                }
            });
            Object.defineProperty(f, "exports", {
                enumerable: !0
            });
            f.webpackPolyfill =
                1
        }
        return f
    }
}, function(m, q, h) {
    var f = h(8),
        g = h(20),
        d = h(0);
    q.a = function(a) {
        d.a.info("Starting Chrome stable stack", a);
        var e = Object(f.a)(a);
        e.enableSimulcast = function(d) {
            var b = d;
            if (!a.video || !a.simulcast) return b;
            d = b.match(/a=ssrc-group:FID ([0-9]*) ([0-9]*)\r?\n/);
            if (!d || 0 >= d.length) return b;
            var c = a.simulcast.numSpatialLayers || 2;
            var e = parseInt(d[1], 10),
                f = parseInt(d[2], 10),
                k = b.match(new RegExp("a\x3dssrc:" + d[1] + " cname:(.*)\r?\n"))[1],
                v = b.match(new RegExp("a\x3dssrc:" + d[1] + " msid:(.*)\r?\n"))[1],
                h = b.match(new RegExp("a\x3dssrc:" +
                    d[1] + " mslabel:(.*)\r?\n"))[1],
                r = b.match(new RegExp("a\x3dssrc:" + d[1] + " label:(.*)\r?\n"))[1];
            b.match(new RegExp("a\x3dssrc:" + d[1] + ".*\r?\n", "g")).forEach(function(a) {
                b = b.replace(a, "")
            });
            b.match(new RegExp("a\x3dssrc:" + d[2] + ".*\r?\n", "g")).forEach(function(a) {
                b = b.replace(a, "")
            });
            for (var l = [e], u = [f], w = 1; w < c; w += 1) l.push(e + 1E3 * w), u.push(f + 1E3 * w);
            c = g.a.addSim(l);
            for (w = 0; w < l.length; w += 1) e = l[w], f = u[w], c += g.a.addGroup(e, f);
            for (w = 0; w < l.length; w += 1) e = l[w], f = u[w], c += g.a.addSpatialLayer(k, v, h, r, e, f);
            return b.replace(d[0],
                c + "a\x3dx-google-flag:conference\r\n")
        };
        return e
    }
}, function(m, q, h) {
    q = h(29);
    var f = h(10),
        g = h(11),
        d = h(12),
        a = h(13),
        e = h(14),
        k = h(4),
        b = h(16),
        c = h(17),
        t = h(18),
        n = h(19);
    h = h(6);
    m.exports = {
        SDPInfo: q,
        CandidateInfo: f,
        CodecInfo: g,
        DTLSInfo: d,
        ICEInfo: a,
        MediaInfo: e,
        Setup: k,
        SourceGroupInfo: b,
        SourceInfo: c,
        StreamInfo: t,
        TrackInfo: n,
        Direction: h
    }
}, function(m, q, h) {
    function f(a, b) {
        var l = new Map;
        b.rtp.forEach(function(d) {
            var r = d.payload,
                e = d.codec,
                f = d.rate;
            d = d.encoding;
            var k = {},
                u = [];
            b.fmtp.forEach(function(a) {
                a.payload === r &&
                    a.config.split(";").forEach(function(a) {
                        a = a.split("\x3d");
                        k[a[0].trim()] = (a[1] || "").trim()
                    })
            });
            b.rtcpFb && b.rtcpFb.forEach(function(a) {
                a.payload === r && u.push({
                    type: a.type,
                    subtype: a.subtype
                })
            });
            "RTX" === e.toUpperCase() ? l.set(parseInt(k.apt, 10), r) : a.addCodec(new c(e, r, f, d, k, u))
        });
        l.forEach(function(b, c) {
            (c = a.getCodecForType(c)) && c.setRTX(b)
        })
    }

    function g(a, b) {
        (b = b.rids) && b.forEach(function(b) {
            var c = new F(b.id, r.byValue(b.direction)),
                l = [],
                d = new Map;
            if (b.params) {
                var e = k.parseParams(b.params);
                Object.keys(e).forEach(function(a) {
                    "pt" ===
                    a ? l = e[a].split(",") : d.set(a, e[a])
                });
                c.setFormats(l);
                c.setParams(d)
            }
            a.addRID(c)
        })
    }

    function d(a, b, c) {
        var l = b.simulcast["dir" + a];
        a = b.simulcast["list" + a];
        if (l) {
            var d = r.byValue(l);
            k.parseSimulcastStreamList(a).forEach(function(a) {
                var b = [];
                a.forEach(function(a) {
                    b.push(new D(a.scid, a.paused))
                });
                c.addSimulcastAlternativeStreams(d, b)
            })
        }
    }

    function a(a, b) {
        var c = [];
        if (b.simulcast) {
            var l = new C;
            d("1", b, l);
            d("2", b, l);
            l.getSimulcastStreams(r.SEND).forEach(function(b) {
                var l = [];
                b.forEach(function(b) {
                    var c = new B(b.getId(),
                        b.isPaused());
                    if (b = a.getRID(c.getId())) b.getFormats().forEach(function(b) {
                        (b = a.getCodecForType(b)) && c.addCodec(b)
                    }), c.setParams(b.getParams()), l.push(c)
                });
                l.length && c.push(l)
            });
            a.setSimulcast(l)
        }
        b.simulcast_03 && (l = new C, l.setSimulcastPlainString(b.simulcast_03.value), a.setSimulcast03(l));
        return c
    }

    function e(a, b, c) {
        var d = new Map,
            r = c.type;
        if (c.ssrcs) {
            var e, f, k;
            c.ssrcs.forEach(function(c) {
                var l = c.id,
                    n = c.attribute;
                c = c.value;
                k = d.get(l);
                k || (k = new u(l), d.set(k.getSSRC(), k));
                "cname" === n.toLowerCase() ? k.setCName(c) :
                    "mslabel" === n.toLowerCase() ? k.setMSLabel(c) : "label" === n.toLowerCase() ? k.setLabel(c) : "msid" === n.toLowerCase() && (n = c.split(" "), l = n[0], n = n[1], k.setStreamId(l), k.setTrackId(n), f = b.getStream(l), f || (f = new w(l), b.addStream(f)), e = f.getTrack(n), e || (e = new x(r, n), e.setEncodings(a), f.addTrack(e)), e.addSSRC(k))
            })
        }
        if (c.msid) {
            var n = c.msid.split(" "),
                g = n[0],
                t = n[1];
            n = b.getStream(g);
            n || (n = new w(g), b.addStream(n));
            var p = n.getTrack(t);
            p || (p = new x(r, t), p.setMediaId(c.mid), p.setEncodings(a), n.addTrack(p));
            d.forEach(function(a,
                b) {
                a = d.get(b);
                a.getStreamId() || (a.setStreamId(g), a.setTrackId(t), p.addSSRC(a))
            })
        }
        c.ssrcGroups && c.ssrcGroups.forEach(function(a) {
            var c = a.ssrcs.split(" ");
            a = new l(a.semantics, c);
            c = d.get(parseInt(c[0], 10));
            b.getStream(c.getStreamId()).getTrack(c.getTrackId()).addSourceGroup(a)
        })
    }
    var k = h(30),
        b = h(10),
        c = h(11),
        t = h(12),
        n = h(13),
        p = h(14),
        v = h(4),
        y = h(6),
        r = h(2),
        l = h(16),
        u = h(17),
        w = h(18),
        x = h(19),
        B = h(33),
        C = h(15),
        D = h(34),
        F = h(35),
        z = function(a) {
            this.version = a || 1;
            this.name = "sdp-semantic";
            this.streams = new Map;
            this.medias = [];
            this.candidates = [];
            this.dtls = this.ice = this.connection = null
        };
    z.prototype.clone = function() {
        var a = new z(this.version);
        a.name = this.name;
        a.setConnection(this.connection);
        this.medias.forEach(function(b) {
            a.addMedia(b.clone())
        });
        this.streams.forEach(function(b) {
            a.addStream(b.clone())
        });
        this.candidates.forEach(function(b) {
            a.addCandidate(b.clone())
        });
        a.setICE(this.ice.clone());
        a.setDTLS(this.dtls.clone());
        return a
    };
    z.prototype.plain = function() {
        var a = {
            version: this.version,
            name: this.name,
            streams: [],
            medias: [],
            candidates: [],
            connection: this.connection
        };
        this.medias.forEach(function(b) {
            a.medias.push(b.plain())
        });
        this.streams.forEach(function(b) {
            a.streams.push(b.plain())
        });
        this.candidates.forEach(function(b) {
            a.candidates.push(b.plain())
        });
        a.ice = this.ice && this.ice.plain();
        a.dtls = this.dtls && this.dtls.plain();
        return a
    };
    z.prototype.setVersion = function(a) {
        this.version = a
    };
    z.prototype.setOrigin = function(a) {
        this.origin = a
    };
    z.prototype.setName = function(a) {
        this.name = a
    };
    z.prototype.getConnection = function() {
        return this.connection
    };
    z.prototype.setConnection = function(a) {
        this.connection = a
    };
    z.prototype.setTiming = function(a) {
        this.timing = a
    };
    z.prototype.addMedia = function(a) {
        this.medias.push(a)
    };
    z.prototype.getMedia = function(a) {
        var b;
        this.medias.forEach(function(c) {
            c.getType().toLowerCase() === a.toLowerCase() && (b = c)
        });
        return b
    };
    z.prototype.getMedias = function(a) {
        if (!a) return this.medias;
        var b = [];
        this.medias.forEach(function(c) {
            c.getType().toLowerCase() === a.toLowerCase() && b.push(c)
        });
        return b
    };
    z.prototype.getMediaById = function(a) {
        var b;
        this.medias.forEach(function(c) {
            c.getId().toLowerCase() === a.toLowerCase() && (b = c)
        });
        return b
    };
    z.prototype.getVersion = function() {
        return this.version
    };
    z.prototype.getDTLS = function() {
        return this.dtls
    };
    z.prototype.setDTLS = function(a) {
        this.dtls = a
    };
    z.prototype.getICE = function() {
        return this.ice
    };
    z.prototype.setICE = function(a) {
        this.ice = a
    };
    z.prototype.addCandidate = function(a) {
        this.candidates.push(a)
    };
    z.prototype.addCandidates = function(a) {
        var b = this;
        a.forEach(function(a) {
            b.addCandidate(a)
        })
    };
    z.prototype.getCandidates =
        function() {
            return this.candidates
        };
    z.prototype.getStream = function(a) {
        return this.streams.get(a)
    };
    z.prototype.getStreams = function() {
        return this.streams
    };
    z.prototype.getFirstStream = function() {
        return 0 < this.streams.values().length ? this.streams.values()[0] : null
    };
    z.prototype.addStream = function(a) {
        this.streams.set(a.getId(), a)
    };
    z.prototype.removeStream = function(a) {
        this.streams.delete(a.getId())
    };
    z.prototype.toJSON = function() {
        var a = {
            version: 0,
            media: []
        };
        a.version = this.version || 0;
        a.origin = this.origin || {
            username: "-",
            sessionId: (new Date).getTime(),
            sessionVersion: this.version,
            netType: "IN",
            ipVer: 4,
            address: "127.0.0.1"
        };
        a.name = this.name || "semantic-sdp";
        a.connection = this.getConnection();
        a.timing = this.timing || {
            start: 0,
            stop: 0
        };
        var b = this.getICE();
        b && (b.isLite() && (a.icelite = "ice-lite"), a.iceOptions = b.getOpts(), a.iceUfrag = b.getUfrag(), a.icePwd = b.getPwd());
        a.msidSemantic = this.msidSemantic || {
            semantic: "WMS",
            token: "*"
        };
        a.groups = [];
        var c = {
                type: "BUNDLE",
                mids: []
            },
            l = this.getDTLS();
        l && (a.fingerprint = {
                type: l.getHash(),
                hash: l.getFingerprint()
            },
            a.setup = v.toString(l.getSetup()));
        this.medias.forEach(function(d) {
            var e = {
                type: d.getType(),
                port: d.getPort(),
                protocol: "UDP/TLS/RTP/SAVPF",
                fmtp: [],
                rtp: [],
                rtcpFb: [],
                ext: [],
                bandwidth: [],
                candidates: [],
                ssrcGroups: [],
                ssrcs: [],
                rids: []
            };
            e.direction = y.toString(d.getDirection());
            e.rtcpMux = "rtcp-mux";
            e.connection = d.getConnection();
            e.xGoogleFlag = d.getXGoogleFlag();
            e.mid = d.getId();
            c.mids.push(d.getId());
            e.rtcp = d.rtcp;
            0 < d.getBitrate() && e.bandwidth.push({
                type: "AS",
                limit: d.getBitrate()
            });
            d.getCandidates().forEach(function(a) {
                e.candidates.push({
                    foundation: a.getFoundation(),
                    component: a.getComponentId(),
                    transport: a.getTransport(),
                    priority: a.getPriority(),
                    ip: a.getAddress(),
                    port: a.getPort(),
                    type: a.getType(),
                    generation: a.getGeneration()
                })
            });
            if (b = d.getICE()) b.isLite() && (e.icelite = "ice-lite"), e.iceOptions = b.getOpts(), e.iceUfrag = b.getUfrag(), e.icePwd = b.getPwd();
            if (l = d.getDTLS()) e.fingerprint = {
                type: l.getHash(),
                hash: l.getFingerprint()
            }, e.setup = v.toString(l.getSetup());
            d.getCodecs().forEach(function(a) {
                e.rtp.push({
                    payload: a.getType(),
                    codec: a.getCodec(),
                    rate: a.getRate(),
                    encoding: a.getEncoding()
                });
                var b = a.getParams();
                0 < Object.keys(b).length && e.fmtp.push({
                    payload: a.getType(),
                    config: Object.keys(b).map(function(a) {
                        return a + (b[a] ? "\x3d" + b[a] : "")
                    }).join(";")
                });
                a.getFeedback().forEach(function(b) {
                    e.rtcpFb.push({
                        payload: a.getType(),
                        type: b.type,
                        subtype: b.subtype
                    })
                });
                a.hasRTX() && (e.rtp.push({
                    payload: a.getRTX(),
                    codec: "rtx",
                    rate: a.getRate(),
                    encoding: a.getEncoding()
                }), e.fmtp.push({
                    payload: a.getRTX(),
                    config: "apt\x3d" + a.getType()
                }))
            });
            var f = [];
            e.rtp.forEach(function(a) {
                f.push(a.payload)
            });
            e.payloads = f.join(" ");
            d.getExtensions().forEach(function(a, b) {
                e.ext.push({
                    value: b,
                    uri: a
                })
            });
            d.getRIDs().forEach(function(a) {
                var b = {
                    id: a.getId(),
                    direction: r.toString(a.getDirection()),
                    params: ""
                };
                a.getFormats().length && (b.params = "pt\x3d" + a.getFormats().join(","));
                a.getParams().forEach(function(a, c) {
                    b.params += "" + (b.params.length ? ";" : "") + c + "\x3d" + a
                });
                e.rids.push(b)
            });
            var k = d.getSimulcast();
            d = d.getSimulcast03();
            if (k) {
                var n = 1;
                e.simulcast = {};
                var u = k.getSimulcastStreams(r.SEND);
                k = k.getSimulcastStreams(r.RECV);
                if (u && u.length) {
                    var g =
                        "";
                    u.forEach(function(a) {
                        var b = "";
                        a.forEach(function(a) {
                            b += (b.length ? "," : "") + (a.isPaused() ? "~" : "") + a.getId()
                        });
                        g += (g.length ? ";" : "") + b
                    });
                    e.simulcast["dir" + n] = "send";
                    e.simulcast["list" + n] = g;
                    n += 1
                }
                if (k && k.length) {
                    var t = [];
                    k.forEach(function(a) {
                        var b = "";
                        a.forEach(function(a) {
                            b += (b.length ? "," : "") + (a.isPaused() ? "~" : "") + a.getId()
                        });
                        t += (t.length ? ";" : "") + b
                    });
                    e.simulcast["dir" + n] = "recv";
                    e.simulcast["list" + n] = t;
                    n += 1
                }
            }
            d && (e.simulcast_03 = {
                value: d.getSimulcastPlainString()
            });
            a.media.push(e)
        });
        for (var d = $jscomp.makeIterator(this.streams.values()),
                e = d.next(); !e.done; e = d.next()) {
            e = e.value;
            for (var f = $jscomp.makeIterator(e.getTracks().values()), k = f.next(); !k.done; k = f.next()) {
                k = k.value;
                for (var n = {}, u = $jscomp.makeIterator(a.media), g = u.next(); !g.done; n = {
                        md: n.md
                    }, g = u.next())
                    if (n.md = g.value, k.getMediaId()) {
                        if (k.getMediaId() === n.md.mid) {
                            k.getSourceGroups().forEach(function(a) {
                                return function(b) {
                                    a.md.ssrcGroups.push({
                                        semantics: b.getSemantics(),
                                        ssrcs: b.getSSRCs().join(" ")
                                    })
                                }
                            }(n));
                            k.getSSRCs().forEach(function(a) {
                                return function(b) {
                                    a.md.ssrcs.push({
                                        id: b.ssrc,
                                        attribute: "cname",
                                        value: b.getCName()
                                    })
                                }
                            }(n));
                            e.getId() && k.getId() && (n.md.msid = e.getId() + " " + k.getId());
                            break
                        }
                    } else if (n.md.type.toLowerCase() === k.getMedia().toLowerCase()) {
                    k.getSourceGroups().forEach(function(a) {
                        return function(b) {
                            a.md.ssrcGroups.push({
                                semantics: b.getSemantics(),
                                ssrcs: b.getSSRCs().join(" ")
                            })
                        }
                    }(n));
                    k.getSSRCs().forEach(function(a) {
                        return function(b) {
                            a.md.ssrcs.push({
                                id: b.ssrc,
                                attribute: "cname",
                                value: b.getCName()
                            });
                            b.getStreamId() && b.getTrackId() && a.md.ssrcs.push({
                                id: b.ssrc,
                                attribute: "msid",
                                value: b.getStreamId() + " " + b.getTrackId()
                            });
                            b.getMSLabel() && a.md.ssrcs.push({
                                id: b.ssrc,
                                attribute: "mslabel",
                                value: b.getMSLabel()
                            });
                            b.getLabel() && a.md.ssrcs.push({
                                id: b.ssrc,
                                attribute: "label",
                                value: b.getLabel()
                            })
                        }
                    }(n));
                    break
                }
            }
        }
        c.mids = c.mids.join(" ");
        a.groups.push(c);
        return a
    };
    z.prototype.toString = function() {
        var a = this.toJSON();
        return k.write(a)
    };
    z.processString = function(a) {
        a = k.parse(a);
        return z.process(a)
    };
    z.process = function(c) {
        var l = new z;
        l.setVersion(c.version);
        l.setTiming(c.timing);
        l.setConnection(c.connection);
        l.setOrigin(c.origin);
        l.msidSemantic = c.msidSemantic;
        l.name = c.name;
        var d = c.iceUfrag,
            r = c.icePwd,
            k = c.iceOptions;
        (d || r || k) && l.setICE(new n(d, r, k));
        var u = c.fingerprint;
        if (u) {
            var w = u.type,
                x = u.hash,
                h = v.ACTPASS;
            c.setup && (h = v.byValue(c.setup));
            l.setDTLS(new t(h, w, x))
        }
        c.media.forEach(function(c) {
            var w = new p(c.mid, c.port, c.type);
            w.setXGoogleFlag(c.xGoogleFlag);
            w.rtcp = c.rtcp;
            w.setConnection(c.connection);
            c.bandwidth && 0 < c.bandwidth.length && c.bandwidth.forEach(function(a) {
                "AS" === a.type && w.setBitrate(a.limit)
            });
            d = c.iceUfrag;
            r = c.icePwd;
            k = c.iceOptions;
            (d || r || k) && w.setICE(new n(d, r, k));
            if (u = c.fingerprint) {
                var x = u.type,
                    h = u.hash,
                    C = v.ACTPASS;
                c.setup && (C = v.byValue(c.setup));
                w.setDTLS(new t(C, x, h))
            }
            x = y.SENDRECV;
            c.direction && (x = y.byValue(c.direction.toUpperCase()));
            w.setDirection(x);
            (x = c.candidates) && x.forEach(function(a) {
                w.addCandidate(new b(a.foundation, a.component, a.transport, a.priority, a.ip, a.port, a.type, a.generation, a.relAddr, a.relPort))
            });
            f(w, c);
            (x = c.ext) && x.forEach(function(a) {
                w.addExtension(a.value, a.uri)
            });
            g(w, c);
            x = a(w, c);
            e(x, l, c);
            l.addMedia(w)
        });
        return l
    };
    m.exports = z
}, function(m, q, h) {
    m = h(31);
    h = h(32);
    q.write = h;
    q.parse = m.parse;
    q.parseFmtpConfig = m.parseFmtpConfig;
    q.parseParams = m.parseParams;
    q.parsePayloads = m.parsePayloads;
    q.parseRemoteCandidates = m.parseRemoteCandidates;
    q.parseImageAttributes = m.parseImageAttributes;
    q.parseSimulcastStreamList = m.parseSimulcastStreamList
}, function(m, q, h) {
    var f = function(a) {
            return String(Number(a)) === a ? Number(a) : a
        },
        g = h(9),
        d = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
    q.parse =
        function(a) {
            var e = {},
                b = [],
                c = e;
            a.split(/(\r\n|\r|\n)/).filter(d).forEach(function(a) {
                var d = a[0],
                    e = a.slice(2);
                "m" === d && (b.push({
                    rtp: [],
                    fmtp: []
                }), c = b[b.length - 1]);
                for (a = 0; a < (g[d] || []).length; a += 1) {
                    var k = g[d][a];
                    if (k.reg.test(e)) {
                        d = k;
                        a = c;
                        k = e;
                        e = d.name && d.names;
                        d.push && !a[d.push] ? a[d.push] = [] : e && !a[d.name] && (a[d.name] = {});
                        e = d.push ? {} : e ? a[d.name] : a;
                        k = k.match(d.reg);
                        var t = e,
                            r = d.names,
                            l = d.name;
                        if (l && !r) t[l] = f(k[1]);
                        else
                            for (l = 0; l < r.length; l += 1) null != k[l + 1] && (t[r[l]] = f(k[l + 1]));
                        d.push && a[d.push].push(e);
                        break
                    }
                }
            });
            e.media = b;
            return e
        };
    var a = function(a, d) {
        d = d.split(/=(.+)/, 2);
        2 === d.length && (a[d[0]] = f(d[1]));
        return a
    };
    q.parseParams = function(d) {
        return d.split(/;\s?/).reduce(a, {})
    };
    q.parseFmtpConfig = q.parseParams;
    q.parsePayloads = function(a) {
        return a.split(" ").map(Number)
    };
    q.parseRemoteCandidates = function(a) {
        var d = [];
        a = a.split(" ").map(f);
        for (var b = 0; b < a.length; b += 3) d.push({
            component: a[b],
            ip: a[b + 1],
            port: a[b + 2]
        });
        return d
    };
    q.parseImageAttributes = function(d) {
        return d.split(" ").map(function(d) {
            return d.substring(1,
                d.length - 1).split(",").reduce(a, {})
        })
    };
    q.parseSimulcastStreamList = function(a) {
        return a.split(";").map(function(a) {
            return a.split(",").map(function(a) {
                var b = !1;
                "~" !== a[0] ? a = f(a) : (a = f(a.substring(1, a.length)), b = !0);
                return {
                    scid: a,
                    paused: b
                }
            })
        })
    }
}, function(m, q, h) {
    var f = h(9),
        g = /%[sdv%]/g,
        d = function(a) {
            var b = 1,
                d = arguments,
                e = d.length;
            return a.replace(g, function(a) {
                if (b >= e) return a;
                var c = d[b];
                b += 1;
                switch (a) {
                    case "%%":
                        return "%";
                    case "%s":
                        return String(c);
                    case "%d":
                        return Number(c);
                    case "%v":
                        return ""
                }
            })
        },
        a =
        function(a, c, e) {
            var b = c.format instanceof Function ? c.format(c.push ? e : e[c.name]) : c.format;
            a = [a + "\x3d" + b];
            if (c.names)
                for (b = 0; b < c.names.length; b += 1) {
                    var k = c.names[b];
                    c.name ? a.push(e[c.name][k]) : a.push(e[c.names[b]])
                } else a.push(e[c.name]);
            return d.apply(null, a)
        },
        e = "vosiuepcbtrza".split(""),
        k = ["i", "c", "b", "a"];
    m.exports = function(b, c) {
        c = c || {};
        null == b.version && (b.version = 0);
        null == b.name && (b.name = " ");
        b.media.forEach(function(a) {
            null == a.payloads && (a.payloads = "")
        });
        var d = c.innerOrder || k,
            n = [];
        (c.outerOrder ||
            e).forEach(function(c) {
            f[c].forEach(function(d) {
                d.name in b && null != b[d.name] ? n.push(a(c, d, b)) : d.push in b && null != b[d.push] && b[d.push].forEach(function(b) {
                    n.push(a(c, d, b))
                })
            })
        });
        b.media.forEach(function(b) {
            n.push(a("m", f.m[0], b));
            d.forEach(function(c) {
                f[c].forEach(function(d) {
                    d.name in b && null != b[d.name] ? n.push(a(c, d, b)) : d.push in b && null != b[d.push] && b[d.push].forEach(function(b) {
                        n.push(a(c, d, b))
                    })
                })
            })
        });
        return n.join("\r\n") + "\r\n"
    }
}, function(m, q) {
    var h = function(f, g) {
        this.id = f;
        this.paused = g;
        this.codecs =
            new Map;
        this.params = new Map
    };
    h.prototype.clone = function() {
        var f = new h(this.id, this.paused);
        this.codecs.forEach(function(g) {
            f.addCodec(g.cloned())
        });
        f.setParams(this.params);
        return f
    };
    h.prototype.plain = function() {
        var f = this,
            g = {
                id: this.id,
                paused: this.paused,
                codecs: {},
                params: {}
            };
        this.codecs.keys().forEach(function(d) {
            g.codecs[d] = f.codecs.get(d).plain()
        });
        this.params.keys().forEach(function(d) {
            g.params[d] = f.params.get(d).param
        });
        return g
    };
    h.prototype.getId = function() {
        return this.id
    };
    h.prototype.getCodecs =
        function() {
            return this.codecs
        };
    h.prototype.addCodec = function(f) {
        this.codecs.set(f.getType(), f)
    };
    h.prototype.getParams = function() {
        return this.params
    };
    h.prototype.setParams = function(f) {
        this.params = new Map(f)
    };
    h.prototype.isPaused = function() {
        return this.paused
    };
    m.exports = h
}, function(m, q) {
    var h = function(f, g) {
        this.paused = g;
        this.id = f
    };
    h.prototype.clone = function() {
        return new h(this.id, this.paused)
    };
    h.prototype.plain = function() {
        return {
            id: this.id,
            paused: this.paused
        }
    };
    h.prototype.isPaused = function() {
        return this.paused
    };
    h.prototype.getId = function() {
        return this.id
    };
    m.exports = h
}, function(m, q, h) {
    var f = h(2),
        g = function(d, a) {
            this.id = d;
            this.direction = a;
            this.formats = [];
            this.params = new Map
        };
    g.prototype.clone = function() {
        var d = new g(this.id, this.direction);
        d.setFormats(this.formats);
        d.setParams(this.params);
        return d
    };
    g.prototype.plain = function() {
        var d = {
            id: this.id,
            direction: f.toString(this.direction),
            formats: this.formats,
            params: {}
        };
        this.params.forEach(function(a, e) {
            d.params[e] = a
        });
        return d
    };
    g.prototype.getId = function() {
        return this.id
    };
    g.prototype.getDirection = function() {
        return this.direction
    };
    g.prototype.setDirection = function(d) {
        this.direction = d
    };
    g.prototype.getFormats = function() {
        return this.formats
    };
    g.prototype.setFormats = function(d) {
        var a = this;
        this.formats = [];
        d.forEach(function(d) {
            a.formats.push(parseInt(d, 10))
        })
    };
    g.prototype.getParams = function() {
        return this.params
    };
    g.prototype.setParams = function(d) {
        this.params = new Map(d)
    };
    m.exports = g
}, function(m, q, h) {
    var f = h(0),
        g = h(8);
    q.a = function(d) {
        f.a.info("Starting Firefox stack");
        var a =
            Object(g.a)(d),
            e = [{
                rid: "low",
                scaleResolutionDownBy: 3
            }, {
                rid: "med",
                scaleResolutionDownBy: 2
            }, {
                rid: "high"
            }],
            k = function() {
                d.simulcast && a.peerConnection.getSenders().forEach(function(a) {
                    if ("video" === a.track.kind) {
                        var b = d.simulcast.numSpatialLayers || 2,
                            c = e.length;
                        b = b < c ? b : c;
                        var k = a.getParameters() || {};
                        k.encodings = [];
                        for (var f = c - 1; f >= c - b; --f) k.encodings.push(e[f]);
                        a.setParameters(k)
                    }
                })
            };
        a.enableSimulcast = function(a) {
            return a
        };
        var b = a.createOffer;
        a.createOffer = function(a) {
            !0 !== a && k();
            b(a)
        };
        return a
    }
}, function(m,
    q, h) {
    var f = h(0);
    q.a = function(g) {
        var d = {
            pcConfig: {},
            peerConnection: {},
            desc: {},
            signalCallback: void 0,
            close: function() {
                f.a.info("Close FcStack")
            },
            createOffer: function() {
                f.a.debug("FCSTACK: CreateOffer")
            },
            addStream: function(a) {
                f.a.debug("FCSTACK: addStream", a)
            },
            processSignalingMessage: function(a) {
                f.a.debug("FCSTACK: processSignaling", a);
                void 0 !== d.signalCallback && d.signalCallback(a)
            },
            sendSignalingMessage: function(a) {
                f.a.debug("FCSTACK: Sending signaling Message", a);
                g.callback(a)
            },
            setSignalingCallback: function(a) {
                a =
                    void 0 === a ? function() {} : a;
                f.a.debug("FCSTACK: Setting signalling callback");
                d.signalCallback = a
            }
        };
        return d
    }
}, function(m, q, h) {
    h.d(q, "a", function() {
        return e
    });
    m = h(39);
    var f = h.n(m),
        g = h(0),
        d = h(1),
        a = function(a, b) {
            a = Object(d.b)({
                type: a
            });
            a.args = b.args;
            return a
        },
        e = function(e) {
            var b = Object(d.a)(),
                c = function() {},
                k = [];
            $jscomp.initSymbol();
            b.CONNECTED = Symbol("connected");
            $jscomp.initSymbol();
            b.RECONNECTING = Symbol("reconnecting");
            $jscomp.initSymbol();
            b.DISCONNECTED = Symbol("disconnected");
            b.state = b.DISCONNECTED;
            b.IO = void 0 === e ? f.a : e;
            var n, p = function(c, d) {
                    for (var l = [], e = 1; e < arguments.length; ++e) l[e - 1] = arguments[e];
                    b.emit(a(c, {
                        args: l
                    }))
                },
                v = function() {
                    b.state === b.CONNECTED && k.forEach(function(a) {
                        b.sendMessage.apply(b, [].concat($jscomp.arrayFromIterable(a)))
                    })
                };
            b.connect = function(a, d, l) {
                d = void 0 === d ? c : d;
                l = void 0 === l ? c : l;
                n = b.IO.connect((a.secure ? "wss://" : "ws://") + a.host, {
                    reconnection: !0,
                    reconnectionAttempts: 3,
                    secure: a.secure,
                    forceNew: !0,
                    transports: ["websocket"],
                    rejectUnauthorized: !1
                });
                var e = 1E3,
                    r = n.io.engine.transport.ws.onclose;
                n.io.engine.transport.ws.onclose = function(a) {
                    g.a.warning("WebSocket closed, code:", a.code);
                    e = a.code;
                    r(a)
                };
                b.socket = n;
                n.on("onAddStream", p.bind(b, "onAddStream"));
                n.on("signaling_message_erizo", p.bind(b, "signaling_message_erizo"));
                n.on("signaling_message_peer", p.bind(b, "signaling_message_peer"));
                n.on("publish_me", p.bind(b, "publish_me"));
                n.on("unpublish_me", p.bind(b, "unpublish_me"));
                n.on("onBandwidthAlert", p.bind(b, "onBandwidthAlert"));
                n.on("onDataStream", p.bind(b, "onDataStream"));
                n.on("onUpdateAttributeStream",
                    p.bind(b, "onUpdateAttributeStream"));
                n.on("onRemoveStream", p.bind(b, "onRemoveStream"));
                n.on("disconnect", function(a) {
                    g.a.debug("disconnect", b.id, a);
                    1E3 !== e ? b.state = b.RECONNECTING : (p("disconnect", a), n.close())
                });
                n.on("connection_failed", function() {
                    g.a.error("connection failed, id:", b.id);
                    p("connection_failed", {
                        streamId: b.id
                    })
                });
                n.on("error", function(a) {
                    g.a.warning("socket error, id:", b.id, ", error:", a.message);
                    p("error")
                });
                n.on("connect_error", function(a) {
                    g.a.warning("connect error, id:", b.id, ", error:",
                        a.message)
                });
                n.on("connect_timeout", function(a) {
                    g.a.warning("connect timeout, id:", b.id, ", error:", a.message)
                });
                n.on("reconnecting", function(a) {
                    g.a.debug("reconnecting, id:", b.id, ", attempet:", a)
                });
                n.on("reconnect", function(a) {
                    g.a.debug("reconnected, id:", b.id, ", attempet:", a);
                    b.state = b.CONNECTED;
                    n.emit("reconnected", b.id);
                    v()
                });
                n.on("reconnect_attempt", function(a) {
                    g.a.debug("reconnect attempt, id:", b.id, ", attempet:", a)
                });
                n.on("reconnect_error", function(a) {
                    g.a.debug("error reconnecting, id:", b.id,
                        ", error:", a.message)
                });
                n.on("reconnect_failed", function() {
                    g.a.warning("reconnect failed, id:", b.id);
                    b.state = b.DISCONNECTED;
                    p("disconnect", "reconnect failed")
                });
                b.sendMessage("token", a, function(a) {
                    b.state = b.CONNECTED;
                    b.id = a.clientId;
                    d(a)
                }, l)
            };
            b.disconnect = function() {
                b.state = b.DISCONNECTED;
                n.disconnect()
            };
            b.sendMessage = function(a, d, l, e) {
                l = void 0 === l ? c : l;
                e = void 0 === e ? c : e;
                b.state === b.DISCONNECTED && "token" !== a ? g.a.error("Trying to send a message over a disconnected Socket") : b.state === b.RECONNECTING ? k.push([a,
                    d, l, e
                ]) : n.emit(a, d, function(a, b) {
                    "success" === a ? l(b) : "error" === a ? e(b) : l(a, b)
                })
            };
            b.sendSDP = function(a, d, l, e) {
                e = void 0 === e ? c : e;
                b.state === b.DISCONNECTED ? g.a.error("Trying to send a message over a disconnected Socket") : n.emit(a, d, l, function(a, b) {
                    e(a, b)
                })
            };
            return b
        }
}, function(m, q, h) {
    ! function(f, g) {
        m.exports = g()
    }(this, function() {
        return function(f) {
            function g(a) {
                if (d[a]) return d[a].exports;
                var e = d[a] = {
                    exports: {},
                    id: a,
                    loaded: !1
                };
                return f[a].call(e.exports, e, e.exports, g), e.loaded = !0, e.exports
            }
            var d = {};
            return g.m =
                f, g.c = d, g.p = "", g(0)
        }([function(f, g, d) {
                function a(a, b) {
                    "object" === ("undefined" == typeof a ? "undefined" : e(a)) && (b = a, a = void 0);
                    b = b || {};
                    var d;
                    a = k(a);
                    var r = a.source,
                        l = a.id,
                        f = a.path;
                    f = n[l] && f in n[l].nsps;
                    return b.forceNew || b["force new connection"] || !1 === b.multiplex || f ? (t("ignoring socket cache for %s", r), d = c(r, b)) : (n[l] || (t("new io instance for %s", r), n[l] = c(r, b)), d = n[l]), a.query && !b.query && (b.query = a.query), d.socket(a.path, b)
                }
                $jscomp.initSymbol();
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                var e =
                    "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
                        return typeof a
                    } : function(a) {
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a
                    },
                    k = d(1),
                    b = d(7),
                    c = d(13),
                    t = d(3)("socket.io-client");
                f.exports = g = a;
                var n = g.managers = {};
                g.protocol = b.protocol;
                g.connect = a;
                g.Manager = d(13);
                g.Socket = d(39)
            }, function(f, g, d) {
                (function(a) {
                    var e = d(2),
                        k = d(3)("socket.io-client:url");
                    f.exports = function(b,
                        c) {
                        var d = b;
                        c = c || a.location;
                        null == b && (b = c.protocol + "//" + c.host);
                        "string" == typeof b && ("/" === b.charAt(0) && (b = "/" === b.charAt(1) ? c.protocol + b : c.host + b), /^(https?|wss?):\/\//.test(b) || (k("protocol-less url %s", b), b = "undefined" != typeof c ? c.protocol + "//" + b : "https://" + b), k("parse %s", b), d = e(b));
                        d.port || (/^(http|ws)$/.test(d.protocol) ? d.port = "80" : /^(http|ws)s$/.test(d.protocol) && (d.port = "443"));
                        d.path = d.path || "/";
                        b = -1 !== d.host.indexOf(":") ? "[" + d.host + "]" : d.host;
                        return d.id = d.protocol + "://" + b + ":" + d.port, d.href =
                            d.protocol + "://" + b + (c && c.port === d.port ? "" : ":" + d.port), d
                    }
                }).call(g, function() {
                    return this
                }())
            }, function(f, g) {
                var d = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                    a = "source protocol authority userInfo user password host port relative path directory file query anchor".split(" ");
                f.exports = function(e) {
                    var f = e,
                        b = e.indexOf("["),
                        c = e.indexOf("]"); - 1 != b && -1 != c && (e = e.substring(0, b) + e.substring(b, c).replace(/:/g, ";") + e.substring(c, e.length));
                    e = d.exec(e || "");
                    for (var g = {}, n = 14; n--;) g[a[n]] = e[n] || "";
                    return -1 != b && -1 != c && (g.source = f, g.host = g.host.substring(1, g.host.length - 1).replace(/;/g, ":"), g.authority = g.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), g.ipv6uri = !0), g
                }
            }, function(f, g, d) {
                (function(a) {
                    function e() {
                        try {
                            var b = g.storage.debug
                        } catch (t) {}
                        return !b && "undefined" != typeof a && "env" in a && (b = a.env.DEBUG), b
                    }
                    g = f.exports =
                        d(5);
                    g.log = function() {
                        return "object" == typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments)
                    };
                    g.formatArgs = function(a) {
                        var b = this.useColors;
                        if (a[0] = (b ? "%c" : "") + this.namespace + (b ? " %c" : " ") + a[0] + (b ? "%c " : " ") + "+" + g.humanize(this.diff), b) {
                            b = "color: " + this.color;
                            a.splice(1, 0, b, "color: inherit");
                            var c = 0,
                                d = 0;
                            a[0].replace(/%[a-zA-Z%]/g, function(a) {
                                "%%" !== a && (c++, "%c" === a && (d = c))
                            });
                            a.splice(d, 0, b)
                        }
                    };
                    g.save = function(a) {
                        try {
                            null == a ? g.storage.removeItem("debug") : g.storage.debug =
                                a
                        } catch (t) {}
                    };
                    g.load = e;
                    g.useColors = function() {
                        return !("undefined" == typeof window || !window.process || "renderer" !== window.process.type) || "undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && 31 <=
                            parseInt(RegExp.$1, 10) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)
                    };
                    var k = g;
                    if ("undefined" != typeof chrome && "undefined" != typeof chrome.storage) var b = chrome.storage.local;
                    else a: {
                        try {
                            b = window.localStorage;
                            break a
                        } catch (c) {}
                        b = void 0
                    }
                    k.storage = b;
                    g.colors = "lightseagreen forestgreen goldenrod dodgerblue darkorchid crimson".split(" ");
                    g.formatters.j = function(a) {
                        try {
                            return JSON.stringify(a)
                        } catch (t) {
                            return "[UnexpectedJSONParseError]: " +
                                t.message
                        }
                    };
                    g.enable(e())
                }).call(g, d(4))
            }, function(f, g) {
                function d() {
                    throw Error("setTimeout has not been defined");
                }

                function a() {
                    throw Error("clearTimeout has not been defined");
                }

                function e(a) {
                    if (p === setTimeout) return setTimeout(a, 0);
                    if ((p === d || !p) && setTimeout) return p = setTimeout, setTimeout(a, 0);
                    try {
                        return p(a, 0)
                    } catch (x) {
                        try {
                            return p.call(null, a, 0)
                        } catch (B) {
                            return p.call(this, a, 0)
                        }
                    }
                }

                function k(b) {
                    if (h === clearTimeout) return clearTimeout(b);
                    if ((h === a || !h) && clearTimeout) return h = clearTimeout, clearTimeout(b);
                    try {
                        return h(b)
                    } catch (x) {
                        try {
                            return h.call(null, b)
                        } catch (B) {
                            return h.call(this, b)
                        }
                    }
                }

                function b() {
                    l && y && (l = !1, y.length ? r = y.concat(r) : u = -1, r.length && c())
                }

                function c() {
                    if (!l) {
                        var a = e(b);
                        l = !0;
                        for (var c = r.length; c;) {
                            y = r;
                            for (r = []; ++u < c;) y && y[u].run();
                            u = -1;
                            c = r.length
                        }
                        y = null;
                        l = !1;
                        k(a)
                    }
                }

                function t(a, b) {
                    this.fun = a;
                    this.array = b
                }

                function n() {}
                f = f.exports = {};
                try {
                    var p = "function" == typeof setTimeout ? setTimeout : d
                } catch (w) {
                    p = d
                }
                try {
                    var h = "function" == typeof clearTimeout ? clearTimeout : a
                } catch (w) {
                    h = a
                }!0;
                var y, r = [],
                    l = !1,
                    u = -1;
                f.nextTick = function(a) {
                    var b = Array(arguments.length - 1);
                    if (1 < arguments.length)
                        for (var d = 1; d < arguments.length; d++) b[d - 1] = arguments[d];
                    r.push(new t(a, b));
                    1 !== r.length || l || e(c)
                };
                t.prototype.run = function() {
                    this.fun.apply(null, this.array)
                };
                f.title = "browser";
                f.browser = !0;
                f.env = {};
                f.argv = [];
                f.version = "";
                f.versions = {};
                f.on = n;
                f.addListener = n;
                f.once = n;
                f.off = n;
                f.removeListener = n;
                f.removeAllListeners = n;
                f.emit = n;
                f.prependListener = n;
                f.prependOnceListener = n;
                f.listeners = function(a) {
                    return []
                };
                f.binding = function(a) {
                    throw Error("process.binding is not supported");
                };
                f.cwd = function() {
                    return "/"
                };
                f.chdir = function(a) {
                    throw Error("process.chdir is not supported");
                };
                f.umask = function() {
                    return 0
                }
            }, function(f, g, d) {
                function a(a) {
                    var b, d = 0;
                    for (b in a) d = (d << 5) - d + a.charCodeAt(b), d |= 0;
                    return g.colors[Math.abs(d) % g.colors.length]
                }

                function e(b) {
                    function c() {
                        if (c.enabled) {
                            var a = +new Date;
                            c.diff = a - (k || a);
                            c.prev = k;
                            k = c.curr = a;
                            var b = Array(arguments.length);
                            for (a = 0; a < b.length; a++) b[a] = arguments[a];
                            b[0] = g.coerce(b[0]);
                            "string" != typeof b[0] && b.unshift("%O");
                            var d = 0;
                            b[0] = b[0].replace(/%([a-zA-Z%])/g,
                                function(a, e) {
                                    if ("%%" === a) return a;
                                    d++;
                                    e = g.formatters[e];
                                    "function" == typeof e && (a = e.call(c, b[d]), b.splice(d, 1), d--);
                                    return a
                                });
                            g.formatArgs.call(c, b);
                            (c.log || g.log || console.log.bind(console)).apply(c, b)
                        }
                    }
                    return c.namespace = b, c.enabled = g.enabled(b), c.useColors = g.useColors(), c.color = a(b), "function" == typeof g.init && g.init(c), c
                }
                g = f.exports = e.debug = e["default"] = e;
                g.coerce = function(a) {
                    return a instanceof Error ? a.stack || a.message : a
                };
                g.disable = function() {
                    g.enable("")
                };
                g.enable = function(a) {
                    g.save(a);
                    g.names = [];
                    g.skips = [];
                    for (var b = ("string" == typeof a ? a : "").split(/[\s,]+/), d = b.length, e = 0; e < d; e++) b[e] && (a = b[e].replace(/\*/g, ".*?"), "-" === a[0] ? g.skips.push(new RegExp("^" + a.substr(1) + "$")) : g.names.push(new RegExp("^" + a + "$")))
                };
                g.enabled = function(a) {
                    var b;
                    var d = 0;
                    for (b = g.skips.length; d < b; d++)
                        if (g.skips[d].test(a)) return !1;
                    d = 0;
                    for (b = g.names.length; d < b; d++)
                        if (g.names[d].test(a)) return !0;
                    return !1
                };
                g.humanize = d(6);
                g.names = [];
                g.skips = [];
                g.formatters = {};
                var k
            }, function(f, g) {
                function d(a) {
                    if (a = String(a), !(100 < a.length))
                        if (a =
                            /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(a)) {
                            var d = parseFloat(a[1]);
                            switch ((a[2] || "ms").toLowerCase()) {
                                case "years":
                                case "year":
                                case "yrs":
                                case "yr":
                                case "y":
                                    return d * t;
                                case "days":
                                case "day":
                                case "d":
                                    return d * c;
                                case "hours":
                                case "hour":
                                case "hrs":
                                case "hr":
                                case "h":
                                    return d * b;
                                case "minutes":
                                case "minute":
                                case "mins":
                                case "min":
                                case "m":
                                    return d * k;
                                case "seconds":
                                case "second":
                                case "secs":
                                case "sec":
                                case "s":
                                    return d *
                                        e;
                                case "milliseconds":
                                case "millisecond":
                                case "msecs":
                                case "msec":
                                case "ms":
                                    return d
                            }
                        }
                }

                function a(a, b, c) {
                    if (!(a < b)) return a < 1.5 * b ? Math.floor(a / b) + " " + c : Math.ceil(a / b) + " " + c + "s"
                }
                var e = 1E3,
                    k = 60 * e,
                    b = 60 * k,
                    c = 24 * b,
                    t = 365.25 * c;
                f.exports = function(f, g) {
                    g = g || {};
                    var n = typeof f;
                    if ("string" === n && 0 < f.length) return d(f);
                    if ("number" === n && !1 === isNaN(f)) return g["long"] ? a(f, c, "day") || a(f, b, "hour") || a(f, k, "minute") || a(f, e, "second") || f + " ms" : f >= c ? Math.round(f / c) + "d" : f >= b ? Math.round(f / b) + "h" : f >= k ? Math.round(f / k) + "m" : f >=
                        e ? Math.round(f / e) + "s" : f + "ms";
                    throw Error("val is not a non-empty string or a valid number. val\x3d" + JSON.stringify(f));
                }
            }, function(f, g, d) {
                function a() {}

                function e(a) {
                    var b = "" + a.type;
                    return g.BINARY_EVENT !== a.type && g.BINARY_ACK !== a.type || (b += a.attachments + "-"), a.nsp && "/" !== a.nsp && (b += a.nsp + ","), null != a.id && (b += a.id), null != a.data && (b += JSON.stringify(a.data)), n("encoded %j as %s", a, b), b
                }

                function k(a, b) {
                    h.removeBlobs(a, function(a) {
                        var c = h.deconstructPacket(a);
                        a = e(c.packet);
                        c = c.buffers;
                        c.unshift(a);
                        b(c)
                    })
                }

                function b() {
                    this.reconstructor = null
                }

                function c(a) {
                    this.reconPack = a;
                    this.buffers = []
                }

                function t() {
                    return {
                        type: g.ERROR,
                        data: "parser error"
                    }
                }
                var n = d(3)("socket.io-parser");
                f = d(8);
                var p = d(9),
                    h = d(11),
                    y = d(12);
                g.protocol = 4;
                g.types = "CONNECT DISCONNECT EVENT ACK ERROR BINARY_EVENT BINARY_ACK".split(" ");
                g.CONNECT = 0;
                g.DISCONNECT = 1;
                g.EVENT = 2;
                g.ACK = 3;
                g.ERROR = 4;
                g.BINARY_EVENT = 5;
                g.BINARY_ACK = 6;
                g.Encoder = a;
                g.Decoder = b;
                a.prototype.encode = function(a, b) {
                    (a.type !== g.EVENT && a.type !== g.ACK || !p(a.data) || (a.type = a.type ===
                        g.EVENT ? g.BINARY_EVENT : g.BINARY_ACK), n("encoding packet %j", a), g.BINARY_EVENT === a.type || g.BINARY_ACK === a.type) ? k(a, b): (a = e(a), b([a]))
                };
                f(b.prototype);
                b.prototype.add = function(a) {
                    if ("string" == typeof a) {
                        var b = 0,
                            d = {
                                type: Number(a.charAt(0))
                            };
                        if (null == g.types[d.type]) a = t();
                        else {
                            if (g.BINARY_EVENT === d.type || g.BINARY_ACK === d.type) {
                                for (var e = "";
                                    "-" !== a.charAt(++b) && (e += a.charAt(b), b != a.length););
                                if (e != Number(e) || "-" !== a.charAt(b)) throw Error("Illegal attachments");
                                d.attachments = Number(e)
                            }
                            if ("/" === a.charAt(b +
                                    1))
                                for (d.nsp = ""; ++b;) {
                                    e = a.charAt(b);
                                    if ("," === e) break;
                                    if (d.nsp += e, b === a.length) break
                                } else d.nsp = "/";
                            e = a.charAt(b + 1);
                            if ("" !== e && Number(e) == e) {
                                for (d.id = ""; ++b;) {
                                    e = a.charAt(b);
                                    if (null == e || Number(e) != e) {
                                        --b;
                                        break
                                    }
                                    if (d.id += a.charAt(b), b === a.length) break
                                }
                                d.id = Number(d.id)
                            }
                            if (a.charAt(++b)) {
                                b: {
                                    b = a.substr(b);
                                    try {
                                        d.data = JSON.parse(b)
                                    } catch (x) {
                                        b = t();
                                        break b
                                    }
                                    b = d
                                }
                                d = b
                            }
                            a = (n("decoded %s as %j", a, d), d)
                        }
                        g.BINARY_EVENT === a.type || g.BINARY_ACK === a.type ? (this.reconstructor = new c(a), 0 === this.reconstructor.reconPack.attachments &&
                            this.emit("decoded", a)) : this.emit("decoded", a)
                    } else {
                        if (!y(a) && !a.base64) throw Error("Unknown type: " + a);
                        if (!this.reconstructor) throw Error("got binary data when not reconstructing a packet");
                        (a = this.reconstructor.takeBinaryData(a)) && (this.reconstructor = null, this.emit("decoded", a))
                    }
                };
                b.prototype.destroy = function() {
                    this.reconstructor && this.reconstructor.finishedReconstruction()
                };
                c.prototype.takeBinaryData = function(a) {
                    return (this.buffers.push(a), this.buffers.length === this.reconPack.attachments) ? (a = h.reconstructPacket(this.reconPack,
                        this.buffers), this.finishedReconstruction(), a) : null
                };
                c.prototype.finishedReconstruction = function() {
                    this.reconPack = null;
                    this.buffers = []
                }
            }, function(f, g, d) {
                function a(d) {
                    if (d) {
                        for (var e in a.prototype) d[e] = a.prototype[e];
                        return d
                    }
                }
                f.exports = a;
                a.prototype.on = a.prototype.addEventListener = function(a, d) {
                    return this._callbacks = this._callbacks || {}, (this._callbacks["$" + a] = this._callbacks["$" + a] || []).push(d), this
                };
                a.prototype.once = function(a, d) {
                    function b() {
                        this.off(a, b);
                        d.apply(this, arguments)
                    }
                    return b.fn =
                        d, this.on(a, b), this
                };
                a.prototype.off = a.prototype.removeListener = a.prototype.removeAllListeners = a.prototype.removeEventListener = function(a, d) {
                    if (this._callbacks = this._callbacks || {}, 0 == arguments.length) return this._callbacks = {}, this;
                    var b = this._callbacks["$" + a];
                    if (!b) return this;
                    if (1 == arguments.length) return delete this._callbacks["$" + a], this;
                    for (var c, e = 0; e < b.length; e++)
                        if (c = b[e], c === d || c.fn === d) {
                            b.splice(e, 1);
                            break
                        }
                    return this
                };
                a.prototype.emit = function(a) {
                    this._callbacks = this._callbacks || {};
                    var d = [].slice.call(arguments, 1),
                        b = this._callbacks["$" + a];
                    if (b) {
                        b = b.slice(0);
                        for (var c = 0, e = b.length; c < e; ++c) b[c].apply(this, d)
                    }
                    return this
                };
                a.prototype.listeners = function(a) {
                    return this._callbacks = this._callbacks || {}, this._callbacks["$" + a] || []
                };
                a.prototype.hasListeners = function(a) {
                    return !!this.listeners(a).length
                }
            }, function(f, g, d) {
                (function(a) {
                    function e(b) {
                        if (!b || "object" != typeof b) return !1;
                        if (k(b)) {
                            for (var d = 0, f = b.length; d < f; d++)
                                if (e(b[d])) return !0;
                            return !1
                        }
                        if ("function" == typeof a.Buffer && a.Buffer.isBuffer &&
                            a.Buffer.isBuffer(b) || "function" == typeof a.ArrayBuffer && b instanceof ArrayBuffer || c && b instanceof Blob || g && b instanceof File) return !0;
                        if (b.toJSON && "function" == typeof b.toJSON && 1 === arguments.length) return e(b.toJSON(), !0);
                        for (d in b)
                            if (Object.prototype.hasOwnProperty.call(b, d) && e(b[d])) return !0;
                        return !1
                    }
                    var k = d(10),
                        b = Object.prototype.toString,
                        c = "function" == typeof a.Blob || "[object BlobConstructor]" === b.call(a.Blob),
                        g = "function" == typeof a.File || "[object FileConstructor]" === b.call(a.File);
                    f.exports = e
                }).call(g,
                    function() {
                        return this
                    }())
            }, function(f, g) {
                var d = {}.toString;
                f.exports = Array.isArray || function(a) {
                    return "[object Array]" == d.call(a)
                }
            }, function(f, g, d) {
                (function(a) {
                    function e(a, d) {
                        if (!a) return a;
                        if (c(a)) {
                            var f = {
                                _placeholder: !0,
                                num: d.length
                            };
                            return d.push(a), f
                        }
                        if (b(a)) {
                            f = Array(a.length);
                            for (var l = 0; l < a.length; l++) f[l] = e(a[l], d);
                            return f
                        }
                        if ("object" == typeof a && !(a instanceof Date)) {
                            f = {};
                            for (l in a) f[l] = e(a[l], d);
                            return f
                        }
                        return a
                    }

                    function f(a, c) {
                        if (!a) return a;
                        if (a && a._placeholder) return c[a.num];
                        if (b(a))
                            for (var d =
                                    0; d < a.length; d++) a[d] = f(a[d], c);
                        else if ("object" == typeof a)
                            for (d in a) a[d] = f(a[d], c);
                        return a
                    }
                    var b = d(10),
                        c = d(12),
                        t = Object.prototype.toString,
                        n = "function" == typeof a.Blob || "[object BlobConstructor]" === t.call(a.Blob),
                        p = "function" == typeof a.File || "[object FileConstructor]" === t.call(a.File);
                    g.deconstructPacket = function(a) {
                        var b = [];
                        return a.data = e(a.data, b), a.attachments = b.length, {
                            packet: a,
                            buffers: b
                        }
                    };
                    g.reconstructPacket = function(a, b) {
                        return a.data = f(a.data, b), a.attachments = void 0, a
                    };
                    g.removeBlobs = function(a,
                        d) {
                        function e(a, k, g) {
                            if (!a) return a;
                            if (n && a instanceof Blob || p && a instanceof File) {
                                l++;
                                var r = new FileReader;
                                r.onload = function() {
                                    g ? g[k] = this.result : f = this.result;
                                    --l || d(f)
                                };
                                r.readAsArrayBuffer(a)
                            } else if (b(a))
                                for (r = 0; r < a.length; r++) e(a[r], r, a);
                            else if ("object" == typeof a && !c(a))
                                for (r in a) e(a[r], r, a)
                        }
                        var l = 0,
                            f = a;
                        e(f);
                        l || d(f)
                    }
                }).call(g, function() {
                    return this
                }())
            }, function(f, g) {
                (function(d) {
                    f.exports = function(a) {
                        return d.Buffer && d.Buffer.isBuffer(a) || d.ArrayBuffer && a instanceof ArrayBuffer
                    }
                }).call(g,
                    function() {
                        return this
                    }())
            }, function(f, g, d) {
                function a(b, d) {
                    if (!(this instanceof a)) return new a(b, d);
                    b && "object" === ("undefined" == typeof b ? "undefined" : e(b)) && (d = b, b = void 0);
                    d = d || {};
                    d.path = d.path || "/socket.io";
                    this.nsps = {};
                    this.subs = [];
                    this.opts = d;
                    this.reconnection(!1 !== d.reconnection);
                    this.reconnectionAttempts(d.reconnectionAttempts || 1 / 0);
                    this.reconnectionDelay(d.reconnectionDelay || 1E3);
                    this.reconnectionDelayMax(d.reconnectionDelayMax || 5E3);
                    this.randomizationFactor(d.randomizationFactor || .5);
                    this.backoff =
                        new y({
                            min: this.reconnectionDelay(),
                            max: this.reconnectionDelayMax(),
                            jitter: this.randomizationFactor()
                        });
                    this.timeout(null == d.timeout ? 2E4 : d.timeout);
                    this.readyState = "closed";
                    this.uri = b;
                    this.connecting = [];
                    this.lastPing = null;
                    this.encoding = !1;
                    this.packetBuffer = [];
                    b = d.parser || c;
                    this.encoder = new b.Encoder;
                    this.decoder = new b.Decoder;
                    (this.autoConnect = !1 !== d.autoConnect) && this.open()
                }
                $jscomp.initSymbol();
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                var e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?
                    function(a) {
                        return typeof a
                    } : function(a) {
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a
                    },
                    k = d(14),
                    b = d(39);
                g = d(8);
                var c = d(7),
                    t = d(41),
                    n = d(42),
                    p = d(3)("socket.io-client:manager"),
                    h = d(37),
                    y = d(43),
                    r = Object.prototype.hasOwnProperty;
                f.exports = a;
                a.prototype.emitAll = function() {
                    this.emit.apply(this, arguments);
                    for (var a in this.nsps) r.call(this.nsps, a) && this.nsps[a].emit.apply(this.nsps[a], arguments)
                };
                a.prototype.updateSocketIds = function() {
                    for (var a in this.nsps) r.call(this.nsps, a) && (this.nsps[a].id = this.generateId(a))
                };
                a.prototype.generateId = function(a) {
                    return ("/" === a ? "" : a + "#") + this.engine.id
                };
                g(a.prototype);
                a.prototype.reconnection = function(a) {
                    return arguments.length ? (this._reconnection = !!a, this) : this._reconnection
                };
                a.prototype.reconnectionAttempts = function(a) {
                    return arguments.length ? (this._reconnectionAttempts = a, this) : this._reconnectionAttempts
                };
                a.prototype.reconnectionDelay = function(a) {
                    return arguments.length ?
                        (this._reconnectionDelay = a, this.backoff && this.backoff.setMin(a), this) : this._reconnectionDelay
                };
                a.prototype.randomizationFactor = function(a) {
                    return arguments.length ? (this._randomizationFactor = a, this.backoff && this.backoff.setJitter(a), this) : this._randomizationFactor
                };
                a.prototype.reconnectionDelayMax = function(a) {
                    return arguments.length ? (this._reconnectionDelayMax = a, this.backoff && this.backoff.setMax(a), this) : this._reconnectionDelayMax
                };
                a.prototype.timeout = function(a) {
                    return arguments.length ? (this._timeout =
                        a, this) : this._timeout
                };
                a.prototype.maybeReconnectOnOpen = function() {
                    !this.reconnecting && this._reconnection && 0 === this.backoff.attempts && this.reconnect()
                };
                a.prototype.open = a.prototype.connect = function(a, b) {
                    if (p("readyState %s", this.readyState), ~this.readyState.indexOf("open")) return this;
                    p("opening %s", this.uri);
                    var c = this.engine = k(this.uri, this.opts),
                        d = this;
                    this.readyState = "opening";
                    this.skipReconnect = !1;
                    var l = t(c, "open", function() {
                        d.onopen();
                        a && a()
                    });
                    b = t(c, "error", function(b) {
                        if (p("connect_error"),
                            d.cleanup(), d.readyState = "closed", d.emitAll("connect_error", b), a) {
                            var c = Error("Connection error");
                            c.data = b;
                            a(c)
                        } else d.maybeReconnectOnOpen()
                    });
                    if (!1 !== this._timeout) {
                        var e = this._timeout;
                        p("connect attempt will timeout after %d", e);
                        var f = setTimeout(function() {
                            p("connect attempt timed out after %d", e);
                            l.destroy();
                            c.close();
                            c.emit("error", "timeout");
                            d.emitAll("connect_timeout", e)
                        }, e);
                        this.subs.push({
                            destroy: function() {
                                clearTimeout(f)
                            }
                        })
                    }
                    return this.subs.push(l), this.subs.push(b), this
                };
                a.prototype.onopen =
                    function() {
                        p("open");
                        this.cleanup();
                        this.readyState = "open";
                        this.emit("open");
                        var a = this.engine;
                        this.subs.push(t(a, "data", n(this, "ondata")));
                        this.subs.push(t(a, "ping", n(this, "onping")));
                        this.subs.push(t(a, "pong", n(this, "onpong")));
                        this.subs.push(t(a, "error", n(this, "onerror")));
                        this.subs.push(t(a, "close", n(this, "onclose")));
                        this.subs.push(t(this.decoder, "decoded", n(this, "ondecoded")))
                    };
                a.prototype.onping = function() {
                    this.lastPing = new Date;
                    this.emitAll("ping")
                };
                a.prototype.onpong = function() {
                    this.emitAll("pong",
                        new Date - this.lastPing)
                };
                a.prototype.ondata = function(a) {
                    this.decoder.add(a)
                };
                a.prototype.ondecoded = function(a) {
                    this.emit("packet", a)
                };
                a.prototype.onerror = function(a) {
                    p("error", a);
                    this.emitAll("error", a)
                };
                a.prototype.socket = function(a, c) {
                    function d() {
                        ~h(e.connecting, l) || e.connecting.push(l)
                    }
                    var l = this.nsps[a];
                    if (!l) {
                        l = new b(this, a, c);
                        this.nsps[a] = l;
                        var e = this;
                        l.on("connecting", d);
                        l.on("connect", function() {
                            l.id = e.generateId(a)
                        });
                        this.autoConnect && d()
                    }
                    return l
                };
                a.prototype.destroy = function(a) {
                    a = h(this.connecting,
                        a);
                    ~a && this.connecting.splice(a, 1);
                    this.connecting.length || this.close()
                };
                a.prototype.packet = function(a) {
                    p("writing packet %j", a);
                    var b = this;
                    a.query && 0 === a.type && (a.nsp += "?" + a.query);
                    b.encoding ? b.packetBuffer.push(a) : (b.encoding = !0, this.encoder.encode(a, function(c) {
                        for (var d = 0; d < c.length; d++) b.engine.write(c[d], a.options);
                        b.encoding = !1;
                        b.processPacketQueue()
                    }))
                };
                a.prototype.processPacketQueue = function() {
                    if (0 < this.packetBuffer.length && !this.encoding) {
                        var a = this.packetBuffer.shift();
                        this.packet(a)
                    }
                };
                a.prototype.cleanup = function() {
                    p("cleanup");
                    for (var a = this.subs.length, b = 0; b < a; b++) this.subs.shift().destroy();
                    this.packetBuffer = [];
                    this.encoding = !1;
                    this.lastPing = null;
                    this.decoder.destroy()
                };
                a.prototype.close = a.prototype.disconnect = function() {
                    p("disconnect");
                    this.skipReconnect = !0;
                    this.reconnecting = !1;
                    "opening" === this.readyState && this.cleanup();
                    this.backoff.reset();
                    this.readyState = "closed";
                    this.engine && this.engine.close()
                };
                a.prototype.onclose = function(a) {
                    p("onclose");
                    this.cleanup();
                    this.backoff.reset();
                    this.readyState = "closed";
                    this.emit("close", a);
                    this._reconnection && !this.skipReconnect && this.reconnect()
                };
                a.prototype.reconnect = function() {
                    if (this.reconnecting || this.skipReconnect) return this;
                    var a = this;
                    if (this.backoff.attempts >= this._reconnectionAttempts) p("reconnect failed"), this.backoff.reset(), this.emitAll("reconnect_failed"), this.reconnecting = !1;
                    else {
                        var b = this.backoff.duration();
                        p("will wait %dms before reconnect attempt", b);
                        this.reconnecting = !0;
                        var c = setTimeout(function() {
                            a.skipReconnect || (p("attempting reconnect"),
                                a.emitAll("reconnect_attempt", a.backoff.attempts), a.emitAll("reconnecting", a.backoff.attempts), a.skipReconnect || a.open(function(b) {
                                    b ? (p("reconnect attempt error"), a.reconnecting = !1, a.reconnect(), a.emitAll("reconnect_error", b.data)) : (p("reconnect success"), a.onreconnect())
                                }))
                        }, b);
                        this.subs.push({
                            destroy: function() {
                                clearTimeout(c)
                            }
                        })
                    }
                };
                a.prototype.onreconnect = function() {
                    var a = this.backoff.attempts;
                    this.reconnecting = !1;
                    this.backoff.reset();
                    this.updateSocketIds();
                    this.emitAll("reconnect", a)
                }
            }, function(f,
                g, d) {
                f.exports = d(15)
            }, function(f, g, d) {
                f.exports = d(16);
                f.exports.parser = d(23)
            }, function(f, g, d) {
                (function(a) {
                    function e(b, c) {
                        if (!(this instanceof e)) return new e(b, c);
                        c = c || {};
                        b && "object" == typeof b && (c = b, b = null);
                        b ? (b = p(b), c.hostname = b.host, c.secure = "https" === b.protocol || "wss" === b.protocol, c.port = b.port, b.query && (c.query = b.query)) : c.host && (c.hostname = p(c.host).host);
                        this.secure = null != c.secure ? c.secure : a.location && "https:" === location.protocol;
                        c.hostname && !c.port && (c.port = this.secure ? "443" : "80");
                        this.agent =
                            c.agent || !1;
                        this.hostname = c.hostname || (a.location ? location.hostname : "localhost");
                        this.port = c.port || (a.location && location.port ? location.port : this.secure ? 443 : 80);
                        this.query = c.query || {};
                        "string" == typeof this.query && (this.query = y.decode(this.query));
                        this.upgrade = !1 !== c.upgrade;
                        this.path = (c.path || "/engine.io").replace(/\/$/, "") + "/";
                        this.forceJSONP = !!c.forceJSONP;
                        this.jsonp = !1 !== c.jsonp;
                        this.forceBase64 = !!c.forceBase64;
                        this.enablesXDR = !!c.enablesXDR;
                        this.timestampParam = c.timestampParam || "t";
                        this.timestampRequests =
                            c.timestampRequests;
                        this.transports = c.transports || ["polling", "websocket"];
                        this.transportOptions = c.transportOptions || {};
                        this.readyState = "";
                        this.writeBuffer = [];
                        this.prevBufferLen = 0;
                        this.policyPort = c.policyPort || 843;
                        this.rememberUpgrade = c.rememberUpgrade || !1;
                        this.binaryType = null;
                        this.onlyBinaryUpgrades = c.onlyBinaryUpgrades;
                        this.perMessageDeflate = !1 !== c.perMessageDeflate && (c.perMessageDeflate || {});
                        !0 === this.perMessageDeflate && (this.perMessageDeflate = {});
                        this.perMessageDeflate && null == this.perMessageDeflate.threshold &&
                            (this.perMessageDeflate.threshold = 1024);
                        this.pfx = c.pfx || null;
                        this.key = c.key || null;
                        this.passphrase = c.passphrase || null;
                        this.cert = c.cert || null;
                        this.ca = c.ca || null;
                        this.ciphers = c.ciphers || null;
                        this.rejectUnauthorized = void 0 === c.rejectUnauthorized || c.rejectUnauthorized;
                        this.forceNode = !!c.forceNode;
                        b = "object" == typeof a && a;
                        b.global === b && (c.extraHeaders && 0 < Object.keys(c.extraHeaders).length && (this.extraHeaders = c.extraHeaders), c.localAddress && (this.localAddress = c.localAddress));
                        this.pingTimeoutTimer = this.pingIntervalTimer =
                            this.pingTimeout = this.pingInterval = this.upgrades = this.id = null;
                        this.open()
                    }
                    var k = d(17),
                        b = d(8),
                        c = d(3)("engine.io-client:socket"),
                        g = d(37),
                        n = d(23),
                        p = d(2),
                        h = d(38),
                        y = d(31);
                    f.exports = e;
                    e.priorWebsocketSuccess = !1;
                    b(e.prototype);
                    e.protocol = n.protocol;
                    e.Socket = e;
                    e.Transport = d(22);
                    e.transports = d(17);
                    e.parser = d(23);
                    e.prototype.createTransport = function(a) {
                        c('creating transport "%s"', a);
                        var b = this.query,
                            d = {},
                            e;
                        for (e in b) b.hasOwnProperty(e) && (d[e] = b[e]);
                        d.EIO = n.protocol;
                        d.transport = a;
                        b = this.transportOptions[a] || {};
                        this.id && (d.sid = this.id);
                        return new k[a]({
                            query: d,
                            socket: this,
                            agent: b.agent || this.agent,
                            hostname: b.hostname || this.hostname,
                            port: b.port || this.port,
                            secure: b.secure || this.secure,
                            path: b.path || this.path,
                            forceJSONP: b.forceJSONP || this.forceJSONP,
                            jsonp: b.jsonp || this.jsonp,
                            forceBase64: b.forceBase64 || this.forceBase64,
                            enablesXDR: b.enablesXDR || this.enablesXDR,
                            timestampRequests: b.timestampRequests || this.timestampRequests,
                            timestampParam: b.timestampParam || this.timestampParam,
                            policyPort: b.policyPort || this.policyPort,
                            pfx: b.pfx || this.pfx,
                            key: b.key || this.key,
                            passphrase: b.passphrase || this.passphrase,
                            cert: b.cert || this.cert,
                            ca: b.ca || this.ca,
                            ciphers: b.ciphers || this.ciphers,
                            rejectUnauthorized: b.rejectUnauthorized || this.rejectUnauthorized,
                            perMessageDeflate: b.perMessageDeflate || this.perMessageDeflate,
                            extraHeaders: b.extraHeaders || this.extraHeaders,
                            forceNode: b.forceNode || this.forceNode,
                            localAddress: b.localAddress || this.localAddress,
                            requestTimeout: b.requestTimeout || this.requestTimeout,
                            protocols: b.protocols || void 0
                        })
                    };
                    e.prototype.open =
                        function() {
                            if (this.rememberUpgrade && e.priorWebsocketSuccess && -1 !== this.transports.indexOf("websocket")) var a = "websocket";
                            else {
                                if (0 === this.transports.length) {
                                    var b = this;
                                    return void setTimeout(function() {
                                        b.emit("error", "No transports available")
                                    }, 0)
                                }
                                a = this.transports[0]
                            }
                            this.readyState = "opening";
                            try {
                                a = this.createTransport(a)
                            } catch (u) {
                                return this.transports.shift(), void this.open()
                            }
                            a.open();
                            this.setTransport(a)
                        };
                    e.prototype.setTransport = function(a) {
                        c("setting transport %s", a.name);
                        var b = this;
                        this.transport &&
                            (c("clearing existing transport %s", this.transport.name), this.transport.removeAllListeners());
                        this.transport = a;
                        a.on("drain", function() {
                            b.onDrain()
                        }).on("packet", function(a) {
                            b.onPacket(a)
                        }).on("error", function(a) {
                            b.onError(a)
                        }).on("close", function() {
                            b.onClose("transport close")
                        })
                    };
                    e.prototype.probe = function(a) {
                        function b() {
                            if (h.onlyBinaryUpgrades) {
                                var b = !this.supportsBinary && h.transport.supportsBinary;
                                t = t || b
                            }
                            t || (c('probe transport "%s" opened', a), p.send([{
                                type: "ping",
                                data: "probe"
                            }]), p.once("packet",
                                function(b) {
                                    if (!t)
                                        if ("pong" === b.type && "probe" === b.data) {
                                            if (c('probe transport "%s" pong', a), h.upgrading = !0, h.emit("upgrading", p), p) e.priorWebsocketSuccess = "websocket" === p.name, c('pausing current transport "%s"', h.transport.name), h.transport.pause(function() {
                                                t || "closed" !== h.readyState && (c("changing transport and sending upgrade packet"), n(), h.setTransport(p), p.send([{
                                                    type: "upgrade"
                                                }]), h.emit("upgrade", p), p = null, h.upgrading = !1, h.flush())
                                            })
                                        } else c('probe transport "%s" failed', a), b = Error("probe error"),
                                            b.transport = p.name, h.emit("upgradeError", b)
                                }))
                        }

                        function d() {
                            t || (t = !0, n(), p.close(), p = null)
                        }

                        function f(b) {
                            var e = Error("probe error: " + b);
                            e.transport = p.name;
                            d();
                            c('probe transport "%s" failed because of error: %s', a, b);
                            h.emit("upgradeError", e)
                        }

                        function k() {
                            f("transport closed")
                        }

                        function g() {
                            f("socket closed")
                        }

                        function r(a) {
                            p && a.name !== p.name && (c('"%s" works - aborting "%s"', a.name, p.name), d())
                        }

                        function n() {
                            p.removeListener("open", b);
                            p.removeListener("error", f);
                            p.removeListener("close", k);
                            h.removeListener("close",
                                g);
                            h.removeListener("upgrading", r)
                        }
                        c('probing transport "%s"', a);
                        var p = this.createTransport(a, {
                                probe: 1
                            }),
                            t = !1,
                            h = this;
                        e.priorWebsocketSuccess = !1;
                        p.once("open", b);
                        p.once("error", f);
                        p.once("close", k);
                        this.once("close", g);
                        this.once("upgrading", r);
                        p.open()
                    };
                    e.prototype.onOpen = function() {
                        if (c("socket open"), this.readyState = "open", e.priorWebsocketSuccess = "websocket" === this.transport.name, this.emit("open"), this.flush(), "open" === this.readyState && this.upgrade && this.transport.pause) {
                            c("starting upgrade probes");
                            for (var a = 0, b = this.upgrades.length; a < b; a++) this.probe(this.upgrades[a])
                        }
                    };
                    e.prototype.onPacket = function(a) {
                        if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) switch (c('socket receive: type "%s", data "%s"', a.type, a.data), this.emit("packet", a), this.emit("heartbeat"), a.type) {
                            case "open":
                                this.onHandshake(h(a.data));
                                break;
                            case "pong":
                                this.setPing();
                                this.emit("pong");
                                break;
                            case "error":
                                var b = Error("server error");
                                b.code = a.data;
                                this.onError(b);
                                break;
                            case "message":
                                this.emit("data",
                                    a.data), this.emit("message", a.data)
                        } else c('packet received with socket readyState "%s"', this.readyState)
                    };
                    e.prototype.onHandshake = function(a) {
                        this.emit("handshake", a);
                        this.id = a.sid;
                        this.transport.query.sid = a.sid;
                        this.upgrades = this.filterUpgrades(a.upgrades);
                        this.pingInterval = a.pingInterval;
                        this.pingTimeout = a.pingTimeout;
                        this.onOpen();
                        "closed" !== this.readyState && (this.setPing(), this.removeListener("heartbeat", this.onHeartbeat), this.on("heartbeat", this.onHeartbeat))
                    };
                    e.prototype.onHeartbeat = function(a) {
                        clearTimeout(this.pingTimeoutTimer);
                        var b = this;
                        b.pingTimeoutTimer = setTimeout(function() {
                            "closed" !== b.readyState && b.onClose("ping timeout")
                        }, a || b.pingInterval + b.pingTimeout)
                    };
                    e.prototype.setPing = function() {
                        var a = this;
                        clearTimeout(a.pingIntervalTimer);
                        a.pingIntervalTimer = setTimeout(function() {
                            c("writing ping packet - expecting pong within %sms", a.pingTimeout);
                            a.ping();
                            a.onHeartbeat(a.pingTimeout)
                        }, a.pingInterval)
                    };
                    e.prototype.ping = function() {
                        var a = this;
                        this.sendPacket("ping", function() {
                            a.emit("ping")
                        })
                    };
                    e.prototype.onDrain = function() {
                        this.writeBuffer.splice(0,
                            this.prevBufferLen);
                        this.prevBufferLen = 0;
                        0 === this.writeBuffer.length ? this.emit("drain") : this.flush()
                    };
                    e.prototype.flush = function() {
                        "closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length && (c("flushing %d packets in socket", this.writeBuffer.length), this.transport.send(this.writeBuffer), this.prevBufferLen = this.writeBuffer.length, this.emit("flush"))
                    };
                    e.prototype.write = e.prototype.send = function(a, b, c) {
                        return this.sendPacket("message", a, b, c), this
                    };
                    e.prototype.sendPacket =
                        function(a, b, c, d) {
                            if ("function" == typeof b && (d = b, b = void 0), "function" == typeof c && (d = c, c = null), "closing" !== this.readyState && "closed" !== this.readyState) c = c || {}, c.compress = !1 !== c.compress, a = {
                                type: a,
                                data: b,
                                options: c
                            }, this.emit("packetCreate", a), this.writeBuffer.push(a), d && this.once("flush", d), this.flush()
                        };
                    e.prototype.close = function() {
                        function a() {
                            e.onClose("forced close");
                            c("socket closing - telling transport to close");
                            e.transport.close()
                        }

                        function b() {
                            e.removeListener("upgrade", b);
                            e.removeListener("upgradeError",
                                b);
                            a()
                        }

                        function d() {
                            e.once("upgrade", b);
                            e.once("upgradeError", b)
                        }
                        if ("opening" === this.readyState || "open" === this.readyState) {
                            this.readyState = "closing";
                            var e = this;
                            this.writeBuffer.length ? this.once("drain", function() {
                                this.upgrading ? d() : a()
                            }) : this.upgrading ? d() : a()
                        }
                        return this
                    };
                    e.prototype.onError = function(a) {
                        c("socket error %j", a);
                        e.priorWebsocketSuccess = !1;
                        this.emit("error", a);
                        this.onClose("transport error", a)
                    };
                    e.prototype.onClose = function(a, b) {
                        if ("opening" === this.readyState || "open" === this.readyState ||
                            "closing" === this.readyState) c('socket close with reason: "%s"', a), clearTimeout(this.pingIntervalTimer), clearTimeout(this.pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), this.readyState = "closed", this.id = null, this.emit("close", a, b), this.writeBuffer = [], this.prevBufferLen = 0
                    };
                    e.prototype.filterUpgrades = function(a) {
                        for (var b = [], c = 0, d = a.length; c < d; c++) ~g(this.transports, a[c]) && b.push(a[c]);
                        return b
                    }
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g, d) {
                (function(a) {
                    var e = d(18),
                        f = d(20),
                        b = d(34),
                        c = d(35);
                    g.polling = function(c) {
                        var d, k = !1,
                            g = !1,
                            t = !1 !== c.jsonp;
                        a.location && (g = "https:" === location.protocol, (k = location.port) || (k = g ? 443 : 80), k = c.hostname !== location.hostname || k !== c.port, g = c.secure !== g);
                        if (c.xdomain = k, c.xscheme = g, d = new e(c), "open" in d && !c.forceJSONP) return new f(c);
                        if (!t) throw Error("JSONP disabled");
                        return new b(c)
                    };
                    g.websocket = c
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g, d) {
                (function(a) {
                    var e = d(19);
                    f.exports = function(d) {
                        var b =
                            d.xdomain,
                            c = d.xscheme;
                        d = d.enablesXDR;
                        try {
                            if ("undefined" != typeof XMLHttpRequest && (!b || e)) return new XMLHttpRequest
                        } catch (t) {}
                        try {
                            if ("undefined" != typeof XDomainRequest && !c && d) return new XDomainRequest
                        } catch (t) {}
                        if (!b) try {
                            return new(a[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")
                        } catch (t) {}
                    }
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g) {
                try {
                    f.exports = "undefined" != typeof XMLHttpRequest && "withCredentials" in new XMLHttpRequest
                } catch (d) {
                    f.exports = !1
                }
            },
            function(f, g, d) {
                (function(a) {
                    function e() {}

                    function k(b) {
                        if (n.call(this, b), this.requestTimeout = b.requestTimeout, this.extraHeaders = b.extraHeaders, a.location) {
                            var c = "https:" === location.protocol,
                                d = location.port;
                            d || (d = c ? 443 : 80);
                            this.xd = b.hostname !== a.location.hostname || d !== b.port;
                            this.xs = b.secure !== c
                        }
                    }

                    function b(a) {
                        this.method = a.method || "GET";
                        this.uri = a.uri;
                        this.xd = !!a.xd;
                        this.xs = !!a.xs;
                        this.async = !1 !== a.async;
                        this.data = void 0 !== a.data ? a.data : null;
                        this.agent = a.agent;
                        this.isBinary = a.isBinary;
                        this.supportsBinary = a.supportsBinary;
                        this.enablesXDR =
                            a.enablesXDR;
                        this.requestTimeout = a.requestTimeout;
                        this.pfx = a.pfx;
                        this.key = a.key;
                        this.passphrase = a.passphrase;
                        this.cert = a.cert;
                        this.ca = a.ca;
                        this.ciphers = a.ciphers;
                        this.rejectUnauthorized = a.rejectUnauthorized;
                        this.extraHeaders = a.extraHeaders;
                        this.create()
                    }

                    function c() {
                        for (var a in b.requests) b.requests.hasOwnProperty(a) && b.requests[a].abort()
                    }
                    var g = d(18),
                        n = d(21),
                        p = d(8),
                        h = d(32),
                        y = d(3)("engine.io-client:polling-xhr");
                    f.exports = k;
                    f.exports.Request = b;
                    h(k, n);
                    k.prototype.supportsBinary = !0;
                    k.prototype.request =
                        function(a) {
                            return a = a || {}, a.uri = this.uri(), a.xd = this.xd, a.xs = this.xs, a.agent = this.agent || !1, a.supportsBinary = this.supportsBinary, a.enablesXDR = this.enablesXDR, a.pfx = this.pfx, a.key = this.key, a.passphrase = this.passphrase, a.cert = this.cert, a.ca = this.ca, a.ciphers = this.ciphers, a.rejectUnauthorized = this.rejectUnauthorized, a.requestTimeout = this.requestTimeout, a.extraHeaders = this.extraHeaders, new b(a)
                        };
                    k.prototype.doWrite = function(a, b) {
                        a = this.request({
                            method: "POST",
                            data: a,
                            isBinary: "string" != typeof a && void 0 !==
                                a
                        });
                        var c = this;
                        a.on("success", b);
                        a.on("error", function(a) {
                            c.onError("xhr post error", a)
                        });
                        this.sendXhr = a
                    };
                    k.prototype.doPoll = function() {
                        y("xhr poll");
                        var a = this.request(),
                            b = this;
                        a.on("data", function(a) {
                            b.onData(a)
                        });
                        a.on("error", function(a) {
                            b.onError("xhr poll error", a)
                        });
                        this.pollXhr = a
                    };
                    p(b.prototype);
                    b.prototype.create = function() {
                        var c = {
                            agent: this.agent,
                            xdomain: this.xd,
                            xscheme: this.xs,
                            enablesXDR: this.enablesXDR
                        };
                        c.pfx = this.pfx;
                        c.key = this.key;
                        c.passphrase = this.passphrase;
                        c.cert = this.cert;
                        c.ca = this.ca;
                        c.ciphers = this.ciphers;
                        c.rejectUnauthorized = this.rejectUnauthorized;
                        var d = this.xhr = new g(c),
                            e = this;
                        try {
                            y("xhr open %s: %s", this.method, this.uri);
                            d.open(this.method, this.uri, this.async);
                            try {
                                if (this.extraHeaders) {
                                    d.setDisableHeaderCheck && d.setDisableHeaderCheck(!0);
                                    for (var f in this.extraHeaders) this.extraHeaders.hasOwnProperty(f) && d.setRequestHeader(f, this.extraHeaders[f])
                                }
                            } catch (x) {}
                            if ("POST" === this.method) try {
                                this.isBinary ? d.setRequestHeader("Content-type", "application/octet-stream") : d.setRequestHeader("Content-type",
                                    "text/plain;charset\x3dUTF-8")
                            } catch (x) {}
                            try {
                                d.setRequestHeader("Accept", "*/*")
                            } catch (x) {}
                            "withCredentials" in d && (d.withCredentials = !0);
                            this.requestTimeout && (d.timeout = this.requestTimeout);
                            this.hasXDR() ? (d.onload = function() {
                                e.onLoad()
                            }, d.onerror = function() {
                                e.onError(d.responseText)
                            }) : d.onreadystatechange = function() {
                                if (2 === d.readyState) {
                                    try {
                                        var a = d.getResponseHeader("Content-Type")
                                    } catch (B) {}
                                    "application/octet-stream" === a && (d.responseType = "arraybuffer")
                                }
                                4 === d.readyState && (200 === d.status || 1223 === d.status ?
                                    e.onLoad() : setTimeout(function() {
                                        e.onError(d.status)
                                    }, 0))
                            };
                            y("xhr data %s", this.data);
                            d.send(this.data)
                        } catch (x) {
                            return void setTimeout(function() {
                                e.onError(x)
                            }, 0)
                        }
                        a.document && (this.index = b.requestsCount++, b.requests[this.index] = this)
                    };
                    b.prototype.onSuccess = function() {
                        this.emit("success");
                        this.cleanup()
                    };
                    b.prototype.onData = function(a) {
                        this.emit("data", a);
                        this.onSuccess()
                    };
                    b.prototype.onError = function(a) {
                        this.emit("error", a);
                        this.cleanup(!0)
                    };
                    b.prototype.cleanup = function(c) {
                        if ("undefined" != typeof this.xhr &&
                            null !== this.xhr) {
                            if (this.hasXDR() ? this.xhr.onload = this.xhr.onerror = e : this.xhr.onreadystatechange = e, c) try {
                                this.xhr.abort()
                            } catch (l) {}
                            a.document && delete b.requests[this.index];
                            this.xhr = null
                        }
                    };
                    b.prototype.onLoad = function() {
                        try {
                            try {
                                var a = this.xhr.getResponseHeader("Content-Type")
                            } catch (u) {}
                            var b = "application/octet-stream" === a ? this.xhr.response || this.xhr.responseText : this.xhr.responseText
                        } catch (u) {
                            this.onError(u)
                        }
                        null != b && this.onData(b)
                    };
                    b.prototype.hasXDR = function() {
                        return "undefined" != typeof a.XDomainRequest &&
                            !this.xs && this.enablesXDR
                    };
                    b.prototype.abort = function() {
                        this.cleanup()
                    };
                    b.requestsCount = 0;
                    b.requests = {};
                    a.document && (a.attachEvent ? a.attachEvent("onunload", c) : a.addEventListener && a.addEventListener("beforeunload", c, !1))
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g, d) {
                function a(a) {
                    var b = a && a.forceBase64;
                    n && !b || (this.supportsBinary = !1);
                    e.call(this, a)
                }
                var e = d(22),
                    k = d(31),
                    b = d(23);
                g = d(32);
                var c = d(33),
                    t = d(3)("engine.io-client:polling");
                f.exports = a;
                var n = null != (new(d(18))({
                    xdomain: !1
                })).responseType;
                g(a, e);
                a.prototype.name = "polling";
                a.prototype.doOpen = function() {
                    this.poll()
                };
                a.prototype.pause = function(a) {
                    function b() {
                        t("paused");
                        c.readyState = "paused";
                        a()
                    }
                    var c = this;
                    if (this.readyState = "pausing", this.polling || !this.writable) {
                        var d = 0;
                        this.polling && (t("we are currently polling - waiting to pause"), d++, this.once("pollComplete", function() {
                            t("pre-pause polling complete");
                            --d || b()
                        }));
                        this.writable || (t("we are currently writing - waiting to pause"), d++, this.once("drain", function() {
                            t("pre-pause writing complete");
                            --d || b()
                        }))
                    } else b()
                };
                a.prototype.poll = function() {
                    t("polling");
                    this.polling = !0;
                    this.doPoll();
                    this.emit("poll")
                };
                a.prototype.onData = function(a) {
                    var c = this;
                    t("polling got data %s", a);
                    b.decodePayload(a, this.socket.binaryType, function(a, b, d) {
                        return "opening" === c.readyState && c.onOpen(), "close" === a.type ? (c.onClose(), !1) : void c.onPacket(a)
                    });
                    "closed" !== this.readyState && (this.polling = !1, this.emit("pollComplete"), "open" === this.readyState ? this.poll() : t('ignoring poll - transport state "%s"', this.readyState))
                };
                a.prototype.doClose = function() {
                    function a() {
                        t("writing close packet");
                        b.write([{
                            type: "close"
                        }])
                    }
                    var b = this;
                    "open" === this.readyState ? (t("transport open - closing"), a()) : (t("transport not open - deferring close"), this.once("open", a))
                };
                a.prototype.write = function(a) {
                    var c = this;
                    this.writable = !1;
                    var d = function() {
                        c.writable = !0;
                        c.emit("drain")
                    };
                    b.encodePayload(a, this.supportsBinary, function(a) {
                        c.doWrite(a, d)
                    })
                };
                a.prototype.uri = function() {
                    var a = this.query || {},
                        b = this.secure ? "https" : "http",
                        d = "";
                    !1 !== this.timestampRequests &&
                        (a[this.timestampParam] = c());
                    this.supportsBinary || a.sid || (a.b64 = 1);
                    a = k.encode(a);
                    this.port && ("https" === b && 443 !== Number(this.port) || "http" === b && 80 !== Number(this.port)) && (d = ":" + this.port);
                    a.length && (a = "?" + a);
                    var e = -1 !== this.hostname.indexOf(":");
                    return b + "://" + (e ? "[" + this.hostname + "]" : this.hostname) + d + this.path + a
                }
            },
            function(f, g, d) {
                function a(a) {
                    this.path = a.path;
                    this.hostname = a.hostname;
                    this.port = a.port;
                    this.secure = a.secure;
                    this.query = a.query;
                    this.timestampParam = a.timestampParam;
                    this.timestampRequests =
                        a.timestampRequests;
                    this.readyState = "";
                    this.agent = a.agent || !1;
                    this.socket = a.socket;
                    this.enablesXDR = a.enablesXDR;
                    this.pfx = a.pfx;
                    this.key = a.key;
                    this.passphrase = a.passphrase;
                    this.cert = a.cert;
                    this.ca = a.ca;
                    this.ciphers = a.ciphers;
                    this.rejectUnauthorized = a.rejectUnauthorized;
                    this.forceNode = a.forceNode;
                    this.extraHeaders = a.extraHeaders;
                    this.localAddress = a.localAddress
                }
                var e = d(23);
                g = d(8);
                f.exports = a;
                g(a.prototype);
                a.prototype.onError = function(a, b) {
                    a = Error(a);
                    return a.type = "TransportError", a.description = b, this.emit("error",
                        a), this
                };
                a.prototype.open = function() {
                    return "closed" !== this.readyState && "" !== this.readyState || (this.readyState = "opening", this.doOpen()), this
                };
                a.prototype.close = function() {
                    return "opening" !== this.readyState && "open" !== this.readyState || (this.doClose(), this.onClose()), this
                };
                a.prototype.send = function(a) {
                    if ("open" !== this.readyState) throw Error("Transport not open");
                    this.write(a)
                };
                a.prototype.onOpen = function() {
                    this.readyState = "open";
                    this.writable = !0;
                    this.emit("open")
                };
                a.prototype.onData = function(a) {
                    a = e.decodePacket(a,
                        this.socket.binaryType);
                    this.onPacket(a)
                };
                a.prototype.onPacket = function(a) {
                    this.emit("packet", a)
                };
                a.prototype.onClose = function() {
                    this.readyState = "closed";
                    this.emit("close")
                }
            },
            function(f, g, d) {
                (function(a) {
                    function e(a, b, c) {
                        if (!b) return g.encodeBase64Packet(a, c);
                        var d = new FileReader;
                        return d.onload = function() {
                            a.data = d.result;
                            g.encodePacket(a, b, !0, c)
                        }, d.readAsArrayBuffer(a.data)
                    }

                    function f(a, b, c) {
                        var d = Array(a.length);
                        c = p(a.length, c);
                        for (var e = function(a, c, e) {
                                b(c, function(b, c) {
                                    d[a] = c;
                                    e(b, d)
                                })
                            }, f = 0; f <
                            a.length; f++) e(f, a[f], c)
                    }
                    var b, c = d(24),
                        t = d(9),
                        n = d(25),
                        p = d(26),
                        h = d(27);
                    a && a.ArrayBuffer && (b = d(29));
                    var y = "undefined" != typeof navigator && /Android/i.test(navigator.userAgent),
                        r = "undefined" != typeof navigator && /PhantomJS/i.test(navigator.userAgent),
                        l = y || r;
                    g.protocol = 3;
                    var u = g.packets = {
                            open: 0,
                            close: 1,
                            ping: 2,
                            pong: 3,
                            message: 4,
                            upgrade: 5,
                            noop: 6
                        },
                        w = c(u),
                        x = {
                            type: "error",
                            data: "parser error"
                        },
                        B = d(30);
                    g.encodePacket = function(b, c, d, f) {
                        "function" == typeof c && (f = c, c = !1);
                        "function" == typeof d && (f = d, d = null);
                        var k = void 0 ===
                            b.data ? void 0 : b.data.buffer || b.data;
                        if (a.ArrayBuffer && k instanceof ArrayBuffer) {
                            if (c) {
                                d = b.data;
                                c = new Uint8Array(d);
                                d = new Uint8Array(1 + d.byteLength);
                                d[0] = u[b.type];
                                for (b = 0; b < c.length; b++) d[b + 1] = c[b];
                                b = f(d.buffer)
                            } else b = g.encodeBase64Packet(b, f);
                            return b
                        }
                        if (B && k instanceof a.Blob) return c ? l ? b = e(b, c, f) : (c = new Uint8Array(1), c[0] = u[b.type], b = new B([c.buffer, b.data]), b = f(b)) : b = g.encodeBase64Packet(b, f), b;
                        if (k && k.base64) return f("b" + g.packets[b.type] + b.data.data);
                        c = u[b.type];
                        return void 0 !== b.data && (c +=
                            d ? h.encode(String(b.data), {
                                strict: !1
                            }) : String(b.data)), f("" + c)
                    };
                    g.encodeBase64Packet = function(b, c) {
                        var d = "b" + g.packets[b.type];
                        if (B && b.data instanceof a.Blob) {
                            var e = new FileReader;
                            return e.onload = function() {
                                var a = e.result.split(",")[1];
                                c(d + a)
                            }, e.readAsDataURL(b.data)
                        }
                        try {
                            var f = String.fromCharCode.apply(null, new Uint8Array(b.data))
                        } catch (E) {
                            b = new Uint8Array(b.data);
                            f = Array(b.length);
                            for (var l = 0; l < b.length; l++) f[l] = b[l];
                            f = String.fromCharCode.apply(null, f)
                        }
                        return d += a.btoa(f), c(d)
                    };
                    g.decodePacket = function(a,
                        b, c) {
                        if (void 0 === a) return x;
                        if ("string" == typeof a) {
                            if ("b" === a.charAt(0)) return g.decodeBase64Packet(a.substr(1), b);
                            if (b = c) {
                                b = a;
                                try {
                                    b = h.decode(b, {
                                        strict: !1
                                    })
                                } catch (z) {
                                    b = !1
                                }
                                b = (a = b, !1 === a)
                            }
                            if (b) return x;
                            c = a.charAt(0);
                            return Number(c) == c && w[c] ? 1 < a.length ? {
                                type: w[c],
                                data: a.substring(1)
                            } : {
                                type: w[c]
                            } : x
                        }
                        c = (new Uint8Array(a))[0];
                        a = n(a, 1);
                        return B && "blob" === b && (a = new B([a])), {
                            type: w[c],
                            data: a
                        }
                    };
                    g.decodeBase64Packet = function(a, c) {
                        var d = w[a.charAt(0)];
                        if (!b) return {
                            type: d,
                            data: {
                                base64: !0,
                                data: a.substr(1)
                            }
                        };
                        a =
                            b.decode(a.substr(1));
                        return "blob" === c && B && (a = new B([a])), {
                            type: d,
                            data: a
                        }
                    };
                    g.encodePayload = function(a, b, c) {
                        function d(a, c) {
                            g.encodePacket(a, !!e && b, !1, function(a) {
                                c(null, a.length + ":" + a)
                            })
                        }
                        "function" == typeof b && (c = b, b = null);
                        var e = t(a);
                        return b && e ? B && !l ? g.encodePayloadAsBlob(a, c) : g.encodePayloadAsArrayBuffer(a, c) : a.length ? void f(a, d, function(a, b) {
                            return c(b.join(""))
                        }) : c("0:")
                    };
                    g.decodePayload = function(a, b, c) {
                        if ("string" != typeof a) return g.decodePayloadAsBinary(a, b, c);
                        "function" == typeof b && (c = b, b = null);
                        var d;
                        if ("" === a) return c(x, 0, 1);
                        for (var e, f, l = "", k = 0, n = a.length; k < n; k++) {
                            var u = a.charAt(k);
                            if (":" === u) {
                                if ("" === l || l != (e = Number(l)) || (f = a.substr(k + 1, e), l != f.length)) return c(x, 0, 1);
                                if (f.length) {
                                    if (d = g.decodePacket(f, b, !1), x.type === d.type && x.data === d.data) return c(x, 0, 1);
                                    if (!1 === c(d, k + e, n)) return
                                }
                                k += e;
                                l = ""
                            } else l += u
                        }
                        return "" !== l ? c(x, 0, 1) : void 0
                    };
                    g.encodePayloadAsArrayBuffer = function(a, b) {
                        function c(a, b) {
                            g.encodePacket(a, !0, !0, function(a) {
                                return b(null, a)
                            })
                        }
                        return a.length ? void f(a, c, function(a, c) {
                            a =
                                c.reduce(function(a, b) {
                                    var c;
                                    return c = "string" == typeof b ? b.length : b.byteLength, a + c.toString().length + c + 2
                                }, 0);
                            var d = new Uint8Array(a),
                                e = 0;
                            return c.forEach(function(a) {
                                var b = "string" == typeof a,
                                    c = a;
                                if (b) {
                                    c = new Uint8Array(a.length);
                                    for (var f = 0; f < a.length; f++) c[f] = a.charCodeAt(f);
                                    c = c.buffer
                                }
                                b ? d[e++] = 0 : d[e++] = 1;
                                a = c.byteLength.toString();
                                for (f = 0; f < a.length; f++) d[e++] = parseInt(a[f]);
                                d[e++] = 255;
                                c = new Uint8Array(c);
                                for (f = 0; f < c.length; f++) d[e++] = c[f]
                            }), b(d.buffer)
                        }) : b(new ArrayBuffer(0))
                    };
                    g.encodePayloadAsBlob =
                        function(a, b) {
                            f(a, function(a, b) {
                                g.encodePacket(a, !0, !0, function(a) {
                                    var c = new Uint8Array(1);
                                    if (c[0] = 1, "string" == typeof a) {
                                        for (var d = new Uint8Array(a.length), e = 0; e < a.length; e++) d[e] = a.charCodeAt(e);
                                        a = d.buffer;
                                        c[0] = 0
                                    }
                                    d = (a instanceof ArrayBuffer ? a.byteLength : a.size).toString();
                                    var f = new Uint8Array(d.length + 1);
                                    for (e = 0; e < d.length; e++) f[e] = parseInt(d[e]);
                                    if (f[d.length] = 255, B) a = new B([c.buffer, f.buffer, a]), b(null, a)
                                })
                            }, function(a, c) {
                                return b(new B(c))
                            })
                        };
                    g.decodePayloadAsBinary = function(a, b, c) {
                        "function" ==
                        typeof b && (c = b, b = null);
                        for (var d = []; 0 < a.byteLength;) {
                            for (var e = new Uint8Array(a), f = 0 === e[0], l = "", k = 1; 255 !== e[k]; k++) {
                                if (310 < l.length) return c(x, 0, 1);
                                l += e[k]
                            }
                            a = n(a, 2 + l.length);
                            l = parseInt(l);
                            e = n(a, 0, l);
                            if (f) try {
                                e = String.fromCharCode.apply(null, new Uint8Array(e))
                            } catch (I) {
                                for (f = new Uint8Array(e), e = "", k = 0; k < f.length; k++) e += String.fromCharCode(f[k])
                            }
                            d.push(e);
                            a = n(a, l)
                        }
                        var u = d.length;
                        d.forEach(function(a, d) {
                            c(g.decodePacket(a, b, !0), d, u)
                        })
                    }
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g) {
                f.exports = Object.keys ||
                    function(d) {
                        var a = [],
                            e = Object.prototype.hasOwnProperty,
                            f;
                        for (f in d) e.call(d, f) && a.push(f);
                        return a
                    }
            },
            function(f, g) {
                f.exports = function(d, a, e) {
                    var f = d.byteLength;
                    if (a = a || 0, e = e || f, d.slice) return d.slice(a, e);
                    if (0 > a && (a += f), 0 > e && (e += f), e > f && (e = f), a >= f || a >= e || 0 === f) return new ArrayBuffer(0);
                    d = new Uint8Array(d);
                    f = new Uint8Array(e - a);
                    for (var b = 0; a < e; a++, b++) f[b] = d[a];
                    return f.buffer
                }
            },
            function(f, g) {
                function d() {}
                f.exports = function(a, e, f) {
                    function b(a, d) {
                        if (0 >= b.count) throw Error("after called too many times");
                        --b.count;
                        a ? (c = !0, e(a), e = f) : 0 !== b.count || c || e(null, d)
                    }
                    var c = !1;
                    return f = f || d, b.count = a, 0 === a ? e() : b
                }
            },
            function(f, g, d) {
                var a;
                (function(d, f) {
                    ! function(b) {
                        function c(a) {
                            for (var b, c, d = [], e = 0, f = a.length; e < f;) b = a.charCodeAt(e++), 55296 <= b && 56319 >= b && e < f ? (c = a.charCodeAt(e++), 56320 == (64512 & c) ? d.push(((1023 & b) << 10) + (1023 & c) + 65536) : (d.push(b), e--)) : d.push(b);
                            return d
                        }

                        function e(a, b) {
                            if (55296 <= a && 57343 >= a) {
                                if (b) throw Error("Lone surrogate U+" + a.toString(16).toUpperCase() + " is not a scalar value");
                                return !1
                            }
                            return !0
                        }

                        function f() {
                            if (r >= y) throw Error("Invalid byte index");
                            var a = 255 & h[r];
                            if (r++, 128 == (192 & a)) return 63 & a;
                            throw Error("Invalid continuation byte");
                        }

                        function k(a) {
                            var b, c, d, l, g;
                            if (r > y) throw Error("Invalid byte index");
                            if (r == y) return !1;
                            if (b = 255 & h[r], r++, 0 == (128 & b)) return b;
                            if (192 == (224 & b)) {
                                if (c = f(), g = (31 & b) << 6 | c, 128 <= g) return g;
                                throw Error("Invalid continuation byte");
                            }
                            if (224 == (240 & b)) {
                                if (c = f(), d = f(), g = (15 & b) << 12 | c << 6 | d, 2048 <= g) return e(g, a) ? g : 65533;
                                throw Error("Invalid continuation byte");
                            }
                            if (240 == (248 &
                                    b) && (c = f(), d = f(), l = f(), g = (7 & b) << 18 | c << 12 | d << 6 | l, 65536 <= g && 1114111 >= g)) return g;
                            throw Error("Invalid UTF-8 detected");
                        }
                        b = "object" == typeof g && g;
                        "object" == typeof d && d && d.exports == b && d;
                        var h, y, r, l = String.fromCharCode;
                        a = {
                            version: "2.1.2",
                            encode: function(a, b) {
                                b = b || {};
                                b = !1 !== b.strict;
                                a = c(a);
                                for (var d = a.length, f = -1, g = ""; ++f < d;) {
                                    var k = a[f];
                                    var n = b;
                                    if (0 == (4294967168 & k)) n = l(k);
                                    else {
                                        var u = "";
                                        n = (0 == (4294965248 & k) ? u = l(k >> 6 & 31 | 192) : 0 == (4294901760 & k) ? (e(k, n) || (k = 65533), u = l(k >> 12 & 15 | 224), u += l(k >> 6 & 63 | 128)) : 0 == (4292870144 &
                                            k) && (u = l(k >> 18 & 7 | 240), u += l(k >> 12 & 63 | 128), u += l(k >> 6 & 63 | 128)), u + l(63 & k | 128))
                                    }
                                    g += n
                                }
                                return g
                            },
                            decode: function(a, b) {
                                b = b || {};
                                b = !1 !== b.strict;
                                h = c(a);
                                y = h.length;
                                r = 0;
                                var d;
                                for (a = []; !1 !== (d = k(b));) a.push(d);
                                d = a.length;
                                for (var e = -1, f = ""; ++e < d;) b = a[e], 65535 < b && (b -= 65536, f += l(b >>> 10 & 1023 | 55296), b = 56320 | 1023 & b), f += l(b);
                                return f
                            }
                        };
                        !(void 0 !== a && (d.exports = a))
                    }(this)
                }).call(g, d(28)(f), function() {
                    return this
                }())
            },
            function(f, g) {
                f.exports = function(d) {
                    return d.webpackPolyfill || (d.deprecate = function() {}, d.paths = [], d.children = [], d.webpackPolyfill = 1), d
                }
            },
            function(f, g) {
                ! function() {
                    for (var d = new Uint8Array(256), a = 0; 64 > a; a++) d["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charCodeAt(a)] = a;
                    g.encode = function(a) {
                        var d = new Uint8Array(a),
                            b = d.length,
                            c = "";
                        for (a = 0; a < b; a += 3) c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [d[a] >> 2], c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [(3 & d[a]) << 4 | d[a + 1] >> 4], c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [(15 &
                            d[a + 1]) << 2 | d[a + 2] >> 6], c += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [63 & d[a + 2]];
                        return 2 === b % 3 ? c = c.substring(0, c.length - 1) + "\x3d" : 1 === b % 3 && (c = c.substring(0, c.length - 2) + "\x3d\x3d"), c
                    };
                    g.decode = function(a) {
                        var e = .75 * a.length;
                        var b = a.length,
                            c = 0;
                        "\x3d" === a[a.length - 1] && (e--, "\x3d" === a[a.length - 2] && e--);
                        var f = new ArrayBuffer(e),
                            g = new Uint8Array(f);
                        for (e = 0; e < b; e += 4) {
                            var p = d[a.charCodeAt(e)];
                            var h = d[a.charCodeAt(e + 1)];
                            var y = d[a.charCodeAt(e + 2)];
                            var r = d[a.charCodeAt(e + 3)];
                            g[c++] = p <<
                                2 | h >> 4;
                            g[c++] = (15 & h) << 4 | y >> 2;
                            g[c++] = (3 & y) << 6 | 63 & r
                        }
                        return f
                    }
                }()
            },
            function(f, g) {
                (function(d) {
                    function a(a) {
                        for (var b = 0; b < a.length; b++) {
                            var c = a[b];
                            if (c.buffer instanceof ArrayBuffer) {
                                var d = c.buffer;
                                if (c.byteLength !== d.byteLength) {
                                    var e = new Uint8Array(c.byteLength);
                                    e.set(new Uint8Array(d, c.byteOffset, c.byteLength));
                                    d = e.buffer
                                }
                                a[b] = d
                            }
                        }
                    }

                    function e(c, d) {
                        d = d || {};
                        var e = new b;
                        a(c);
                        for (var f = 0; f < c.length; f++) e.append(c[f]);
                        return d.type ? e.getBlob(d.type) : e.getBlob()
                    }

                    function g(b, c) {
                        return a(b), new Blob(b, c || {})
                    }
                    var b = d.BlobBuilder || d.WebKitBlobBuilder || d.MSBlobBuilder || d.MozBlobBuilder;
                    try {
                        var c = 2 === (new Blob(["hi"])).size
                    } catch (p) {
                        c = !1
                    }
                    var h;
                    if (h = c) try {
                        h = 2 === (new Blob([new Uint8Array([1, 2])])).size
                    } catch (p) {
                        h = !1
                    }
                    var n = b && b.prototype.append && b.prototype.getBlob;
                    f.exports = c ? h ? d.Blob : g : n ? e : void 0
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g) {
                g.encode = function(d) {
                    var a = "",
                        e;
                    for (e in d) d.hasOwnProperty(e) && (a.length && (a += "\x26"), a += encodeURIComponent(e) + "\x3d" + encodeURIComponent(d[e]));
                    return a
                };
                g.decode =
                    function(d) {
                        var a = {};
                        d = d.split("\x26");
                        for (var e = 0, f = d.length; e < f; e++) {
                            var b = d[e].split("\x3d");
                            a[decodeURIComponent(b[0])] = decodeURIComponent(b[1])
                        }
                        return a
                    }
            },
            function(f, g) {
                f.exports = function(d, a) {
                    var e = function() {};
                    e.prototype = a.prototype;
                    d.prototype = new e;
                    d.prototype.constructor = d
                }
            },
            function(f, g) {
                function d(a) {
                    var c = "";
                    do c = k[a % b] + c, a = Math.floor(a / b); while (0 < a);
                    return c
                }

                function a() {
                    var a = d(+new Date);
                    return a !== e ? (h = 0, e = a) : a + "." + d(h++)
                }
                for (var e, k = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""),
                        b = 64, c = {}, h = 0, n = 0; n < b; n++) c[k[n]] = n;
                a.encode = d;
                a.decode = function(a) {
                    var d = 0;
                    for (n = 0; n < a.length; n++) d = d * b + c[a.charAt(n)];
                    return d
                };
                f.exports = a
            },
            function(f, g, d) {
                (function(a) {
                    function e() {}

                    function g(c) {
                        b.call(this, c);
                        this.query = this.query || {};
                        h || (a.___eio || (a.___eio = []), h = a.___eio);
                        this.index = h.length;
                        var d = this;
                        h.push(function(a) {
                            d.onData(a)
                        });
                        this.query.j = this.index;
                        a.document && a.addEventListener && a.addEventListener("beforeunload", function() {
                            d.script && (d.script.onerror = e)
                        }, !1)
                    }
                    var b = d(21),
                        c = d(32);
                    f.exports = g;
                    var h, n = /\n/g,
                        p = /\\n/g;
                    c(g, b);
                    g.prototype.supportsBinary = !1;
                    g.prototype.doClose = function() {
                        this.script && (this.script.parentNode.removeChild(this.script), this.script = null);
                        this.form && (this.form.parentNode.removeChild(this.form), this.form = null, this.iframe = null);
                        b.prototype.doClose.call(this)
                    };
                    g.prototype.doPoll = function() {
                        var a = this,
                            b = document.createElement("script");
                        this.script && (this.script.parentNode.removeChild(this.script), this.script = null);
                        b.async = !0;
                        b.src = this.uri();
                        b.onerror = function(b) {
                            a.onError("jsonp poll error",
                                b)
                        };
                        var c = document.getElementsByTagName("script")[0];
                        c ? c.parentNode.insertBefore(b, c) : (document.head || document.body).appendChild(b);
                        this.script = b;
                        "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent) && setTimeout(function() {
                            var a = document.createElement("iframe");
                            document.body.appendChild(a);
                            document.body.removeChild(a)
                        }, 100)
                    };
                    g.prototype.doWrite = function(a, b) {
                        function c() {
                            d();
                            b()
                        }

                        function d() {
                            if (e.iframe) try {
                                e.form.removeChild(e.iframe)
                            } catch (D) {
                                e.onError("jsonp polling iframe removal error",
                                    D)
                            }
                            try {
                                f = document.createElement('\x3ciframe src\x3d"javascript:0" name\x3d"' + e.iframeId + '"\x3e')
                            } catch (D) {
                                f = document.createElement("iframe"), f.name = e.iframeId, f.src = "javascript:0"
                            }
                            f.id = e.iframeId;
                            e.form.appendChild(f);
                            e.iframe = f
                        }
                        var e = this;
                        if (!this.form) {
                            var f, g = document.createElement("form"),
                                k = document.createElement("textarea"),
                                h = this.iframeId = "eio_iframe_" + this.index;
                            g.className = "socketio";
                            g.style.position = "absolute";
                            g.style.top = "-1000px";
                            g.style.left = "-1000px";
                            g.target = h;
                            g.method = "POST";
                            g.setAttribute("accept-charset",
                                "utf-8");
                            k.name = "d";
                            g.appendChild(k);
                            document.body.appendChild(g);
                            this.form = g;
                            this.area = k
                        }
                        this.form.action = this.uri();
                        d();
                        a = a.replace(p, "\\\n");
                        this.area.value = a.replace(n, "\\n");
                        try {
                            this.form.submit()
                        } catch (D) {}
                        this.iframe.attachEvent ? this.iframe.onreadystatechange = function() {
                            "complete" === e.iframe.readyState && c()
                        } : this.iframe.onload = c
                    }
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g, d) {
                (function(a) {
                    function e(a) {
                        a && a.forceBase64 && (this.supportsBinary = !1);
                        this.perMessageDeflate = a.perMessageDeflate;
                        this.usingBrowserWebSocket = m && !a.forceNode;
                        this.protocols = a.protocols;
                        this.usingBrowserWebSocket || (r = y);
                        g.call(this, a)
                    }
                    var g = d(22),
                        b = d(23),
                        c = d(31),
                        h = d(32),
                        n = d(33),
                        p = d(3)("engine.io-client:websocket"),
                        m = a.WebSocket || a.MozWebSocket;
                    if ("undefined" == typeof window) try {
                        var y = d(36)
                    } catch (l) {}
                    var r = m;
                    r || "undefined" != typeof window || (r = y);
                    f.exports = e;
                    h(e, g);
                    e.prototype.name = "websocket";
                    e.prototype.supportsBinary = !0;
                    e.prototype.doOpen = function() {
                        if (this.check()) {
                            var a = this.uri(),
                                b = this.protocols,
                                c = {
                                    agent: this.agent,
                                    perMessageDeflate: this.perMessageDeflate
                                };
                            c.pfx = this.pfx;
                            c.key = this.key;
                            c.passphrase = this.passphrase;
                            c.cert = this.cert;
                            c.ca = this.ca;
                            c.ciphers = this.ciphers;
                            c.rejectUnauthorized = this.rejectUnauthorized;
                            this.extraHeaders && (c.headers = this.extraHeaders);
                            this.localAddress && (c.localAddress = this.localAddress);
                            try {
                                this.ws = this.usingBrowserWebSocket ? b ? new r(a, b) : new r(a) : new r(a, b, c)
                            } catch (x) {
                                return this.emit("error", x)
                            }
                            void 0 === this.ws.binaryType && (this.supportsBinary = !1);
                            this.ws.supports && this.ws.supports.binary ?
                                (this.supportsBinary = !0, this.ws.binaryType = "nodebuffer") : this.ws.binaryType = "arraybuffer";
                            this.addEventListeners()
                        }
                    };
                    e.prototype.addEventListeners = function() {
                        var a = this;
                        this.ws.onopen = function() {
                            a.onOpen()
                        };
                        this.ws.onclose = function() {
                            a.onClose()
                        };
                        this.ws.onmessage = function(b) {
                            a.onData(b.data)
                        };
                        this.ws.onerror = function(b) {
                            a.onError("websocket error", b)
                        }
                    };
                    e.prototype.write = function(c) {
                        function d() {
                            e.emit("flush");
                            setTimeout(function() {
                                e.writable = !0;
                                e.emit("drain")
                            }, 0)
                        }
                        var e = this;
                        this.writable = !1;
                        for (var f =
                                c.length, g = 0, l = f; g < l; g++) ! function(c) {
                            b.encodePacket(c, e.supportsBinary, function(b) {
                                if (!e.usingBrowserWebSocket) {
                                    var g = {};
                                    (c.options && (g.compress = c.options.compress), e.perMessageDeflate) && ("string" == typeof b ? a.Buffer.byteLength(b) : b.length) < e.perMessageDeflate.threshold && (g.compress = !1)
                                }
                                try {
                                    e.usingBrowserWebSocket ? e.ws.send(b) : e.ws.send(b, g)
                                } catch (A) {
                                    p("websocket closed before onclose event")
                                }--f || d()
                            })
                        }(c[g])
                    };
                    e.prototype.onClose = function() {
                        g.prototype.onClose.call(this)
                    };
                    e.prototype.doClose = function() {
                        "undefined" !=
                        typeof this.ws && this.ws.close()
                    };
                    e.prototype.uri = function() {
                        var a = this.query || {},
                            b = this.secure ? "wss" : "ws",
                            d = "";
                        this.port && ("wss" === b && 443 !== Number(this.port) || "ws" === b && 80 !== Number(this.port)) && (d = ":" + this.port);
                        this.timestampRequests && (a[this.timestampParam] = n());
                        this.supportsBinary || (a.b64 = 1);
                        a = c.encode(a);
                        a.length && (a = "?" + a);
                        var e = -1 !== this.hostname.indexOf(":");
                        return b + "://" + (e ? "[" + this.hostname + "]" : this.hostname) + d + this.path + a
                    };
                    e.prototype.check = function() {
                        return !(!r || "__initialize" in r && this.name ===
                            e.prototype.name)
                    }
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g) {},
            function(f, g) {
                var d = [].indexOf;
                f.exports = function(a, e) {
                    if (d) return a.indexOf(e);
                    for (var f = 0; f < a.length; ++f)
                        if (a[f] === e) return f;
                    return -1
                }
            },
            function(f, g) {
                (function(d) {
                    var a = /^[\],:{}\s]*$/,
                        e = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                        g = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                        b = /(?:^|:|,)(?:\s*\[)+/g,
                        c = /^\s+/,
                        h = /\s+$/;
                    f.exports = function(f) {
                        return "string" == typeof f && f ? (f = f.replace(c, "").replace(h, ""), d.JSON &&
                            JSON.parse ? JSON.parse(f) : a.test(f.replace(e, "@").replace(g, "]").replace(b, "")) ? (new Function("return " + f))() : void 0) : null
                    }
                }).call(g, function() {
                    return this
                }())
            },
            function(f, g, d) {
                function a(a, b, c) {
                    this.io = a;
                    this.nsp = b;
                    this.json = this;
                    this.ids = 0;
                    this.acks = {};
                    this.receiveBuffer = [];
                    this.sendBuffer = [];
                    this.connected = !1;
                    this.disconnected = !0;
                    c && c.query && (this.query = c.query);
                    this.io.autoConnect && this.open()
                }
                $jscomp.initSymbol();
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                var e = "function" == typeof Symbol &&
                    "symbol" == typeof Symbol.iterator ? function(a) {
                        return typeof a
                    } : function(a) {
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a
                    },
                    k = d(7);
                g = d(8);
                var b = d(40),
                    c = d(41),
                    h = d(42),
                    n = d(3)("socket.io-client:socket"),
                    p = d(31);
                f.exports = a;
                var m = {
                        connect: 1,
                        connect_error: 1,
                        connect_timeout: 1,
                        connecting: 1,
                        disconnect: 1,
                        error: 1,
                        reconnect: 1,
                        reconnect_attempt: 1,
                        reconnect_failed: 1,
                        reconnect_error: 1,
                        reconnecting: 1,
                        ping: 1,
                        pong: 1
                    },
                    y = g.prototype.emit;
                g(a.prototype);
                a.prototype.subEvents = function() {
                    if (!this.subs) {
                        var a = this.io;
                        this.subs = [c(a, "open", h(this, "onopen")), c(a, "packet", h(this, "onpacket")), c(a, "close", h(this, "onclose"))]
                    }
                };
                a.prototype.open = a.prototype.connect = function() {
                    return this.connected ? this : (this.subEvents(), this.io.open(), "open" === this.io.readyState && this.onopen(), this.emit("connecting"), this)
                };
                a.prototype.send = function() {
                    var a = b(arguments);
                    return a.unshift("message"), this.emit.apply(this, a), this
                };
                a.prototype.emit = function(a) {
                    if (m.hasOwnProperty(a)) return y.apply(this, arguments), this;
                    var c = b(arguments),
                        d = {
                            type: k.EVENT,
                            data: c
                        };
                    return d.options = {}, d.options.compress = !this.flags || !1 !== this.flags.compress, "function" == typeof c[c.length - 1] && (n("emitting packet with ack id %d", this.ids), this.acks[this.ids] = c.pop(), d.id = this.ids++), this.connected ? this.packet(d) : this.sendBuffer.push(d), delete this.flags, this
                };
                a.prototype.packet = function(a) {
                    a.nsp = this.nsp;
                    this.io.packet(a)
                };
                a.prototype.onopen = function() {
                    if (n("transport is open - connecting"),
                        "/" !== this.nsp)
                        if (this.query) {
                            var a = "object" === e(this.query) ? p.encode(this.query) : this.query;
                            n("sending connect packet with query %s", a);
                            this.packet({
                                type: k.CONNECT,
                                query: a
                            })
                        } else this.packet({
                            type: k.CONNECT
                        })
                };
                a.prototype.onclose = function(a) {
                    n("close (%s)", a);
                    this.connected = !1;
                    this.disconnected = !0;
                    delete this.id;
                    this.emit("disconnect", a)
                };
                a.prototype.onpacket = function(a) {
                    if (a.nsp === this.nsp) switch (a.type) {
                        case k.CONNECT:
                            this.onconnect();
                            break;
                        case k.EVENT:
                            this.onevent(a);
                            break;
                        case k.BINARY_EVENT:
                            this.onevent(a);
                            break;
                        case k.ACK:
                            this.onack(a);
                            break;
                        case k.BINARY_ACK:
                            this.onack(a);
                            break;
                        case k.DISCONNECT:
                            this.ondisconnect();
                            break;
                        case k.ERROR:
                            this.emit("error", a.data)
                    }
                };
                a.prototype.onevent = function(a) {
                    var b = a.data || [];
                    n("emitting event %j", b);
                    null != a.id && (n("attaching ack callback to event"), b.push(this.ack(a.id)));
                    this.connected ? y.apply(this, b) : this.receiveBuffer.push(b)
                };
                a.prototype.ack = function(a) {
                    var c = this,
                        d = !1;
                    return function() {
                        if (!d) {
                            d = !0;
                            var e = b(arguments);
                            n("sending ack %j", e);
                            c.packet({
                                type: k.ACK,
                                id: a,
                                data: e
                            })
                        }
                    }
                };
                a.prototype.onack = function(a) {
                    var b = this.acks[a.id];
                    "function" == typeof b ? (n("calling ack %s with %j", a.id, a.data), b.apply(this, a.data), delete this.acks[a.id]) : n("bad ack %s", a.id)
                };
                a.prototype.onconnect = function() {
                    this.connected = !0;
                    this.disconnected = !1;
                    this.emit("connect");
                    this.emitBuffered()
                };
                a.prototype.emitBuffered = function() {
                    var a;
                    for (a = 0; a < this.receiveBuffer.length; a++) y.apply(this, this.receiveBuffer[a]);
                    this.receiveBuffer = [];
                    for (a = 0; a < this.sendBuffer.length; a++) this.packet(this.sendBuffer[a]);
                    this.sendBuffer = []
                };
                a.prototype.ondisconnect = function() {
                    n("server disconnect (%s)", this.nsp);
                    this.destroy();
                    this.onclose("io server disconnect")
                };
                a.prototype.destroy = function() {
                    if (this.subs) {
                        for (var a = 0; a < this.subs.length; a++) this.subs[a].destroy();
                        this.subs = null
                    }
                    this.io.destroy(this)
                };
                a.prototype.close = a.prototype.disconnect = function() {
                    return this.connected && (n("performing disconnect (%s)", this.nsp), this.packet({
                            type: k.DISCONNECT
                        })), this.destroy(), this.connected && this.onclose("io client disconnect"),
                        this
                };
                a.prototype.compress = function(a) {
                    return this.flags = this.flags || {}, this.flags.compress = a, this
                }
            },
            function(f, g) {
                f.exports = function(d, a) {
                    for (var e = [], f = (a = a || 0) || 0; f < d.length; f++) e[f - a] = d[f];
                    return e
                }
            },
            function(f, g) {
                f.exports = function(d, a, e) {
                    return d.on(a, e), {
                        destroy: function() {
                            d.removeListener(a, e)
                        }
                    }
                }
            },
            function(f, g) {
                var d = [].slice;
                f.exports = function(a, e) {
                    if ("string" == typeof e && (e = a[e]), "function" != typeof e) throw Error("bind() requires a function");
                    var f = d.call(arguments, 2);
                    return function() {
                        return e.apply(a,
                            f.concat(d.call(arguments)))
                    }
                }
            },
            function(f, g) {
                function d(a) {
                    a = a || {};
                    this.ms = a.min || 100;
                    this.max = a.max || 1E4;
                    this.factor = a.factor || 2;
                    this.jitter = 0 < a.jitter && 1 >= a.jitter ? a.jitter : 0;
                    this.attempts = 0
                }
                f.exports = d;
                d.prototype.duration = function() {
                    var a = this.ms * Math.pow(this.factor, this.attempts++);
                    if (this.jitter) {
                        var d = Math.random(),
                            f = Math.floor(d * this.jitter * a);
                        a = 0 == (1 & Math.floor(10 * d)) ? a - f : a + f
                    }
                    return 0 | Math.min(a, this.max)
                };
                d.prototype.reset = function() {
                    this.attempts = 0
                };
                d.prototype.setMin = function(a) {
                    this.ms =
                        a
                };
                d.prototype.setMax = function(a) {
                    this.max = a
                };
                d.prototype.setJitter = function(a) {
                    this.jitter = a
                }
            }
        ])
    })
}, function(m, q, h) {
    var f = h(3),
        g = h(22);
    q.a = function(d) {
        var a = Object(f.a)({});
        a.id = d.id;
        a.stream = d.stream.stream;
        a.elementID = d.elementID;
        var e = function() {
                a.bar.display()
            },
            k = function() {
                a.bar.hide()
            },
            b = function(b, d, e, f) {
                (f ? 1 / b * d > e : 1 / b * d < e) ? (a.video.style.width = d + "px", a.video.style.height = 1 / b * d + "px", a.video.style.top = -(1 / b * d / 2 - e / 2) + "px", a.video.style.left = "0px") : (a.video.style.height = e + "px", a.video.style.width =
                    b * e + "px", a.video.style.left = -(b * e / 2 - d / 2) + "px", a.video.style.top = "0px")
            };
        a.destroy = function() {
            a.video.pause();
            delete a.resizer;
            a.parentNode.removeChild(a.div)
        };
        a.resize = function() {
            var c = a.container.offsetWidth,
                e = a.container.offsetHeight;
            d.stream.screen || !1 === d.options.crop ? b(16 / 9, c, e, !1) : (c !== a.containerWidth || e !== a.containerHeight) && b(4 / 3, c, e, !0);
            a.containerWidth = c;
            a.containerHeight = e
        };
        a.div = document.createElement("div");
        a.div.setAttribute("id", "player_" + a.id);
        a.div.setAttribute("class", "licode_player");
        a.div.setAttribute("style", "width: 100%; height: 100%; position: relative; background-color: black; overflow: hidden;");
        !1 !== d.options.loader && (a.loader = document.createElement("img"), a.loader.setAttribute("style", "width: 16px; height: 16px; position: absolute; top: 50%; left: 50%; margin-top: -8px; margin-left: -8px"), a.loader.setAttribute("id", "back_" + a.id), a.loader.setAttribute("class", "licode_loader"), a.loader.setAttribute("src", a.url + "/assets/loader.gif"));
        a.video = document.createElement("video");
        a.video.setAttribute("id", "stream" + a.id);
        a.video.setAttribute("class", "licode_stream");
        a.video.setAttribute("style", "width: 100%; height: 100%; position: absolute");
        a.video.setAttribute("autoplay", "autoplay");
        a.video.setAttribute("playsinline", "playsinline");
        d.stream.local && (a.video.volume = 0);
        a.container = void 0 !== a.elementID ? "object" === typeof a.elementID && "function" === typeof a.elementID.appendChild ? a.elementID : document.getElementById(a.elementID) : document.body;
        a.container.appendChild(a.div);
        a.parentNode =
            a.div.parentNode;
        a.loader && a.div.appendChild(a.loader);
        a.div.appendChild(a.video);
        a.containerWidth = 0;
        a.containerHeight = 0;
        !1 !== d.options.resizer && (a.resizer = L.ResizeSensor(a.container, a.resize), a.resize());
        !1 !== d.options.bar ? (a.bar = Object(g.a)({
            elementID: "player_" + a.id,
            id: a.id,
            stream: d.stream,
            media: a.video,
            options: d.options
        }), a.div.onmouseover = e, a.div.onmouseout = k) : a.media = a.video;
        a.video.srcObject = a.stream;
        return a
    }
}, function(m, q, h) {
    var f = h(3);
    q.a = function(g) {
        var d = Object(f.a)({}),
            a = 50;
        d.elementID =
            g.elementID;
        d.media = g.media;
        d.id = g.id;
        d.stream = g.stream;
        d.div = document.createElement("div");
        d.div.setAttribute("style", "width: 40%; height: 100%; max-width: 32px; position: absolute; right: 0;z-index:0;");
        d.icon = document.createElement("img");
        d.icon.setAttribute("id", "volume_" + d.id);
        d.icon.setAttribute("src", d.url + "/assets/sound48.png");
        d.icon.setAttribute("style", "width: 80%; height: 100%; position: absolute;");
        d.div.appendChild(d.icon);
        d.icon.onclick = function() {
            d.media.muted ? (d.media.muted = !1, d.icon.setAttribute("src",
                d.url + "/assets/sound48.png"), d.stream.local ? d.stream.stream.getAudioTracks()[0].enabled = !0 : (d.picker.value = a, d.media.volume = d.picker.value / 100)) : (d.media.muted = !0, d.icon.setAttribute("src", d.url + "/assets/mute48.png"), d.stream.local ? d.stream.stream.getAudioTracks()[0].enabled = !1 : (a = d.picker.value, d.picker.value = 0, d.media.volume = 0))
        };
        if (!d.stream.local) {
            d.picker = document.createElement("input");
            d.picker.setAttribute("id", "picker_" + d.id);
            d.picker.type = "range";
            d.picker.min = 0;
            d.picker.max = 100;
            d.picker.step =
                10;
            d.picker.value = a;
            d.picker.setAttribute("orient", "vertical");
            d.div.appendChild(d.picker);
            d.media.volume = d.picker.value / 100;
            d.media.muted = !1;
            d.picker.oninput = function() {
                0 < d.picker.value ? (d.media.muted = !1, d.icon.setAttribute("src", d.url + "/assets/sound48.png")) : (d.media.muted = !0, d.icon.setAttribute("src", d.url + "/assets/mute48.png"));
                d.media.volume = d.picker.value / 100
            };
            var e = function(a) {
                d.picker.setAttribute("style", "background: transparent; width: 32px;\n                                         height: 100px; position: absolute; bottom: 90%;\n                                         z-index: 1; right: 0px; -webkit-appearance: slider-vertical;\n                                         bottom: " +
                    d.div.offsetHeight + "px; display: " + a)
            };
            d.div.onmouseover = function() {
                e("block")
            };
            d.div.onmouseout = function() {
                e("none")
            };
            e("none")
        }
        document.getElementById(d.elementID).appendChild(d.div);
        return d
    }
}, function(m, q, h) {
    var f = h(3),
        g = h(22);
    q.a = function(d) {
        var a = Object(f.a)({});
        a.id = d.id;
        a.stream = d.stream.stream;
        a.elementID = d.elementID;
        a.audio = document.createElement("audio");
        a.audio.setAttribute("id", "stream" + a.id);
        a.audio.setAttribute("class", "licode_stream");
        a.audio.setAttribute("style", "width: 100%; height: 100%; position: absolute");
        a.audio.setAttribute("autoplay", "autoplay");
        d.stream.local && (a.audio.volume = 0);
        if (void 0 !== a.elementID) {
            a.destroy = function() {
                a.audio.pause();
                a.parentNode.removeChild(a.div)
            };
            var e = function() {
                a.bar.display()
            };
            var k = function() {
                a.bar.hide()
            };
            a.div = document.createElement("div");
            a.div.setAttribute("id", "player_" + a.id);
            a.div.setAttribute("class", "licode_player");
            a.div.setAttribute("style", "width: 100%; height: 100%; position: relative; overflow: hidden;");
            a.container = "object" === typeof a.elementID && "function" ===
                typeof a.elementID.appendChild ? a.elementID : document.getElementById(a.elementID);
            a.container.appendChild(a.div);
            a.parentNode = a.div.parentNode;
            a.div.appendChild(a.audio);
            !1 !== d.options.bar ? (a.bar = Object(g.a)({
                elementID: "player_" + a.id,
                id: a.id,
                stream: d.stream,
                media: a.audio,
                options: d.options
            }), a.div.onmouseover = e, a.div.onmouseout = k) : a.media = a.audio
        } else a.destroy = function() {
            a.audio.pause();
            a.parentNode.removeChild(a.audio)
        }, document.body.appendChild(a.audio), a.parentNode = document.body;
        a.audio.srcObject =
            a.stream;
        return a
    }
}, function(m, q, h) {
    q.a = function() {
        var f = {},
            g = {};
        f.add = function(d, a) {
            g[d] = a
        };
        f.get = function(d) {
            return g[d]
        };
        f.has = function(d) {
            return void 0 !== g[d]
        };
        f.forEach = function(d) {
            for (var a = Object.keys(g), e = 0; e < a.length; e += 1) {
                var f = a[e];
                d(g[f], f)
            }
        };
        f.keys = function() {
            return Object.keys(g)
        };
        f.remove = function(d) {
            delete g[d]
        };
        return f
    }
}, function(m, q, h) {
    m = function() {
        for (var f, g, d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""), a = [], e = 0; e < d.length; e += 1) a[d[e]] = e;
        var k =
            function() {
                if (!f || g >= f.length) return -1;
                var a = f.charCodeAt(g) & 255;
                g += 1;
                return a
            },
            b = function() {
                if (!f) return -1;
                for (;;) {
                    if (g >= f.length) return -1;
                    var b = f.charAt(g);
                    g += 1;
                    if (a[b]) return a[b];
                    if ("A" === b) return 0
                }
            },
            c = function(a) {
                a = a.toString(16);
                1 === a.length && (a = "0" + a);
                return unescape("%" + a)
            };
        return {
            encodeBase64: function(a) {
                var b;
                f = a;
                g = 0;
                a = "";
                var c = Array(3);
                var e = 0;
                for (b = !1; !b && -1 !== (c[0] = k());) c[1] = k(), c[2] = k(), a += d[c[0] >> 2], -1 !== c[1] ? (a += d[c[0] << 4 & 48 | c[1] >> 4], -1 !== c[2] ? (a += d[c[1] << 2 & 60 | c[2] >> 6], a += d[c[2] &
                    63]) : (a += d[c[1] << 2 & 60], a += "\x3d", b = !0)) : (a += d[c[0] << 4 & 48], a += "\x3d", a += "\x3d", b = !0), e += 4, 76 <= e && (a += "\n", e = 0);
                return a
            },
            decodeBase64: function(a) {
                var d;
                f = a;
                g = 0;
                a = "";
                var e = Array(4);
                for (d = !1; !d && -1 !== (e[0] = b()) && -1 !== (e[1] = b());) e[2] = b(), e[3] = b(), a += c(e[0] << 2 & 255 | e[1] >> 4), -1 !== e[2] ? (a += c(e[1] << 4 & 255 | e[2] >> 2), -1 !== e[3] ? a += c(e[2] << 6 & 255 | e[3]) : d = !0) : d = !0;
                return a
            }
        }
    }();
    q.a = m
}, function(m, q, h) {
    q = h(23);
    m.exports = q.adapter = h(46)
}, function(m, q, h) {
    (function(f) {
        m.exports = function() {
            return function k(d, a, e) {
                function b(f,
                    h) {
                    if (!a[f]) {
                        if (!d[f]) {
                            if (c) return c(f, !0);
                            h = Error("Cannot find module '" + f + "'");
                            throw h.code = "MODULE_NOT_FOUND", h;
                        }
                        h = a[f] = {
                            exports: {}
                        };
                        d[f][0].call(h.exports, function(a) {
                            var c = d[f][1][a];
                            return b(c ? c : a)
                        }, h, h.exports, k, d, a, e)
                    }
                    return a[f].exports
                }
                for (var c = !1, f = 0; f < e.length; f++) b(e[f]);
                return b
            }({
                1: [function(d, a, e) {
                    function f(a, b, c, d, e) {
                        b = p.writeRtpDescription(a.kind, b);
                        b += p.writeIceParameters(a.iceGatherer.getLocalParameters());
                        b += p.writeDtlsParameters(a.dtlsTransport.getLocalParameters(), "offer" ===
                            c ? "actpass" : e || "active");
                        b += "a\x3dmid:" + a.mid + "\r\n";
                        b = a.direction ? b + ("a\x3d" + a.direction + "\r\n") : a.rtpSender && a.rtpReceiver ? b + "a\x3dsendrecv\r\n" : a.rtpSender ? b + "a\x3dsendonly\r\n" : a.rtpReceiver ? b + "a\x3drecvonly\r\n" : b + "a\x3dinactive\r\n";
                        a.rtpSender && (c = "msid:" + d.id + " " + a.rtpSender.track.id + "\r\n", b = b + ("a\x3d" + c) + ("a\x3dssrc:" + a.sendEncodingParameters[0].ssrc + " " + c), a.sendEncodingParameters[0].rtx && (b += "a\x3dssrc:" + a.sendEncodingParameters[0].rtx.ssrc + " " + c, b += "a\x3dssrc-group:FID " + a.sendEncodingParameters[0].ssrc +
                            " " + a.sendEncodingParameters[0].rtx.ssrc + "\r\n"));
                        b += "a\x3dssrc:" + a.sendEncodingParameters[0].ssrc + " cname:" + p.localCName + "\r\n";
                        a.rtpSender && a.sendEncodingParameters[0].rtx && (b += "a\x3dssrc:" + a.sendEncodingParameters[0].rtx.ssrc + " cname:" + p.localCName + "\r\n");
                        return b
                    }

                    function b(a, b) {
                        var c = !1;
                        a = JSON.parse(JSON.stringify(a));
                        return a.filter(function(a) {
                            if (a && (a.urls || a.url)) {
                                var d = a.urls || a.url;
                                a.url && !a.urls && console.warn("RTCIceServer.url is deprecated! Use urls instead.");
                                var e = "string" === typeof d;
                                e && (d = [d]);
                                d = d.filter(function(a) {
                                    return 0 !== a.indexOf("turn:") || -1 === a.indexOf("transport\x3dudp") || -1 !== a.indexOf("turn:[") || c ? 0 === a.indexOf("stun:") && 14393 <= b && -1 === a.indexOf("?transport\x3dudp") : c = !0
                                });
                                delete a.url;
                                a.urls = e ? d[0] : d;
                                return !!d.length
                            }
                            return !1
                        })
                    }

                    function c(a, b) {
                        var c = {
                                codecs: [],
                                headerExtensions: [],
                                fecMechanisms: []
                            },
                            d = function(a, b) {
                                a = parseInt(a, 10);
                                for (var c = 0; c < b.length; c++)
                                    if (b[c].payloadType === a || b[c].preferredPayloadType === a) return b[c]
                            },
                            e = function(a, b, c, e) {
                                a = d(a.parameters.apt,
                                    c);
                                b = d(b.parameters.apt, e);
                                return a && b && a.name.toLowerCase() === b.name.toLowerCase()
                            };
                        a.codecs.forEach(function(d) {
                            for (var f = 0; f < b.codecs.length; f++) {
                                var l = b.codecs[f];
                                if (d.name.toLowerCase() === l.name.toLowerCase() && d.clockRate === l.clockRate && ("rtx" !== d.name.toLowerCase() || !d.parameters || !l.parameters.apt || e(d, l, a.codecs, b.codecs))) {
                                    l = JSON.parse(JSON.stringify(l));
                                    l.numChannels = Math.min(d.numChannels, l.numChannels);
                                    c.codecs.push(l);
                                    l.rtcpFeedback = l.rtcpFeedback.filter(function(a) {
                                        for (var b = 0; b < d.rtcpFeedback.length; b++)
                                            if (d.rtcpFeedback[b].type ===
                                                a.type && d.rtcpFeedback[b].parameter === a.parameter) return !0;
                                        return !1
                                    });
                                    break
                                }
                            }
                        });
                        a.headerExtensions.forEach(function(a) {
                            for (var d = 0; d < b.headerExtensions.length; d++) {
                                var e = b.headerExtensions[d];
                                if (a.uri === e.uri) {
                                    c.headerExtensions.push(e);
                                    break
                                }
                            }
                        });
                        return c
                    }

                    function h(a, b, c) {
                        return -1 !== {
                            offer: {
                                setLocalDescription: ["stable", "have-local-offer"],
                                setRemoteDescription: ["stable", "have-remote-offer"]
                            },
                            answer: {
                                setLocalDescription: ["have-remote-offer", "have-local-pranswer"],
                                setRemoteDescription: ["have-local-offer",
                                    "have-remote-pranswer"
                                ]
                            }
                        }[b][a].indexOf(c)
                    }

                    function n(a, b) {
                        var c = a.getRemoteCandidates().find(function(a) {
                            return b.foundation === a.foundation && b.ip === a.ip && b.port === a.port && b.priority === a.priority && b.protocol === a.protocol && b.type === a.type
                        });
                        c || a.addRemoteCandidate(b);
                        return !c
                    }
                    var p = d("sdp");
                    a.exports = function(a, d) {
                        var e = function(c) {
                            var e = this,
                                f = document.createDocumentFragment();
                            ["addEventListener", "removeEventListener", "dispatchEvent"].forEach(function(a) {
                                e[a] = f[a].bind(f)
                            });
                            this.canTrickleIceCandidates =
                                this.ondatachannel = this.onnegotiationneeded = this.onicegatheringstatechange = this.oniceconnectionstatechange = this.onsignalingstatechange = this.onremovestream = this.ontrack = this.onaddstream = this.onicecandidate = null;
                            this.needNegotiation = !1;
                            this.localStreams = [];
                            this.remoteStreams = [];
                            this.remoteDescription = this.localDescription = null;
                            this.signalingState = "stable";
                            this.iceGatheringState = this.iceConnectionState = "new";
                            c = JSON.parse(JSON.stringify(c || {}));
                            this.usingBundle = "max-bundle" === c.bundlePolicy;
                            if ("negotiate" ===
                                c.rtcpMuxPolicy) throw c = Error("rtcpMuxPolicy 'negotiate' is not supported"), c.name = "NotSupportedError", c;
                            c.rtcpMuxPolicy || (c.rtcpMuxPolicy = "require");
                            switch (c.iceTransportPolicy) {
                                case "all":
                                case "relay":
                                    break;
                                default:
                                    c.iceTransportPolicy = "all"
                            }
                            switch (c.bundlePolicy) {
                                case "balanced":
                                case "max-compat":
                                case "max-bundle":
                                    break;
                                default:
                                    c.bundlePolicy = "balanced"
                            }
                            c.iceServers = b(c.iceServers || [], d);
                            this._iceGatherers = [];
                            if (c.iceCandidatePoolSize)
                                for (var l = c.iceCandidatePoolSize; 0 < l; l--) this._iceGatherers =
                                    new a.RTCIceGatherer({
                                        iceServers: c.iceServers,
                                        gatherPolicy: c.iceTransportPolicy
                                    });
                            else c.iceCandidatePoolSize = 0;
                            this._config = c;
                            this.transceivers = [];
                            this._sdpSessionId = p.generateSessionId();
                            this._sdpSessionVersion = 0;
                            this._dtlsRole = void 0
                        };
                        e.prototype._emitGatheringStateChange = function() {
                            var a = new Event("icegatheringstatechange");
                            this.dispatchEvent(a);
                            if ("function" === typeof this.onicegatheringstatechange) this.onicegatheringstatechange(a)
                        };
                        e.prototype.getConfiguration = function() {
                            return this._config
                        };
                        e.prototype.getLocalStreams = function() {
                            return this.localStreams
                        };
                        e.prototype.getRemoteStreams = function() {
                            return this.remoteStreams
                        };
                        e.prototype._createTransceiver = function(a) {
                            var b = 0 < this.transceivers.length;
                            a = {
                                track: null,
                                iceGatherer: null,
                                iceTransport: null,
                                dtlsTransport: null,
                                localCapabilities: null,
                                remoteCapabilities: null,
                                rtpSender: null,
                                rtpReceiver: null,
                                kind: a,
                                mid: null,
                                sendEncodingParameters: null,
                                recvEncodingParameters: null,
                                stream: null,
                                wantReceive: !0
                            };
                            this.usingBundle && b ? (a.iceTransport = this.transceivers[0].iceTransport,
                                a.dtlsTransport = this.transceivers[0].dtlsTransport) : (b = this._createIceAndDtlsTransports(), a.iceTransport = b.iceTransport, a.dtlsTransport = b.dtlsTransport);
                            this.transceivers.push(a);
                            return a
                        };
                        e.prototype.addTrack = function(b, c) {
                            for (var d, e = 0; e < this.transceivers.length; e++) this.transceivers[e].track || this.transceivers[e].kind !== b.kind || (d = this.transceivers[e]);
                            d || (d = this._createTransceiver(b.kind));
                            this._maybeFireNegotiationNeeded(); - 1 === this.localStreams.indexOf(c) && this.localStreams.push(c);
                            d.track =
                                b;
                            d.stream = c;
                            d.rtpSender = new a.RTCRtpSender(b, d.dtlsTransport);
                            return d.rtpSender
                        };
                        e.prototype.addStream = function(a) {
                            var b = this;
                            if (15025 <= d) a.getTracks().forEach(function(c) {
                                b.addTrack(c, a)
                            });
                            else {
                                var c = a.clone();
                                a.getTracks().forEach(function(a, b) {
                                    var d = c.getTracks()[b];
                                    a.addEventListener("enabled", function(a) {
                                        d.enabled = a.enabled
                                    })
                                });
                                c.getTracks().forEach(function(a) {
                                    b.addTrack(a, c)
                                })
                            }
                        };
                        e.prototype.removeStream = function(a) {
                            a = this.localStreams.indexOf(a); - 1 < a && (this.localStreams.splice(a, 1), this._maybeFireNegotiationNeeded())
                        };
                        e.prototype.getSenders = function() {
                            return this.transceivers.filter(function(a) {
                                return !!a.rtpSender
                            }).map(function(a) {
                                return a.rtpSender
                            })
                        };
                        e.prototype.getReceivers = function() {
                            return this.transceivers.filter(function(a) {
                                return !!a.rtpReceiver
                            }).map(function(a) {
                                return a.rtpReceiver
                            })
                        };
                        e.prototype._createIceGatherer = function(b, c) {
                            var d = this;
                            if (c && 0 < b) return this.transceivers[0].iceGatherer;
                            if (this._iceGatherers.length) return this._iceGatherers.shift();
                            var e = new a.RTCIceGatherer({
                                iceServers: this._config.iceServers,
                                gatherPolicy: this._config.iceTransportPolicy
                            });
                            Object.defineProperty(e, "state", {
                                value: "new",
                                writable: !0
                            });
                            this.transceivers[b].candidates = [];
                            this.transceivers[b].bufferCandidates = function(a) {
                                var c = !a.candidate || 0 === Object.keys(a.candidate).length;
                                e.state = c ? "completed" : "gathering";
                                null !== d.transceivers[b].candidates && d.transceivers[b].candidates.push(a.candidate)
                            };
                            e.addEventListener("localcandidate", this.transceivers[b].bufferCandidates);
                            return e
                        };
                        e.prototype._gather = function(b, c) {
                            var d = this,
                                e = this.transceivers[c].iceGatherer;
                            if (!e.onlocalcandidate) {
                                var f = this.transceivers[c].candidates;
                                this.transceivers[c].candidates = null;
                                e.removeEventListener("localcandidate", this.transceivers[c].bufferCandidates);
                                e.onlocalcandidate = function(a) {
                                    if (!(d.usingBundle && 0 < c)) {
                                        var f = new Event("icecandidate");
                                        f.candidate = {
                                            sdpMid: b,
                                            sdpMLineIndex: c
                                        };
                                        var l = a.candidate;
                                        if (a = !l || 0 === Object.keys(l).length) {
                                            if ("new" === e.state || "gathering" === e.state) e.state = "completed"
                                        } else "new" === e.state && (e.state = "gathering"), l.component = 1, f.candidate.candidate = p.writeCandidate(l);
                                        l = p.splitSections(d.localDescription.sdp);
                                        l[f.candidate.sdpMLineIndex + 1] = a ? l[f.candidate.sdpMLineIndex + 1] + "a\x3dend-of-candidates\r\n" : l[f.candidate.sdpMLineIndex + 1] + ("a\x3d" + f.candidate.candidate + "\r\n");
                                        d.localDescription.sdp = l.join("");
                                        l = d.transceivers.every(function(a) {
                                            return a.iceGatherer && "completed" === a.iceGatherer.state
                                        });
                                        "gathering" !== d.iceGatheringState && (d.iceGatheringState = "gathering", d._emitGatheringStateChange());
                                        if (!a && (d.dispatchEvent(f), "function" === typeof d.onicecandidate)) d.onicecandidate(f);
                                        if (l) {
                                            d.dispatchEvent(new Event("icecandidate"));
                                            if ("function" === typeof d.onicecandidate) d.onicecandidate(new Event("icecandidate"));
                                            d.iceGatheringState = "complete";
                                            d._emitGatheringStateChange()
                                        }
                                    }
                                };
                                a.setTimeout(function() {
                                    f.forEach(function(a) {
                                        var b = new Event("RTCIceGatherEvent");
                                        b.candidate = a;
                                        e.onlocalcandidate(b)
                                    })
                                }, 0)
                            }
                        };
                        e.prototype._createIceAndDtlsTransports = function() {
                            var b = this,
                                c = new a.RTCIceTransport(null);
                            c.onicestatechange = function() {
                                b._updateConnectionState()
                            };
                            var d = new a.RTCDtlsTransport(c);
                            d.ondtlsstatechange = function() {
                                b._updateConnectionState()
                            };
                            d.onerror = function() {
                                Object.defineProperty(d, "state", {
                                    value: "failed",
                                    writable: !0
                                });
                                b._updateConnectionState()
                            };
                            return {
                                iceTransport: c,
                                dtlsTransport: d
                            }
                        };
                        e.prototype._disposeIceAndDtlsTransports = function(a) {
                            var b = this.transceivers[a].iceGatherer;
                            b && (delete b.onlocalcandidate, delete this.transceivers[a].iceGatherer);
                            if (b = this.transceivers[a].iceTransport) delete b.onicestatechange, delete this.transceivers[a].iceTransport;
                            if (b = this.transceivers[a].dtlsTransport) delete b.ondtlsstatechange,
                                delete b.onerror, delete this.transceivers[a].dtlsTransport
                        };
                        e.prototype._transceive = function(a, b, e) {
                            var f = c(a.localCapabilities, a.remoteCapabilities);
                            b && a.rtpSender && (f.encodings = a.sendEncodingParameters, f.rtcp = {
                                cname: p.localCName,
                                compound: a.rtcpParameters.compound
                            }, a.recvEncodingParameters.length && (f.rtcp.ssrc = a.recvEncodingParameters[0].ssrc), a.rtpSender.send(f));
                            e && a.rtpReceiver && 0 < f.codecs.length && ("video" === a.kind && a.recvEncodingParameters && 15019 > d && a.recvEncodingParameters.forEach(function(a) {
                                    delete a.rtx
                                }),
                                f.encodings = a.recvEncodingParameters, f.rtcp = {
                                    cname: a.rtcpParameters.cname,
                                    compound: a.rtcpParameters.compound
                                }, a.sendEncodingParameters.length && (f.rtcp.ssrc = a.sendEncodingParameters[0].ssrc), a.rtpReceiver.receive(f))
                        };
                        e.prototype.setLocalDescription = function(a) {
                            var b = this,
                                d = arguments;
                            if (!h("setLocalDescription", a.type, this.signalingState)) return new Promise(function(c, e) {
                                c = Error("Can not set local " + a.type + " in state " + b.signalingState);
                                c.name = "InvalidStateError";
                                2 < d.length && "function" === typeof d[2] &&
                                    d[2].apply(null, [c]);
                                e(c)
                            });
                            if ("offer" === a.type) {
                                var e = p.splitSections(a.sdp);
                                var f = e.shift();
                                e.forEach(function(a, c) {
                                    a = p.parseRtpParameters(a);
                                    b.transceivers[c].localCapabilities = a
                                });
                                this.transceivers.forEach(function(a, c) {
                                    b._gather(a.mid, c)
                                })
                            } else if ("answer" === a.type) {
                                e = p.splitSections(b.remoteDescription.sdp);
                                f = e.shift();
                                var k = 0 < p.matchPrefix(f, "a\x3dice-lite").length;
                                e.forEach(function(a, d) {
                                    var e = b.transceivers[d],
                                        l = e.iceGatherer,
                                        h = e.iceTransport,
                                        n = e.dtlsTransport,
                                        t = e.localCapabilities,
                                        u = e.remoteCapabilities;
                                    if (!(p.isRejected(a) && 1 === !p.matchPrefix(a, "a\x3dbundle-only").length || e.isDatachannel)) {
                                        var r = p.getIceParameters(a, f);
                                        a = p.getDtlsParameters(a, f);
                                        k && (a.role = "server");
                                        b.usingBundle && 0 !== d || (b._gather(e.mid, d), "new" === h.state && h.start(l, r, k ? "controlling" : "controlled"), "new" === n.state && n.start(a));
                                        d = c(t, u);
                                        b._transceive(e, 0 < d.codecs.length, !1)
                                    }
                                })
                            }
                            this.localDescription = {
                                type: a.type,
                                sdp: a.sdp
                            };
                            switch (a.type) {
                                case "offer":
                                    this._updateSignalingState("have-local-offer");
                                    break;
                                case "answer":
                                    this._updateSignalingState("stable");
                                    break;
                                default:
                                    throw new TypeError('unsupported type "' + a.type + '"');
                            }
                            var l = 1 < arguments.length && "function" === typeof arguments[1] && arguments[1];
                            return new Promise(function(a) {
                                l && l.apply(null);
                                a()
                            })
                        };
                        e.prototype.setRemoteDescription = function(b) {
                            var c = this,
                                e = arguments;
                            if (!h("setRemoteDescription", b.type, this.signalingState)) return new Promise(function(a, d) {
                                a = Error("Can not set remote " + b.type + " in state " + c.signalingState);
                                a.name = "InvalidStateError";
                                2 < e.length && "function" === typeof e[2] && e[2].apply(null, [a]);
                                d(a)
                            });
                            var f = {};
                            this.remoteStreams.forEach(function(a) {
                                f[a.id] = a
                            });
                            var k = [],
                                l = p.splitSections(b.sdp),
                                t = l.shift(),
                                r = 0 < p.matchPrefix(t, "a\x3dice-lite").length,
                                m = 0 < p.matchPrefix(t, "a\x3dgroup:BUNDLE ").length;
                            this.usingBundle = m;
                            var q = p.matchPrefix(t, "a\x3dice-options:")[0];
                            this.canTrickleIceCandidates = q ? 0 <= q.substr(14).split(" ").indexOf("trickle") : !1;
                            l.forEach(function(e, l) {
                                var h = p.splitLines(e),
                                    u = p.getKind(e),
                                    w = p.isRejected(e) && 1 === !p.matchPrefix(e, "a\x3dbundle-only").length;
                                h = h[0].substr(2).split(" ")[2];
                                var q = p.getDirection(e, t),
                                    C = p.parseMsid(e),
                                    x = p.getMid(e) || p.generateIdentifier();
                                if ("application" === u && "DTLS/SCTP" === h) c.transceivers[l] = {
                                    mid: x,
                                    isDatachannel: !0
                                };
                                else {
                                    var y = p.parseRtpParameters(e);
                                    if (!w) {
                                        var B = p.getIceParameters(e, t);
                                        var v = p.getDtlsParameters(e, t);
                                        v.role = "client"
                                    }
                                    h = p.parseRtpEncodingParameters(e);
                                    var D = p.parseRtcpParameters(e),
                                        F = 0 < p.matchPrefix(e, "a\x3dend-of-candidates", t).length,
                                        z = p.matchPrefix(e, "a\x3dcandidate:").map(function(a) {
                                            return p.parseCandidate(a)
                                        }).filter(function(a) {
                                            return 1 ===
                                                a.component
                                        });
                                    ("offer" === b.type || "answer" === b.type) && !w && m && 0 < l && c.transceivers[l] && (c._disposeIceAndDtlsTransports(l), c.transceivers[l].iceGatherer = c.transceivers[0].iceGatherer, c.transceivers[l].iceTransport = c.transceivers[0].iceTransport, c.transceivers[l].dtlsTransport = c.transceivers[0].dtlsTransport, c.transceivers[l].rtpSender && c.transceivers[l].rtpSender.setTransport(c.transceivers[0].dtlsTransport), c.transceivers[l].rtpReceiver && c.transceivers[l].rtpReceiver.setTransport(c.transceivers[0].dtlsTransport));
                                    if ("offer" === b.type && !w) {
                                        var A = c.transceivers[l] || c._createTransceiver(u);
                                        A.mid = x;
                                        A.iceGatherer || (A.iceGatherer = c._createIceGatherer(l, m));
                                        z.length && "new" === A.iceTransport.state && (!F || m && 0 !== l ? z.forEach(function(a) {
                                            n(A.iceTransport, a)
                                        }) : A.iceTransport.setRemoteCandidates(z));
                                        e = a.RTCRtpReceiver.getCapabilities(u);
                                        15019 > d && (e.codecs = e.codecs.filter(function(a) {
                                            return "rtx" !== a.name
                                        }));
                                        w = A.sendEncodingParameters || [{
                                            ssrc: 1001 * (2 * l + 2)
                                        }];
                                        B = !1;
                                        if ("sendrecv" === q || "sendonly" === q) {
                                            B = !A.rtpReceiver;
                                            var E = A.rtpReceiver ||
                                                new a.RTCRtpReceiver(A.dtlsTransport, u);
                                            B && (q = E.track, C ? (f[C.stream] || (f[C.stream] = new a.MediaStream, Object.defineProperty(f[C.stream], "id", {
                                                get: function() {
                                                    return C.stream
                                                }
                                            })), Object.defineProperty(q, "id", {
                                                get: function() {
                                                    return C.track
                                                }
                                            }), v = f[C.stream]) : (f.default || (f.default = new a.MediaStream), v = f.default), v.addTrack(q), k.push([q, E, v]))
                                        }
                                        A.localCapabilities = e;
                                        A.remoteCapabilities = y;
                                        A.rtpReceiver = E;
                                        A.rtcpParameters = D;
                                        A.sendEncodingParameters = w;
                                        A.recvEncodingParameters = h;
                                        c._transceive(c.transceivers[l], !1, B)
                                    } else if ("answer" === b.type && !w) {
                                        A = c.transceivers[l];
                                        u = A.iceGatherer;
                                        x = A.iceTransport;
                                        var G = A.dtlsTransport;
                                        E = A.rtpReceiver;
                                        w = A.sendEncodingParameters;
                                        e = A.localCapabilities;
                                        c.transceivers[l].recvEncodingParameters = h;
                                        c.transceivers[l].remoteCapabilities = y;
                                        c.transceivers[l].rtcpParameters = D;
                                        z.length && "new" === x.state && (!r && !F || m && 0 !== l ? z.forEach(function(a) {
                                            n(A.iceTransport, a)
                                        }) : x.setRemoteCandidates(z));
                                        m && 0 !== l || ("new" === x.state && x.start(u, B, "controlling"), "new" === G.state && G.start(v));
                                        c._transceive(A,
                                            "sendrecv" === q || "recvonly" === q, "sendrecv" === q || "sendonly" === q);
                                        !E || "sendrecv" !== q && "sendonly" !== q ? delete A.rtpReceiver : (q = E.track, C ? (f[C.stream] || (f[C.stream] = new a.MediaStream), f[C.stream].addTrack(q), k.push([q, E, f[C.stream]])) : (f.default || (f.default = new a.MediaStream), f.default.addTrack(q), k.push([q, E, f.default])))
                                    }
                                }
                            });
                            void 0 === this._dtlsRole && (this._dtlsRole = "offer" === b.type ? "active" : "passive");
                            this.remoteDescription = {
                                type: b.type,
                                sdp: b.sdp
                            };
                            switch (b.type) {
                                case "offer":
                                    this._updateSignalingState("have-remote-offer");
                                    break;
                                case "answer":
                                    this._updateSignalingState("stable");
                                    break;
                                default:
                                    throw new TypeError('unsupported type "' + b.type + '"');
                            }
                            Object.keys(f).forEach(function(b) {
                                var d = f[b];
                                if (d.getTracks().length) {
                                    if (-1 === c.remoteStreams.indexOf(d)) {
                                        c.remoteStreams.push(d);
                                        var e = new Event("addstream");
                                        e.stream = d;
                                        a.setTimeout(function() {
                                            c.dispatchEvent(e);
                                            if ("function" === typeof c.onaddstream) c.onaddstream(e)
                                        })
                                    }
                                    k.forEach(function(b) {
                                        var e = b[0],
                                            f = b[1];
                                        if (d.id === b[2].id) {
                                            var k = new Event("track");
                                            k.track = e;
                                            k.receiver = f;
                                            k.transceiver = {
                                                receiver: f
                                            };
                                            k.streams = [d];
                                            a.setTimeout(function() {
                                                c.dispatchEvent(k);
                                                if ("function" === typeof c.ontrack) c.ontrack(k)
                                            })
                                        }
                                    })
                                }
                            });
                            a.setTimeout(function() {
                                c && c.transceivers && c.transceivers.forEach(function(a) {
                                    a.iceTransport && "new" === a.iceTransport.state && 0 < a.iceTransport.getRemoteCandidates().length && (console.warn("Timeout for addRemoteCandidate. Consider sending an end-of-candidates notification"), a.iceTransport.addRemoteCandidate({}))
                                })
                            }, 4E3);
                            return new Promise(function(a) {
                                1 < e.length && "function" ===
                                    typeof e[1] && e[1].apply(null);
                                a()
                            })
                        };
                        e.prototype.close = function() {
                            this.transceivers.forEach(function(a) {
                                a.iceTransport && a.iceTransport.stop();
                                a.dtlsTransport && a.dtlsTransport.stop();
                                a.rtpSender && a.rtpSender.stop();
                                a.rtpReceiver && a.rtpReceiver.stop()
                            });
                            this._updateSignalingState("closed")
                        };
                        e.prototype._updateSignalingState = function(a) {
                            this.signalingState = a;
                            a = new Event("signalingstatechange");
                            this.dispatchEvent(a);
                            if ("function" === typeof this.onsignalingstatechange) this.onsignalingstatechange(a)
                        };
                        e.prototype._maybeFireNegotiationNeeded =
                            function() {
                                var b = this;
                                "stable" === this.signalingState && !0 !== this.needNegotiation && (this.needNegotiation = !0, a.setTimeout(function() {
                                    if (!1 !== b.needNegotiation) {
                                        b.needNegotiation = !1;
                                        var a = new Event("negotiationneeded");
                                        b.dispatchEvent(a);
                                        if ("function" === typeof b.onnegotiationneeded) b.onnegotiationneeded(a)
                                    }
                                }, 0))
                            };
                        e.prototype._updateConnectionState = function() {
                            var a = {
                                "new": 0,
                                closed: 0,
                                connecting: 0,
                                checking: 0,
                                connected: 0,
                                completed: 0,
                                disconnected: 0,
                                failed: 0
                            };
                            this.transceivers.forEach(function(b) {
                                a[b.iceTransport.state]++;
                                a[b.dtlsTransport.state]++
                            });
                            a.connected += a.completed;
                            var b = "new";
                            if (0 < a.failed) b = "failed";
                            else if (0 < a.connecting || 0 < a.checking) b = "connecting";
                            else if (0 < a.disconnected) b = "disconnected";
                            else if (0 < a.new) b = "new";
                            else if (0 < a.connected || 0 < a.completed) b = "connected";
                            if (b !== this.iceConnectionState && (this.iceConnectionState = b, b = new Event("iceconnectionstatechange"), this.dispatchEvent(b), "function" === typeof this.oniceconnectionstatechange)) this.oniceconnectionstatechange(b)
                        };
                        e.prototype.createOffer = function() {
                            var b =
                                this,
                                c = arguments,
                                e;
                            1 === arguments.length && "function" !== typeof arguments[0] ? e = arguments[0] : 3 === arguments.length && (e = arguments[2]);
                            var k = this.transceivers.filter(function(a) {
                                    return "audio" === a.kind
                                }).length,
                                h = this.transceivers.filter(function(a) {
                                    return "video" === a.kind
                                }).length;
                            if (e) {
                                if (e.mandatory || e.optional) throw new TypeError("Legacy mandatory/optional constraints not supported.");
                                void 0 !== e.offerToReceiveAudio && (k = !0 === e.offerToReceiveAudio ? 1 : !1 === e.offerToReceiveAudio ? 0 : e.offerToReceiveAudio);
                                void 0 !==
                                    e.offerToReceiveVideo && (h = !0 === e.offerToReceiveVideo ? 1 : !1 === e.offerToReceiveVideo ? 0 : e.offerToReceiveVideo)
                            }
                            for (this.transceivers.forEach(function(a) {
                                    "audio" === a.kind ? (k--, 0 > k && (a.wantReceive = !1)) : "video" === a.kind && (h--, 0 > h && (a.wantReceive = !1))
                                }); 0 < k || 0 < h;) 0 < k && (this._createTransceiver("audio"), k--), 0 < h && (this._createTransceiver("video"), h--);
                            var n = p.writeSessionBoilerplate(this._sdpSessionId, this._sdpSessionVersion++);
                            this.transceivers.forEach(function(c, e) {
                                var f = c.track,
                                    k = c.kind,
                                    l = p.generateIdentifier();
                                c.mid = l;
                                c.iceGatherer || (c.iceGatherer = b._createIceGatherer(e, b.usingBundle));
                                l = a.RTCRtpSender.getCapabilities(k);
                                15019 > d && (l.codecs = l.codecs.filter(function(a) {
                                    return "rtx" !== a.name
                                }));
                                l.codecs.forEach(function(a) {
                                    "H264" === a.name && void 0 === a.parameters["level-asymmetry-allowed"] && (a.parameters["level-asymmetry-allowed"] = "1")
                                });
                                e = c.sendEncodingParameters || [{
                                    ssrc: 1001 * (2 * e + 1)
                                }];
                                f && 15019 <= d && "video" === k && !e[0].rtx && (e[0].rtx = {
                                    ssrc: e[0].ssrc + 1
                                });
                                c.wantReceive && (c.rtpReceiver = new a.RTCRtpReceiver(c.dtlsTransport,
                                    k));
                                c.localCapabilities = l;
                                c.sendEncodingParameters = e
                            });
                            "max-compat" !== this._config.bundlePolicy && (n += "a\x3dgroup:BUNDLE " + this.transceivers.map(function(a) {
                                return a.mid
                            }).join(" ") + "\r\n");
                            n += "a\x3dice-options:trickle\r\n";
                            this.transceivers.forEach(function(a, c) {
                                n += f(a, a.localCapabilities, "offer", a.stream, b._dtlsRole);
                                n += "a\x3drtcp-rsize\r\n";
                                !a.iceGatherer || "new" === b.iceGatheringState || 0 !== c && b.usingBundle || (a.iceGatherer.getLocalCandidates().forEach(function(a) {
                                    a.component = 1;
                                    n += "a\x3d" + p.writeCandidate(a) +
                                        "\r\n"
                                }), "completed" === a.iceGatherer.state && (n += "a\x3dend-of-candidates\r\n"))
                            });
                            var t = new a.RTCSessionDescription({
                                type: "offer",
                                sdp: n
                            });
                            return new Promise(function(a) {
                                0 < c.length && "function" === typeof c[0] ? (c[0].apply(null, [t]), a()) : a(t)
                            })
                        };
                        e.prototype.createAnswer = function() {
                            var b = this,
                                e = arguments,
                                k = p.writeSessionBoilerplate(this._sdpSessionId, this._sdpSessionVersion++);
                            this.usingBundle && (k += "a\x3dgroup:BUNDLE " + this.transceivers.map(function(a) {
                                return a.mid
                            }).join(" ") + "\r\n");
                            var h = p.splitSections(this.remoteDescription.sdp).length -
                                1;
                            this.transceivers.forEach(function(a, e) {
                                if (!(e + 1 > h))
                                    if (a.isDatachannel) k += "m\x3dapplication 0 DTLS/SCTP 5000\r\nc\x3dIN IP4 0.0.0.0\r\na\x3dmid:" + a.mid + "\r\n";
                                    else {
                                        if (a.stream) {
                                            var l;
                                            "audio" === a.kind ? l = a.stream.getAudioTracks()[0] : "video" === a.kind && (l = a.stream.getVideoTracks()[0]);
                                            l && 15019 <= d && "video" === a.kind && !a.sendEncodingParameters[0].rtx && (a.sendEncodingParameters[0].rtx = {
                                                ssrc: a.sendEncodingParameters[0].ssrc + 1
                                            })
                                        }
                                        e = c(a.localCapabilities, a.remoteCapabilities);
                                        !e.codecs.filter(function(a) {
                                            return "rtx" ===
                                                a.name.toLowerCase()
                                        }).length && a.sendEncodingParameters[0].rtx && delete a.sendEncodingParameters[0].rtx;
                                        k += f(a, e, "answer", a.stream, b._dtlsRole);
                                        a.rtcpParameters && a.rtcpParameters.reducedSize && (k += "a\x3drtcp-rsize\r\n")
                                    }
                            });
                            var n = new a.RTCSessionDescription({
                                type: "answer",
                                sdp: k
                            });
                            return new Promise(function(a) {
                                0 < e.length && "function" === typeof e[0] ? (e[0].apply(null, [n]), a()) : a(n)
                            })
                        };
                        e.prototype.addIceCandidate = function(a) {
                            var b;
                            if (a && "" !== a.candidate)
                                if (void 0 !== a.sdpMLineIndex || a.sdpMid)
                                    if (this.remoteDescription) {
                                        var c =
                                            a.sdpMLineIndex;
                                        if (a.sdpMid)
                                            for (b = 0; b < this.transceivers.length; b++)
                                                if (this.transceivers[b].mid === a.sdpMid) {
                                                    c = b;
                                                    break
                                                }
                                        if (b = this.transceivers[c]) {
                                            if (b.isDatachannel) return Promise.resolve();
                                            var d = 0 < Object.keys(a.candidate).length ? p.parseCandidate(a.candidate) : {};
                                            if ("tcp" === d.protocol && (0 === d.port || 9 === d.port) || d.component && 1 !== d.component) return Promise.resolve();
                                            if ((0 === c || 0 < c && b.iceTransport !== this.transceivers[0].iceTransport) && !n(b.iceTransport, d)) {
                                                var e = Error("Can not add ICE candidate");
                                                e.name =
                                                    "OperationError"
                                            }
                                            if (!e) {
                                                var f = a.candidate.trim();
                                                0 === f.indexOf("a\x3d") && (f = f.substr(2));
                                                b = p.splitSections(this.remoteDescription.sdp);
                                                b[c + 1] += "a\x3d" + (d.type ? f : "end-of-candidates") + "\r\n";
                                                this.remoteDescription.sdp = b.join("")
                                            }
                                        } else e = Error("Can not add ICE candidate"), e.name = "OperationError"
                                    } else e = Error("Can not add ICE candidate without a remote description"), e.name = "InvalidStateError";
                            else throw new TypeError("sdpMLineIndex or sdpMid required");
                            else
                                for (c = 0; c < this.transceivers.length && (this.transceivers[c].isDatachannel ||
                                        (this.transceivers[c].iceTransport.addRemoteCandidate({}), b = p.splitSections(this.remoteDescription.sdp), b[c + 1] += "a\x3dend-of-candidates\r\n", this.remoteDescription.sdp = b.join(""), !this.usingBundle)); c++);
                            var k = arguments;
                            return new Promise(function(a, b) {
                                e ? (2 < k.length && "function" === typeof k[2] && k[2].apply(null, [e]), b(e)) : (1 < k.length && "function" === typeof k[1] && k[1].apply(null), a())
                            })
                        };
                        e.prototype.getStats = function() {
                            var a = [];
                            this.transceivers.forEach(function(b) {
                                ["rtpSender", "rtpReceiver", "iceGatherer",
                                    "iceTransport", "dtlsTransport"
                                ].forEach(function(c) {
                                    b[c] && a.push(b[c].getStats())
                                })
                            });
                            var b = 1 < arguments.length && "function" === typeof arguments[1] && arguments[1];
                            return new Promise(function(c) {
                                var d = new Map;
                                Promise.all(a).then(function(a) {
                                    a.forEach(function(a) {
                                        Object.keys(a).forEach(function(b) {
                                            var c = a[b];
                                            a[b].type = {
                                                inboundrtp: "inbound-rtp",
                                                outboundrtp: "outbound-rtp",
                                                candidatepair: "candidate-pair",
                                                localcandidate: "local-candidate",
                                                remotecandidate: "remote-candidate"
                                            }[c.type] || c.type;
                                            d.set(b, a[b])
                                        })
                                    });
                                    b && b.apply(null, d);
                                    c(d)
                                })
                            })
                        };
                        return e
                    }
                }, {
                    sdp: 2
                }],
                2: [function(d, a, e) {
                    var f = {
                        generateIdentifier: function() {
                            return Math.random().toString(36).substr(2, 10)
                        }
                    };
                    f.localCName = f.generateIdentifier();
                    f.splitLines = function(a) {
                        return a.trim().split("\n").map(function(a) {
                            return a.trim()
                        })
                    };
                    f.splitSections = function(a) {
                        return a.split("\nm\x3d").map(function(a, b) {
                            return (0 < b ? "m\x3d" + a : a).trim() + "\r\n"
                        })
                    };
                    f.matchPrefix = function(a, c) {
                        return f.splitLines(a).filter(function(a) {
                            return 0 === a.indexOf(c)
                        })
                    };
                    f.parseCandidate =
                        function(a) {
                            a = 0 === a.indexOf("a\x3dcandidate:") ? a.substring(12).split(" ") : a.substring(10).split(" ");
                            for (var b = {
                                    foundation: a[0],
                                    component: parseInt(a[1], 10),
                                    protocol: a[2].toLowerCase(),
                                    priority: parseInt(a[3], 10),
                                    ip: a[4],
                                    port: parseInt(a[5], 10),
                                    type: a[7]
                                }, d = 8; d < a.length; d += 2) switch (a[d]) {
                                case "raddr":
                                    b.relatedAddress = a[d + 1];
                                    break;
                                case "rport":
                                    b.relatedPort = parseInt(a[d + 1], 10);
                                    break;
                                case "tcptype":
                                    b.tcpType = a[d + 1];
                                    break;
                                case "ufrag":
                                    b.ufrag = a[d + 1];
                                    b.usernameFragment = a[d + 1];
                                    break;
                                default:
                                    b[a[d]] = a[d + 1]
                            }
                            return b
                        };
                    f.writeCandidate = function(a) {
                        var b = [];
                        b.push(a.foundation);
                        b.push(a.component);
                        b.push(a.protocol.toUpperCase());
                        b.push(a.priority);
                        b.push(a.ip);
                        b.push(a.port);
                        var d = a.type;
                        b.push("typ");
                        b.push(d);
                        "host" !== d && a.relatedAddress && a.relatedPort && (b.push("raddr"), b.push(a.relatedAddress), b.push("rport"), b.push(a.relatedPort));
                        a.tcpType && "tcp" === a.protocol.toLowerCase() && (b.push("tcptype"), b.push(a.tcpType));
                        a.ufrag && (b.push("ufrag"), b.push(a.ufrag));
                        return "candidate:" + b.join(" ")
                    };
                    f.parseIceOptions = function(a) {
                        return a.substr(14).split(" ")
                    };
                    f.parseRtpMap = function(a) {
                        a = a.substr(9).split(" ");
                        var b = {
                            payloadType: parseInt(a.shift(), 10)
                        };
                        a = a[0].split("/");
                        b.name = a[0];
                        b.clockRate = parseInt(a[1], 10);
                        b.numChannels = 3 === a.length ? parseInt(a[2], 10) : 1;
                        return b
                    };
                    f.writeRtpMap = function(a) {
                        var b = a.payloadType;
                        void 0 !== a.preferredPayloadType && (b = a.preferredPayloadType);
                        return "a\x3drtpmap:" + b + " " + a.name + "/" + a.clockRate + (1 !== a.numChannels ? "/" + a.numChannels : "") + "\r\n"
                    };
                    f.parseExtmap = function(a) {
                        a = a.substr(9).split(" ");
                        return {
                            id: parseInt(a[0], 10),
                            direction: 0 <
                                a[0].indexOf("/") ? a[0].split("/")[1] : "sendrecv",
                            uri: a[1]
                        }
                    };
                    f.writeExtmap = function(a) {
                        return "a\x3dextmap:" + (a.id || a.preferredId) + (a.direction && "sendrecv" !== a.direction ? "/" + a.direction : "") + " " + a.uri + "\r\n"
                    };
                    f.parseFmtp = function(a) {
                        for (var b = {}, d = a.substr(a.indexOf(" ") + 1).split(";"), e = 0; e < d.length; e++) a = d[e].trim().split("\x3d"), b[a[0].trim()] = a[1];
                        return b
                    };
                    f.writeFmtp = function(a) {
                        var b = "",
                            d = a.payloadType;
                        void 0 !== a.preferredPayloadType && (d = a.preferredPayloadType);
                        if (a.parameters && Object.keys(a.parameters).length) {
                            var e = [];
                            Object.keys(a.parameters).forEach(function(b) {
                                e.push(b + "\x3d" + a.parameters[b])
                            });
                            b += "a\x3dfmtp:" + d + " " + e.join(";") + "\r\n"
                        }
                        return b
                    };
                    f.parseRtcpFb = function(a) {
                        a = a.substr(a.indexOf(" ") + 1).split(" ");
                        return {
                            type: a.shift(),
                            parameter: a.join(" ")
                        }
                    };
                    f.writeRtcpFb = function(a) {
                        var b = "",
                            d = a.payloadType;
                        void 0 !== a.preferredPayloadType && (d = a.preferredPayloadType);
                        a.rtcpFeedback && a.rtcpFeedback.length && a.rtcpFeedback.forEach(function(a) {
                            b += "a\x3drtcp-fb:" + d + " " + a.type + (a.parameter && a.parameter.length ? " " +
                                a.parameter : "") + "\r\n"
                        });
                        return b
                    };
                    f.parseSsrcMedia = function(a) {
                        var b = a.indexOf(" "),
                            d = {
                                ssrc: parseInt(a.substr(7, b - 7), 10)
                            },
                            e = a.indexOf(":", b); - 1 < e ? (d.attribute = a.substr(b + 1, e - b - 1), d.value = a.substr(e + 1)) : d.attribute = a.substr(b + 1);
                        return d
                    };
                    f.getMid = function(a) {
                        if (a = f.matchPrefix(a, "a\x3dmid:")[0]) return a.substr(6)
                    };
                    f.parseFingerprint = function(a) {
                        a = a.substr(14).split(" ");
                        return {
                            algorithm: a[0].toLowerCase(),
                            value: a[1]
                        }
                    };
                    f.getDtlsParameters = function(a, c) {
                        return {
                            role: "auto",
                            fingerprints: f.matchPrefix(a +
                                c, "a\x3dfingerprint:").map(f.parseFingerprint)
                        }
                    };
                    f.writeDtlsParameters = function(a, c) {
                        var b = "a\x3dsetup:" + c + "\r\n";
                        a.fingerprints.forEach(function(a) {
                            b += "a\x3dfingerprint:" + a.algorithm + " " + a.value + "\r\n"
                        });
                        return b
                    };
                    f.getIceParameters = function(a, c) {
                        a = f.splitLines(a);
                        a = a.concat(f.splitLines(c));
                        return {
                            usernameFragment: a.filter(function(a) {
                                return 0 === a.indexOf("a\x3dice-ufrag:")
                            })[0].substr(12),
                            password: a.filter(function(a) {
                                return 0 === a.indexOf("a\x3dice-pwd:")
                            })[0].substr(10)
                        }
                    };
                    f.writeIceParameters =
                        function(a) {
                            return "a\x3dice-ufrag:" + a.usernameFragment + "\r\na\x3dice-pwd:" + a.password + "\r\n"
                        };
                    f.parseRtpParameters = function(a) {
                        for (var b = {
                                codecs: [],
                                headerExtensions: [],
                                fecMechanisms: [],
                                rtcp: []
                            }, d = f.splitLines(a)[0].split(" "), e = 3; e < d.length; e++) {
                            var k = d[e],
                                h = f.matchPrefix(a, "a\x3drtpmap:" + k + " ")[0];
                            if (h) {
                                h = f.parseRtpMap(h);
                                var m = f.matchPrefix(a, "a\x3dfmtp:" + k + " ");
                                h.parameters = m.length ? f.parseFmtp(m[0]) : {};
                                h.rtcpFeedback = f.matchPrefix(a, "a\x3drtcp-fb:" + k + " ").map(f.parseRtcpFb);
                                b.codecs.push(h);
                                switch (h.name.toUpperCase()) {
                                    case "RED":
                                    case "ULPFEC":
                                        b.fecMechanisms.push(h.name.toUpperCase())
                                }
                            }
                        }
                        f.matchPrefix(a,
                            "a\x3dextmap:").forEach(function(a) {
                            b.headerExtensions.push(f.parseExtmap(a))
                        });
                        return b
                    };
                    f.writeRtpDescription = function(a, c) {
                        var b = "";
                        b += "m\x3d" + a + " ";
                        b += 0 < c.codecs.length ? "9" : "0";
                        b += " UDP/TLS/RTP/SAVPF ";
                        b += c.codecs.map(function(a) {
                            return void 0 !== a.preferredPayloadType ? a.preferredPayloadType : a.payloadType
                        }).join(" ") + "\r\n";
                        b += "c\x3dIN IP4 0.0.0.0\r\n";
                        b += "a\x3drtcp:9 IN IP4 0.0.0.0\r\n";
                        c.codecs.forEach(function(a) {
                            b += f.writeRtpMap(a);
                            b += f.writeFmtp(a);
                            b += f.writeRtcpFb(a)
                        });
                        var d = 0;
                        c.codecs.forEach(function(a) {
                            a.maxptime >
                                d && (d = a.maxptime)
                        });
                        0 < d && (b += "a\x3dmaxptime:" + d + "\r\n");
                        b += "a\x3drtcp-mux\r\n";
                        c.headerExtensions.forEach(function(a) {
                            b += f.writeExtmap(a)
                        });
                        return b
                    };
                    f.parseRtpEncodingParameters = function(a) {
                        var b = [],
                            d = f.parseRtpParameters(a),
                            e = -1 !== d.fecMechanisms.indexOf("RED"),
                            k = -1 !== d.fecMechanisms.indexOf("ULPFEC"),
                            h = f.matchPrefix(a, "a\x3dssrc:").map(function(a) {
                                return f.parseSsrcMedia(a)
                            }).filter(function(a) {
                                return "cname" === a.attribute
                            }),
                            m = 0 < h.length && h[0].ssrc,
                            r;
                        h = f.matchPrefix(a, "a\x3dssrc-group:FID").map(function(a) {
                            a =
                                a.split(" ");
                            a.shift();
                            return a.map(function(a) {
                                return parseInt(a, 10)
                            })
                        });
                        0 < h.length && 1 < h[0].length && h[0][0] === m && (r = h[0][1]);
                        d.codecs.forEach(function(a) {
                            "RTX" === a.name.toUpperCase() && a.parameters.apt && (a = {
                                ssrc: m,
                                codecPayloadType: parseInt(a.parameters.apt, 10),
                                rtx: {
                                    ssrc: r
                                }
                            }, b.push(a), e && (a = JSON.parse(JSON.stringify(a)), a.fec = {
                                ssrc: r,
                                mechanism: k ? "red+ulpfec" : "red"
                            }, b.push(a)))
                        });
                        0 === b.length && m && b.push({
                            ssrc: m
                        });
                        var l = f.matchPrefix(a, "b\x3d");
                        l.length && (l = 0 === l[0].indexOf("b\x3dTIAS:") ? parseInt(l[0].substr(7),
                            10) : 0 === l[0].indexOf("b\x3dAS:") ? 950 * parseInt(l[0].substr(5), 10) - 16E3 : void 0, b.forEach(function(a) {
                            a.maxBitrate = l
                        }));
                        return b
                    };
                    f.parseRtcpParameters = function(a) {
                        var b = {},
                            d = f.matchPrefix(a, "a\x3dssrc:").map(function(a) {
                                return f.parseSsrcMedia(a)
                            }).filter(function(a) {
                                return "cname" === a.attribute
                            })[0];
                        d && (b.cname = d.value, b.ssrc = d.ssrc);
                        d = f.matchPrefix(a, "a\x3drtcp-rsize");
                        b.reducedSize = 0 < d.length;
                        b.compound = 0 === d.length;
                        a = f.matchPrefix(a, "a\x3drtcp-mux");
                        b.mux = 0 < a.length;
                        return b
                    };
                    f.parseMsid = function(a) {
                        var b =
                            f.matchPrefix(a, "a\x3dmsid:");
                        if (1 === b.length) return a = b[0].substr(7).split(" "), {
                            stream: a[0],
                            track: a[1]
                        };
                        a = f.matchPrefix(a, "a\x3dssrc:").map(function(a) {
                            return f.parseSsrcMedia(a)
                        }).filter(function(a) {
                            return "msid" === a.attribute
                        });
                        if (0 < a.length) return a = a[0].value.split(" "), {
                            stream: a[0],
                            track: a[1]
                        }
                    };
                    f.generateSessionId = function() {
                        return Math.random().toString().substr(2, 21)
                    };
                    f.writeSessionBoilerplate = function(a, c) {
                        c = void 0 !== c ? c : 2;
                        return "v\x3d0\r\no\x3dthisisadapterortc " + (a ? a : f.generateSessionId()) +
                            " " + c + " IN IP4 127.0.0.1\r\ns\x3d-\r\nt\x3d0 0\r\n"
                    };
                    f.writeMediaSection = function(a, c, d, e) {
                        c = f.writeRtpDescription(a.kind, c);
                        c += f.writeIceParameters(a.iceGatherer.getLocalParameters());
                        c += f.writeDtlsParameters(a.dtlsTransport.getLocalParameters(), "offer" === d ? "actpass" : "active");
                        c += "a\x3dmid:" + a.mid + "\r\n";
                        c = a.direction ? c + ("a\x3d" + a.direction + "\r\n") : a.rtpSender && a.rtpReceiver ? c + "a\x3dsendrecv\r\n" : a.rtpSender ? c + "a\x3dsendonly\r\n" : a.rtpReceiver ? c + "a\x3drecvonly\r\n" : c + "a\x3dinactive\r\n";
                        a.rtpSender &&
                            (d = "msid:" + e.id + " " + a.rtpSender.track.id + "\r\n", c = c + ("a\x3d" + d) + ("a\x3dssrc:" + a.sendEncodingParameters[0].ssrc + " " + d), a.sendEncodingParameters[0].rtx && (c += "a\x3dssrc:" + a.sendEncodingParameters[0].rtx.ssrc + " " + d, c += "a\x3dssrc-group:FID " + a.sendEncodingParameters[0].ssrc + " " + a.sendEncodingParameters[0].rtx.ssrc + "\r\n"));
                        c += "a\x3dssrc:" + a.sendEncodingParameters[0].ssrc + " cname:" + f.localCName + "\r\n";
                        a.rtpSender && a.sendEncodingParameters[0].rtx && (c += "a\x3dssrc:" + a.sendEncodingParameters[0].rtx.ssrc + " cname:" +
                            f.localCName + "\r\n");
                        return c
                    };
                    f.getDirection = function(a, c) {
                        a = f.splitLines(a);
                        for (var b = 0; b < a.length; b++) switch (a[b]) {
                            case "a\x3dsendrecv":
                            case "a\x3dsendonly":
                            case "a\x3drecvonly":
                            case "a\x3dinactive":
                                return a[b].substr(2)
                        }
                        return c ? f.getDirection(c) : "sendrecv"
                    };
                    f.getKind = function(a) {
                        return f.splitLines(a)[0].split(" ")[0].substr(2)
                    };
                    f.isRejected = function(a) {
                        return "0" === a.split(" ", 2)[1]
                    };
                    f.parseMLine = function(a) {
                        a = f.splitLines(a)[0].split(" ");
                        return {
                            kind: a[0].substr(2),
                            port: parseInt(a[1], 10),
                            protocol: a[2],
                            fmt: a.slice(3).join(" ")
                        }
                    };
                    "object" === typeof a && (a.exports = f)
                }, {}],
                3: [function(d, a, e) {
                    e = "undefined" !== typeof f ? f : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {};
                    d = d("./adapter_factory.js");
                    a.exports = d({
                        window: e.window
                    })
                }, {
                    "./adapter_factory.js": 4
                }],
                4: [function(d, a, e) {
                    var f = d("./utils");
                    a.exports = function(a, c) {
                        a = a && a.window;
                        var b = {
                            shimChrome: !0,
                            shimFirefox: !0,
                            shimEdge: !0,
                            shimSafari: !0
                        };
                        for (e in c) hasOwnProperty.call(c, e) && (b[e] = c[e]);
                        c = f.log;
                        var e = f.detectBrowser(a);
                        var h = {
                                browserDetails: e,
                                extractVersion: f.extractVersion,
                                disableLog: f.disableLog,
                                disableWarnings: f.disableWarnings
                            },
                            k = d("./chrome/chrome_shim") || null,
                            m = d("./edge/edge_shim") || null,
                            r = d("./firefox/firefox_shim") || null,
                            l = d("./safari/safari_shim") || null,
                            u = d("./common_shim") || null;
                        switch (e.browser) {
                            case "chrome":
                                if (!k || !k.shimPeerConnection || !b.shimChrome) {
                                    c("Chrome shim is not included in this adapter release.");
                                    break
                                }
                                c("adapter.js shimming chrome.");
                                h.browserShim = k;
                                u.shimCreateObjectURL(a);
                                k.shimGetUserMedia(a);
                                k.shimMediaStream(a);
                                k.shimSourceObject(a);
                                k.shimPeerConnection(a);
                                k.shimOnTrack(a);
                                k.shimAddTrackRemoveTrack(a);
                                k.shimGetSendersWithDtmf(a);
                                u.shimRTCIceCandidate(a);
                                break;
                            case "firefox":
                                if (!r || !r.shimPeerConnection || !b.shimFirefox) {
                                    c("Firefox shim is not included in this adapter release.");
                                    break
                                }
                                c("adapter.js shimming firefox.");
                                h.browserShim = r;
                                u.shimCreateObjectURL(a);
                                r.shimGetUserMedia(a);
                                r.shimSourceObject(a);
                                r.shimPeerConnection(a);
                                r.shimOnTrack(a);
                                u.shimRTCIceCandidate(a);
                                break;
                            case "edge":
                                if (!m || !m.shimPeerConnection ||
                                    !b.shimEdge) {
                                    c("MS edge shim is not included in this adapter release.");
                                    break
                                }
                                c("adapter.js shimming edge.");
                                h.browserShim = m;
                                u.shimCreateObjectURL(a);
                                m.shimGetUserMedia(a);
                                m.shimPeerConnection(a);
                                m.shimReplaceTrack(a);
                                break;
                            case "safari":
                                if (!l || !b.shimSafari) {
                                    c("Safari shim is not included in this adapter release.");
                                    break
                                }
                                c("adapter.js shimming safari.");
                                h.browserShim = l;
                                u.shimCreateObjectURL(a);
                                l.shimRTCIceServerUrls(a);
                                l.shimCallbacksAPI(a);
                                l.shimLocalStreamsAPI(a);
                                l.shimRemoteStreamsAPI(a);
                                l.shimTrackEventTransceiver(a);
                                l.shimGetUserMedia(a);
                                l.shimCreateOfferLegacy(a);
                                u.shimRTCIceCandidate(a);
                                break;
                            default:
                                c("Unsupported browser!")
                        }
                        return h
                    }
                }, {
                    "./chrome/chrome_shim": 5,
                    "./common_shim": 7,
                    "./edge/edge_shim": 8,
                    "./firefox/firefox_shim": 10,
                    "./safari/safari_shim": 12,
                    "./utils": 13
                }],
                5: [function(d, a, e) {
                    var f = d("../utils.js"),
                        b = f.log;
                    a.exports = {
                        shimMediaStream: function(a) {
                            a.MediaStream = a.MediaStream || a.webkitMediaStream
                        },
                        shimOnTrack: function(a) {
                            if ("object" === typeof a && a.RTCPeerConnection && !("ontrack" in a.RTCPeerConnection.prototype)) {
                                Object.defineProperty(a.RTCPeerConnection.prototype,
                                    "ontrack", {
                                        get: function() {
                                            return this._ontrack
                                        },
                                        set: function(a) {
                                            this._ontrack && this.removeEventListener("track", this._ontrack);
                                            this.addEventListener("track", this._ontrack = a)
                                        }
                                    });
                                var b = a.RTCPeerConnection.prototype.setRemoteDescription;
                                a.RTCPeerConnection.prototype.setRemoteDescription = function() {
                                    var c = this;
                                    c._ontrackpoly || (c._ontrackpoly = function(b) {
                                        b.stream.addEventListener("addtrack", function(d) {
                                            var e = a.RTCPeerConnection.prototype.getReceivers ? c.getReceivers().find(function(a) {
                                                return a.track && a.track.id ===
                                                    d.track.id
                                            }) : {
                                                track: d.track
                                            };
                                            var f = new Event("track");
                                            f.track = d.track;
                                            f.receiver = e;
                                            f.transceiver = {
                                                receiver: e
                                            };
                                            f.streams = [b.stream];
                                            c.dispatchEvent(f)
                                        });
                                        b.stream.getTracks().forEach(function(d) {
                                            var e = a.RTCPeerConnection.prototype.getReceivers ? c.getReceivers().find(function(a) {
                                                return a.track && a.track.id === d.id
                                            }) : {
                                                track: d
                                            };
                                            var f = new Event("track");
                                            f.track = d;
                                            f.receiver = e;
                                            f.transceiver = {
                                                receiver: e
                                            };
                                            f.streams = [b.stream];
                                            c.dispatchEvent(f)
                                        })
                                    }, c.addEventListener("addstream", c._ontrackpoly));
                                    return b.apply(c,
                                        arguments)
                                }
                            }
                        },
                        shimAddTrackRemoveTrack: function(a) {
                            function b(a, b) {
                                var c = b.sdp;
                                Object.keys(a._reverseStreams || []).forEach(function(b) {
                                    b = a._reverseStreams[b];
                                    c = c.replace(new RegExp(a._streams[b.id].id, "g"), b.id)
                                });
                                return new RTCSessionDescription({
                                    type: b.type,
                                    sdp: c
                                })
                            }

                            function c(a, b) {
                                var c = b.sdp;
                                Object.keys(a._reverseStreams || []).forEach(function(b) {
                                    b = a._reverseStreams[b];
                                    c = c.replace(new RegExp(b.id, "g"), a._streams[b.id].id)
                                });
                                return new RTCSessionDescription({
                                    type: b.type,
                                    sdp: c
                                })
                            }
                            var d = f.detectBrowser(a);
                            if (!(a.RTCPeerConnection.prototype.addTrack && 63 <= d.version)) {
                                var e = a.RTCPeerConnection.prototype.getLocalStreams;
                                a.RTCPeerConnection.prototype.getLocalStreams = function() {
                                    var a = this,
                                        b = e.apply(this);
                                    a._reverseStreams = a._reverseStreams || {};
                                    return b.map(function(b) {
                                        return a._reverseStreams[b.id]
                                    })
                                };
                                var h = a.RTCPeerConnection.prototype.addStream;
                                a.RTCPeerConnection.prototype.addStream = function(b) {
                                    var c = this;
                                    c._streams = c._streams || {};
                                    c._reverseStreams = c._reverseStreams || {};
                                    b.getTracks().forEach(function(a) {
                                        if (c.getSenders().find(function(b) {
                                                return b.track ===
                                                    a
                                            })) throw new DOMException("Track already exists.", "InvalidAccessError");
                                    });
                                    if (!c._reverseStreams[b.id]) {
                                        var d = new a.MediaStream(b.getTracks());
                                        c._streams[b.id] = d;
                                        c._reverseStreams[d.id] = b;
                                        b = d
                                    }
                                    h.apply(c, [b])
                                };
                                var k = a.RTCPeerConnection.prototype.removeStream;
                                a.RTCPeerConnection.prototype.removeStream = function(a) {
                                    this._streams = this._streams || {};
                                    this._reverseStreams = this._reverseStreams || {};
                                    k.apply(this, [this._streams[a.id] || a]);
                                    delete this._reverseStreams[this._streams[a.id] ? this._streams[a.id].id :
                                        a.id];
                                    delete this._streams[a.id]
                                };
                                a.RTCPeerConnection.prototype.addTrack = function(b, c) {
                                    var d = this;
                                    if ("closed" === d.signalingState) throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
                                    var e = [].slice.call(arguments, 1);
                                    if (1 !== e.length || !e[0].getTracks().find(function(a) {
                                            return a === b
                                        })) throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
                                    if (d.getSenders().find(function(a) {
                                            return a.track ===
                                                b
                                        })) throw new DOMException("Track already exists.", "InvalidAccessError");
                                    d._streams = d._streams || {};
                                    d._reverseStreams = d._reverseStreams || {};
                                    (e = d._streams[c.id]) ? (e.addTrack(b), Promise.resolve().then(function() {
                                        d.dispatchEvent(new Event("negotiationneeded"))
                                    })) : (e = new a.MediaStream([b]), d._streams[c.id] = e, d._reverseStreams[e.id] = c, d.addStream(e));
                                    return d.getSenders().find(function(a) {
                                        return a.track === b
                                    })
                                };
                                ["createOffer", "createAnswer"].forEach(function(c) {
                                    var d = a.RTCPeerConnection.prototype[c];
                                    a.RTCPeerConnection.prototype[c] =
                                        function() {
                                            var a = this,
                                                c = arguments;
                                            return arguments.length && "function" === typeof arguments[0] ? d.apply(a, [function(d) {
                                                d = b(a, d);
                                                c[0].apply(null, [d])
                                            }, function(a) {
                                                c[1] && c[1].apply(null, a)
                                            }, arguments[2]]) : d.apply(a, arguments).then(function(c) {
                                                return b(a, c)
                                            })
                                        }
                                });
                                var l = a.RTCPeerConnection.prototype.setLocalDescription;
                                a.RTCPeerConnection.prototype.setLocalDescription = function() {
                                    if (!arguments.length || !arguments[0].type) return l.apply(this, arguments);
                                    arguments[0] = c(this, arguments[0]);
                                    return l.apply(this, arguments)
                                };
                                var m = Object.getOwnPropertyDescriptor(a.RTCPeerConnection.prototype, "localDescription");
                                Object.defineProperty(a.RTCPeerConnection.prototype, "localDescription", {
                                    get: function() {
                                        var a = m.get.apply(this);
                                        return "" === a.type ? a : b(this, a)
                                    }
                                });
                                a.RTCPeerConnection.prototype.removeTrack = function(a) {
                                    var b = this;
                                    if ("closed" === b.signalingState) throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
                                    if (!a._pc) throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.",
                                        "TypeError");
                                    if (a._pc !== b) throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
                                    b._streams = b._streams || {};
                                    var c;
                                    Object.keys(b._streams).forEach(function(d) {
                                        b._streams[d].getTracks().find(function(b) {
                                            return a.track === b
                                        }) && (c = b._streams[d])
                                    });
                                    c && (1 === c.getTracks().length ? b.removeStream(b._reverseStreams[c.id]) : c.removeTrack(a.track), b.dispatchEvent(new Event("negotiationneeded")))
                                }
                            }
                        },
                        shimGetSendersWithDtmf: function(a) {
                            if ("object" === typeof a && a.RTCPeerConnection &&
                                !("getSenders" in a.RTCPeerConnection.prototype) && "createDTMFSender" in a.RTCPeerConnection.prototype) {
                                var b = function(a, b) {
                                    return {
                                        track: b,
                                        get dtmf() {
                                            void 0 === this._dtmf && (this._dtmf = "audio" === b.kind ? a.createDTMFSender(b) : null);
                                            return this._dtmf
                                        },
                                        _pc: a
                                    }
                                };
                                if (!a.RTCPeerConnection.prototype.getSenders) {
                                    a.RTCPeerConnection.prototype.getSenders = function() {
                                        this._senders = this._senders || [];
                                        return this._senders.slice()
                                    };
                                    var c = a.RTCPeerConnection.prototype.addTrack;
                                    a.RTCPeerConnection.prototype.addTrack = function(a,
                                        d) {
                                        var e = c.apply(this, arguments);
                                        e || (e = b(this, a), this._senders.push(e));
                                        return e
                                    };
                                    var d = a.RTCPeerConnection.prototype.removeTrack;
                                    a.RTCPeerConnection.prototype.removeTrack = function(a) {
                                        d.apply(this, arguments);
                                        var b = this._senders.indexOf(a); - 1 !== b && this._senders.splice(b, 1)
                                    }
                                }
                                var e = a.RTCPeerConnection.prototype.addStream;
                                a.RTCPeerConnection.prototype.addStream = function(a) {
                                    var c = this;
                                    c._senders = c._senders || [];
                                    e.apply(c, [a]);
                                    a.getTracks().forEach(function(a) {
                                        c._senders.push(b(c, a))
                                    })
                                };
                                var f = a.RTCPeerConnection.prototype.removeStream;
                                a.RTCPeerConnection.prototype.removeStream = function(a) {
                                    var b = this;
                                    b._senders = b._senders || [];
                                    f.apply(b, [a]);
                                    a.getTracks().forEach(function(a) {
                                        var c = b._senders.find(function(b) {
                                            return b.track === a
                                        });
                                        c && b._senders.splice(b._senders.indexOf(c), 1)
                                    })
                                }
                            } else if ("object" === typeof a && a.RTCPeerConnection && "getSenders" in a.RTCPeerConnection.prototype && "createDTMFSender" in a.RTCPeerConnection.prototype && a.RTCRtpSender && !("dtmf" in a.RTCRtpSender.prototype)) {
                                var h = a.RTCPeerConnection.prototype.getSenders;
                                a.RTCPeerConnection.prototype.getSenders =
                                    function() {
                                        var a = this,
                                            b = h.apply(a, []);
                                        b.forEach(function(b) {
                                            b._pc = a
                                        });
                                        return b
                                    };
                                Object.defineProperty(a.RTCRtpSender.prototype, "dtmf", {
                                    get: function() {
                                        void 0 === this._dtmf && (this._dtmf = "audio" === this.track.kind ? this._pc.createDTMFSender(this.track) : null);
                                        return this._dtmf
                                    }
                                })
                            }
                        },
                        shimSourceObject: function(a) {
                            var b = a && a.URL;
                            "object" === typeof a && (!a.HTMLMediaElement || "srcObject" in a.HTMLMediaElement.prototype || Object.defineProperty(a.HTMLMediaElement.prototype, "srcObject", {
                                get: function() {
                                    return this._srcObject
                                },
                                set: function(a) {
                                    var c = this;
                                    this._srcObject = a;
                                    this.src && b.revokeObjectURL(this.src);
                                    a ? (this.src = b.createObjectURL(a), a.addEventListener("addtrack", function() {
                                        c.src && b.revokeObjectURL(c.src);
                                        c.src = b.createObjectURL(a)
                                    }), a.addEventListener("removetrack", function() {
                                        c.src && b.revokeObjectURL(c.src);
                                        c.src = b.createObjectURL(a)
                                    })) : this.src = ""
                                }
                            }))
                        },
                        shimPeerConnection: function(a) {
                            var c = f.detectBrowser(a);
                            if (a.RTCPeerConnection) {
                                var d = a.RTCPeerConnection;
                                a.RTCPeerConnection = function(a, b) {
                                    if (a && a.iceServers) {
                                        for (var c = [], e = 0; e < a.iceServers.length; e++) {
                                            var h = a.iceServers[e];
                                            !h.hasOwnProperty("urls") && h.hasOwnProperty("url") ? (f.deprecated("RTCIceServer.url", "RTCIceServer.urls"), h = JSON.parse(JSON.stringify(h)), h.urls = h.url, c.push(h)) : c.push(a.iceServers[e])
                                        }
                                        a.iceServers = c
                                    }
                                    return new d(a, b)
                                };
                                a.RTCPeerConnection.prototype = d.prototype;
                                Object.defineProperty(a.RTCPeerConnection, "generateCertificate", {
                                    get: function() {
                                        return d.generateCertificate
                                    }
                                })
                            } else a.RTCPeerConnection = function(c, d) {
                                b("PeerConnection");
                                c && c.iceTransportPolicy &&
                                    (c.iceTransports = c.iceTransportPolicy);
                                return new a.webkitRTCPeerConnection(c, d)
                            }, a.RTCPeerConnection.prototype = a.webkitRTCPeerConnection.prototype, a.webkitRTCPeerConnection.generateCertificate && Object.defineProperty(a.RTCPeerConnection, "generateCertificate", {
                                get: function() {
                                    return a.webkitRTCPeerConnection.generateCertificate
                                }
                            });
                            var e = a.RTCPeerConnection.prototype.getStats;
                            a.RTCPeerConnection.prototype.getStats = function(a, b, c) {
                                var d = this,
                                    f = arguments;
                                if (0 < arguments.length && "function" === typeof a) return e.apply(this,
                                    arguments);
                                if (0 === e.length && (0 === arguments.length || "function" !== typeof arguments[0])) return e.apply(this, []);
                                var h = function(a) {
                                        var b = {};
                                        a.result().forEach(function(a) {
                                            var c = {
                                                id: a.id,
                                                timestamp: a.timestamp,
                                                type: {
                                                    localcandidate: "local-candidate",
                                                    remotecandidate: "remote-candidate"
                                                }[a.type] || a.type
                                            };
                                            a.names().forEach(function(b) {
                                                c[b] = a.stat(b)
                                            });
                                            b[c.id] = c
                                        });
                                        return b
                                    },
                                    k = function(a) {
                                        return new Map(Object.keys(a).map(function(b) {
                                            return [b, a[b]]
                                        }))
                                    };
                                return 2 <= arguments.length ? e.apply(this, [function(a) {
                                        f[1](k(h(a)))
                                    },
                                    arguments[0]
                                ]) : (new Promise(function(a, b) {
                                    e.apply(d, [function(b) {
                                        a(k(h(b)))
                                    }, b])
                                })).then(b, c)
                            };
                            51 > c.version && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(b) {
                                var c = a.RTCPeerConnection.prototype[b];
                                a.RTCPeerConnection.prototype[b] = function() {
                                    var a = arguments,
                                        b = this,
                                        d = new Promise(function(d, e) {
                                            c.apply(b, [a[0], d, e])
                                        });
                                    return 2 > a.length ? d : d.then(function() {
                                        a[1].apply(null, [])
                                    }, function(b) {
                                        3 <= a.length && a[2].apply(null, [b])
                                    })
                                }
                            });
                            52 > c.version && ["createOffer", "createAnswer"].forEach(function(b) {
                                var c =
                                    a.RTCPeerConnection.prototype[b];
                                a.RTCPeerConnection.prototype[b] = function() {
                                    var a = this;
                                    if (1 > arguments.length || 1 === arguments.length && "object" === typeof arguments[0]) {
                                        var b = 1 === arguments.length ? arguments[0] : void 0;
                                        return new Promise(function(d, e) {
                                            c.apply(a, [d, e, b])
                                        })
                                    }
                                    return c.apply(this, arguments)
                                }
                            });
                            ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(b) {
                                var c = a.RTCPeerConnection.prototype[b];
                                a.RTCPeerConnection.prototype[b] = function() {
                                    arguments[0] = new("addIceCandidate" ===
                                        b ? a.RTCIceCandidate : a.RTCSessionDescription)(arguments[0]);
                                    return c.apply(this, arguments)
                                }
                            });
                            var h = a.RTCPeerConnection.prototype.addIceCandidate;
                            a.RTCPeerConnection.prototype.addIceCandidate = function() {
                                return arguments[0] ? h.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve())
                            }
                        },
                        shimGetUserMedia: d("./getusermedia")
                    }
                }, {
                    "../utils.js": 13,
                    "./getusermedia": 6
                }],
                6: [function(d, a, e) {
                    var f = d("../utils.js"),
                        b = f.log;
                    a.exports = function(a) {
                        var c = f.detectBrowser(a),
                            d = a && a.navigator,
                            e =
                            function(a) {
                                if ("object" !== typeof a || a.mandatory || a.optional) return a;
                                var b = {};
                                Object.keys(a).forEach(function(c) {
                                    if ("require" !== c && "advanced" !== c && "mediaSource" !== c) {
                                        var d = "object" === typeof a[c] ? a[c] : {
                                            ideal: a[c]
                                        };
                                        void 0 !== d.exact && "number" === typeof d.exact && (d.min = d.max = d.exact);
                                        var e = function(a, b) {
                                            return a ? a + b.charAt(0).toUpperCase() + b.slice(1) : "deviceId" === b ? "sourceId" : b
                                        };
                                        if (void 0 !== d.ideal) {
                                            b.optional = b.optional || [];
                                            var f = {};
                                            "number" === typeof d.ideal ? (f[e("min", c)] = d.ideal, b.optional.push(f),
                                                f = {}, f[e("max", c)] = d.ideal) : f[e("", c)] = d.ideal;
                                            b.optional.push(f)
                                        }
                                        void 0 !== d.exact && "number" !== typeof d.exact ? (b.mandatory = b.mandatory || {}, b.mandatory[e("", c)] = d.exact) : ["min", "max"].forEach(function(a) {
                                            void 0 !== d[a] && (b.mandatory = b.mandatory || {}, b.mandatory[e(a, c)] = d[a])
                                        })
                                    }
                                });
                                a.advanced && (b.optional = (b.optional || []).concat(a.advanced));
                                return b
                            },
                            h = function(a, f) {
                                if ((a = JSON.parse(JSON.stringify(a))) && "object" === typeof a.audio) {
                                    var h = function(a, b, c) {
                                        b in a && !(c in a) && (a[c] = a[b], delete a[b])
                                    };
                                    a = JSON.parse(JSON.stringify(a));
                                    h(a.audio, "autoGainControl", "googAutoGainControl");
                                    h(a.audio, "noiseSuppression", "googNoiseSuppression");
                                    a.audio = e(a.audio)
                                }
                                if (a && "object" === typeof a.video) {
                                    var k = a.video.facingMode;
                                    k = k && ("object" === typeof k ? k : {
                                        ideal: k
                                    });
                                    h = 66 > c.version;
                                    if (!(!k || "user" !== k.exact && "environment" !== k.exact && "user" !== k.ideal && "environment" !== k.ideal || d.mediaDevices.getSupportedConstraints && d.mediaDevices.getSupportedConstraints().facingMode && !h)) {
                                        delete a.video.facingMode;
                                        if ("environment" === k.exact || "environment" === k.ideal) var l = ["back", "rear"];
                                        else if ("user" === k.exact || "user" === k.ideal) l = ["front"];
                                        if (l) return d.mediaDevices.enumerateDevices().then(function(c) {
                                            c = c.filter(function(a) {
                                                return "videoinput" === a.kind
                                            });
                                            var d = c.find(function(a) {
                                                return l.some(function(b) {
                                                    return -1 !== a.label.toLowerCase().indexOf(b)
                                                })
                                            });
                                            !d && c.length && -1 !== l.indexOf("back") && (d = c[c.length - 1]);
                                            d && (a.video.deviceId = k.exact ? {
                                                exact: d.deviceId
                                            } : {
                                                ideal: d.deviceId
                                            });
                                            a.video = e(a.video);
                                            b("chrome: " + JSON.stringify(a));
                                            return f(a)
                                        })
                                    }
                                    a.video = e(a.video)
                                }
                                b("chrome: " +
                                    JSON.stringify(a));
                                return f(a)
                            },
                            k = function(a) {
                                return {
                                    name: {
                                        PermissionDeniedError: "NotAllowedError",
                                        InvalidStateError: "NotReadableError",
                                        DevicesNotFoundError: "NotFoundError",
                                        ConstraintNotSatisfiedError: "OverconstrainedError",
                                        TrackStartError: "NotReadableError",
                                        MediaDeviceFailedDueToShutdown: "NotReadableError",
                                        MediaDeviceKillSwitchOn: "NotReadableError"
                                    }[a.name] || a.name,
                                    message: a.message,
                                    constraint: a.constraintName,
                                    toString: function() {
                                        return this.name + (this.message && ": ") + this.message
                                    }
                                }
                            };
                        d.getUserMedia =
                            function(a, b, c) {
                                h(a, function(a) {
                                    d.webkitGetUserMedia(a, b, function(a) {
                                        c && c(k(a))
                                    })
                                })
                            };
                        var m = function(a) {
                            return new Promise(function(b, c) {
                                d.getUserMedia(a, b, c)
                            })
                        };
                        d.mediaDevices || (d.mediaDevices = {
                            getUserMedia: m,
                            enumerateDevices: function() {
                                return new Promise(function(b) {
                                    var c = {
                                        audio: "audioinput",
                                        video: "videoinput"
                                    };
                                    return a.MediaStreamTrack.getSources(function(a) {
                                        b(a.map(function(a) {
                                            return {
                                                label: a.label,
                                                kind: c[a.kind],
                                                deviceId: a.id,
                                                groupId: ""
                                            }
                                        }))
                                    })
                                })
                            },
                            getSupportedConstraints: function() {
                                return {
                                    deviceId: !0,
                                    echoCancellation: !0,
                                    facingMode: !0,
                                    frameRate: !0,
                                    height: !0,
                                    width: !0
                                }
                            }
                        });
                        if (d.mediaDevices.getUserMedia) {
                            var l = d.mediaDevices.getUserMedia.bind(d.mediaDevices);
                            d.mediaDevices.getUserMedia = function(a) {
                                return h(a, function(a) {
                                    return l(a).then(function(b) {
                                        if (a.audio && !b.getAudioTracks().length || a.video && !b.getVideoTracks().length) throw b.getTracks().forEach(function(a) {
                                            a.stop()
                                        }), new DOMException("", "NotFoundError");
                                        return b
                                    }, function(a) {
                                        return Promise.reject(k(a))
                                    })
                                })
                            }
                        } else d.mediaDevices.getUserMedia =
                            function(a) {
                                return m(a)
                            };
                        "undefined" === typeof d.mediaDevices.addEventListener && (d.mediaDevices.addEventListener = function() {
                            b("Dummy mediaDevices.addEventListener called.")
                        });
                        "undefined" === typeof d.mediaDevices.removeEventListener && (d.mediaDevices.removeEventListener = function() {
                            b("Dummy mediaDevices.removeEventListener called.")
                        })
                    }
                }, {
                    "../utils.js": 13
                }],
                7: [function(d, a, e) {
                    function f(a, b, c) {
                        if (a.RTCPeerConnection) {
                            a = a.RTCPeerConnection.prototype;
                            var d = a.addEventListener;
                            a.addEventListener = function(a,
                                e) {
                                if (a !== b) return d.apply(this, arguments);
                                var f = function(a) {
                                    e(c(a))
                                };
                                this._eventMap = this._eventMap || {};
                                this._eventMap[e] = f;
                                return d.apply(this, [a, f])
                            };
                            var e = a.removeEventListener;
                            a.removeEventListener = function(a, c) {
                                if (a !== b || !this._eventMap || !this._eventMap[c]) return e.apply(this, arguments);
                                var d = this._eventMap[c];
                                delete this._eventMap[c];
                                return e.apply(this, [a, d])
                            };
                            Object.defineProperty(a, "on" + b, {
                                get: function() {
                                    return this["_on" + b]
                                },
                                set: function(a) {
                                    this["_on" + b] && (this.removeEventListener(b, this["_on" +
                                        b]), delete this["_on" + b]);
                                    a && this.addEventListener(b, this["_on" + b] = a)
                                }
                            })
                        }
                    }
                    var b = d("sdp"),
                        c = d("./utils");
                    a.exports = {
                        shimRTCIceCandidate: function(a) {
                            if (!(a.RTCIceCandidate && "foundation" in a.RTCIceCandidate.prototype)) {
                                var c = a.RTCIceCandidate;
                                a.RTCIceCandidate = function(a) {
                                    "object" === typeof a && a.candidate && 0 === a.candidate.indexOf("a\x3d") && (a = JSON.parse(JSON.stringify(a)), a.candidate = a.candidate.substr(2));
                                    var d = new c(a);
                                    a = b.parseCandidate(a.candidate);
                                    var e = Object.assign(d, a);
                                    e.toJSON = function() {
                                        return {
                                            candidate: e.candidate,
                                            sdpMid: e.sdpMid,
                                            sdpMLineIndex: e.sdpMLineIndex,
                                            usernameFragment: e.usernameFragment
                                        }
                                    };
                                    return e
                                };
                                f(a, "icecandidate", function(b) {
                                    b.candidate && Object.defineProperty(b, "candidate", {
                                        value: new a.RTCIceCandidate(b.candidate),
                                        writable: "false"
                                    });
                                    return b
                                })
                            }
                        },
                        shimCreateObjectURL: function(a) {
                            var b = a && a.URL;
                            if ("object" === typeof a && a.HTMLMediaElement && "srcObject" in a.HTMLMediaElement.prototype && b.createObjectURL && b.revokeObjectURL) {
                                var d = b.createObjectURL.bind(b),
                                    e = b.revokeObjectURL.bind(b),
                                    f = new Map,
                                    h = 0;
                                b.createObjectURL =
                                    function(a) {
                                        if ("getTracks" in a) {
                                            var b = "polyblob:" + ++h;
                                            f.set(b, a);
                                            c.deprecated("URL.createObjectURL(stream)", "elem.srcObject \x3d stream");
                                            return b
                                        }
                                        return d(a)
                                    };
                                b.revokeObjectURL = function(a) {
                                    e(a);
                                    f.delete(a)
                                };
                                var k = Object.getOwnPropertyDescriptor(a.HTMLMediaElement.prototype, "src");
                                Object.defineProperty(a.HTMLMediaElement.prototype, "src", {
                                    get: function() {
                                        return k.get.apply(this)
                                    },
                                    set: function(a) {
                                        this.srcObject = f.get(a) || null;
                                        return k.set.apply(this, [a])
                                    }
                                });
                                var m = a.HTMLMediaElement.prototype.setAttribute;
                                a.HTMLMediaElement.prototype.setAttribute = function() {
                                    2 === arguments.length && "src" === ("" + arguments[0]).toLowerCase() && (this.srcObject = f.get(arguments[1]) || null);
                                    return m.apply(this, arguments)
                                }
                            }
                        }
                    }
                }, {
                    "./utils": 13,
                    sdp: 2
                }],
                8: [function(d, a, e) {
                    var f = d("../utils"),
                        b = d("rtcpeerconnection-shim");
                    a.exports = {
                        shimGetUserMedia: d("./getusermedia"),
                        shimPeerConnection: function(a) {
                            var c = f.detectBrowser(a);
                            if (a.RTCIceGatherer && (a.RTCIceCandidate || (a.RTCIceCandidate = function(a) {
                                    return a
                                }), a.RTCSessionDescription || (a.RTCSessionDescription =
                                    function(a) {
                                        return a
                                    }), 15025 > c.version)) {
                                var d = Object.getOwnPropertyDescriptor(a.MediaStreamTrack.prototype, "enabled");
                                Object.defineProperty(a.MediaStreamTrack.prototype, "enabled", {
                                    set: function(a) {
                                        d.set.call(this, a);
                                        var b = new Event("enabled");
                                        b.enabled = a;
                                        this.dispatchEvent(b)
                                    }
                                })
                            }!a.RTCRtpSender || "dtmf" in a.RTCRtpSender.prototype || Object.defineProperty(a.RTCRtpSender.prototype, "dtmf", {
                                get: function() {
                                    void 0 === this._dtmf && ("audio" === this.track.kind ? this._dtmf = new a.RTCDtmfSender(this) : "video" === this.track.kind &&
                                        (this._dtmf = null));
                                    return this._dtmf
                                }
                            });
                            a.RTCPeerConnection = b(a, c.version)
                        },
                        shimReplaceTrack: function(a) {
                            !a.RTCRtpSender || "replaceTrack" in a.RTCRtpSender.prototype || (a.RTCRtpSender.prototype.replaceTrack = a.RTCRtpSender.prototype.setTrack)
                        }
                    }
                }, {
                    "../utils": 13,
                    "./getusermedia": 9,
                    "rtcpeerconnection-shim": 1
                }],
                9: [function(d, a, e) {
                    a.exports = function(a) {
                        a = a && a.navigator;
                        var b = function(a) {
                                return {
                                    name: {
                                        PermissionDeniedError: "NotAllowedError"
                                    }[a.name] || a.name,
                                    message: a.message,
                                    constraint: a.constraint,
                                    toString: function() {
                                        return this.name
                                    }
                                }
                            },
                            c = a.mediaDevices.getUserMedia.bind(a.mediaDevices);
                        a.mediaDevices.getUserMedia = function(a) {
                            return c(a).catch(function(a) {
                                return Promise.reject(b(a))
                            })
                        }
                    }
                }, {}],
                10: [function(d, a, e) {
                    var f = d("../utils");
                    a.exports = {
                        shimOnTrack: function(a) {
                            "object" !== typeof a || !a.RTCPeerConnection || "ontrack" in a.RTCPeerConnection.prototype || Object.defineProperty(a.RTCPeerConnection.prototype, "ontrack", {
                                get: function() {
                                    return this._ontrack
                                },
                                set: function(a) {
                                    this._ontrack && (this.removeEventListener("track", this._ontrack), this.removeEventListener("addstream",
                                        this._ontrackpoly));
                                    this.addEventListener("track", this._ontrack = a);
                                    this.addEventListener("addstream", this._ontrackpoly = function(a) {
                                        a.stream.getTracks().forEach(function(b) {
                                            var c = new Event("track");
                                            c.track = b;
                                            c.receiver = {
                                                track: b
                                            };
                                            c.transceiver = {
                                                receiver: c.receiver
                                            };
                                            c.streams = [a.stream];
                                            this.dispatchEvent(c)
                                        }.bind(this))
                                    }.bind(this))
                                }
                            });
                            "object" === typeof a && a.RTCTrackEvent && "receiver" in a.RTCTrackEvent.prototype && !("transceiver" in a.RTCTrackEvent.prototype) && Object.defineProperty(a.RTCTrackEvent.prototype,
                                "transceiver", {
                                    get: function() {
                                        return {
                                            receiver: this.receiver
                                        }
                                    }
                                })
                        },
                        shimSourceObject: function(a) {
                            "object" === typeof a && (!a.HTMLMediaElement || "srcObject" in a.HTMLMediaElement.prototype || Object.defineProperty(a.HTMLMediaElement.prototype, "srcObject", {
                                get: function() {
                                    return this.mozSrcObject
                                },
                                set: function(a) {
                                    this.mozSrcObject = a
                                }
                            }))
                        },
                        shimPeerConnection: function(a) {
                            var b = f.detectBrowser(a);
                            if ("object" === typeof a && (a.RTCPeerConnection || a.mozRTCPeerConnection)) {
                                a.RTCPeerConnection || (a.RTCPeerConnection = function(c,
                                    d) {
                                    if (38 > b.version && c && c.iceServers) {
                                        for (var e = [], f = 0; f < c.iceServers.length; f++) {
                                            var h = c.iceServers[f];
                                            if (h.hasOwnProperty("urls"))
                                                for (var k = 0; k < h.urls.length; k++) {
                                                    var n = {
                                                        url: h.urls[k]
                                                    };
                                                    0 === h.urls[k].indexOf("turn") && (n.username = h.username, n.credential = h.credential);
                                                    e.push(n)
                                                } else e.push(c.iceServers[f])
                                        }
                                        c.iceServers = e
                                    }
                                    return new a.mozRTCPeerConnection(c, d)
                                }, a.RTCPeerConnection.prototype = a.mozRTCPeerConnection.prototype, a.mozRTCPeerConnection.generateCertificate && Object.defineProperty(a.RTCPeerConnection,
                                    "generateCertificate", {
                                        get: function() {
                                            return a.mozRTCPeerConnection.generateCertificate
                                        }
                                    }), a.RTCSessionDescription = a.mozRTCSessionDescription, a.RTCIceCandidate = a.mozRTCIceCandidate);
                                ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(b) {
                                    var c = a.RTCPeerConnection.prototype[b];
                                    a.RTCPeerConnection.prototype[b] = function() {
                                        arguments[0] = new("addIceCandidate" === b ? a.RTCIceCandidate : a.RTCSessionDescription)(arguments[0]);
                                        return c.apply(this, arguments)
                                    }
                                });
                                var d = a.RTCPeerConnection.prototype.addIceCandidate;
                                a.RTCPeerConnection.prototype.addIceCandidate = function() {
                                    return arguments[0] ? d.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve())
                                };
                                var e = function(a) {
                                        var b = new Map;
                                        Object.keys(a).forEach(function(c) {
                                            b.set(c, a[c]);
                                            b[c] = a[c]
                                        });
                                        return b
                                    },
                                    h = {
                                        inboundrtp: "inbound-rtp",
                                        outboundrtp: "outbound-rtp",
                                        candidatepair: "candidate-pair",
                                        localcandidate: "local-candidate",
                                        remotecandidate: "remote-candidate"
                                    },
                                    k = a.RTCPeerConnection.prototype.getStats;
                                a.RTCPeerConnection.prototype.getStats = function(a,
                                    c, d) {
                                    return k.apply(this, [a || null]).then(function(a) {
                                        48 > b.version && (a = e(a));
                                        if (53 > b.version && !c) try {
                                            a.forEach(function(a) {
                                                a.type = h[a.type] || a.type
                                            })
                                        } catch (w) {
                                            if ("TypeError" !== w.name) throw w;
                                            a.forEach(function(b, c) {
                                                a.set(c, Object.assign({}, b, {
                                                    type: h[b.type] || b.type
                                                }))
                                            })
                                        }
                                        return a
                                    }).then(c, d)
                                }
                            }
                        },
                        shimGetUserMedia: d("./getusermedia")
                    }
                }, {
                    "../utils": 13,
                    "./getusermedia": 11
                }],
                11: [function(d, a, e) {
                    var f = d("../utils"),
                        b = f.log;
                    a.exports = function(a) {
                        var c = f.detectBrowser(a),
                            d = a && a.navigator;
                        a = a && a.MediaStreamTrack;
                        var e = function(a) {
                                return {
                                    name: {
                                        InternalError: "NotReadableError",
                                        NotSupportedError: "TypeError",
                                        PermissionDeniedError: "NotAllowedError",
                                        SecurityError: "NotAllowedError"
                                    }[a.name] || a.name,
                                    message: {
                                        "The operation is insecure.": "The request is not allowed by the user agent or the platform in the current context."
                                    }[a.message] || a.message,
                                    constraint: a.constraint,
                                    toString: function() {
                                        return this.name + (this.message && ": ") + this.message
                                    }
                                }
                            },
                            h = function(a, f, h) {
                                var k = function(a) {
                                    if ("object" !== typeof a || a.require) return a;
                                    var b = [];
                                    Object.keys(a).forEach(function(c) {
                                        if ("require" !== c && "advanced" !== c && "mediaSource" !== c) {
                                            var d = a[c] = "object" === typeof a[c] ? a[c] : {
                                                ideal: a[c]
                                            };
                                            void 0 === d.min && void 0 === d.max && void 0 === d.exact || b.push(c);
                                            void 0 !== d.exact && ("number" === typeof d.exact ? d.min = d.max = d.exact : a[c] = d.exact, delete d.exact);
                                            if (void 0 !== d.ideal) {
                                                a.advanced = a.advanced || [];
                                                var e = {};
                                                e[c] = "number" === typeof d.ideal ? {
                                                    min: d.ideal,
                                                    max: d.ideal
                                                } : d.ideal;
                                                a.advanced.push(e);
                                                delete d.ideal;
                                                Object.keys(d).length || delete a[c]
                                            }
                                        }
                                    });
                                    b.length &&
                                        (a.require = b);
                                    return a
                                };
                                a = JSON.parse(JSON.stringify(a));
                                38 > c.version && (b("spec: " + JSON.stringify(a)), a.audio && (a.audio = k(a.audio)), a.video && (a.video = k(a.video)), b("ff37: " + JSON.stringify(a)));
                                return d.mozGetUserMedia(a, f, function(a) {
                                    h(e(a))
                                })
                            },
                            k = function(a) {
                                return new Promise(function(b, c) {
                                    h(a, b, c)
                                })
                            };
                        d.mediaDevices || (d.mediaDevices = {
                            getUserMedia: k,
                            addEventListener: function() {},
                            removeEventListener: function() {}
                        });
                        d.mediaDevices.enumerateDevices = d.mediaDevices.enumerateDevices || function() {
                            return new Promise(function(a) {
                                a([{
                                    kind: "audioinput",
                                    deviceId: "default",
                                    label: "",
                                    groupId: ""
                                }, {
                                    kind: "videoinput",
                                    deviceId: "default",
                                    label: "",
                                    groupId: ""
                                }])
                            })
                        };
                        if (41 > c.version) {
                            var m = d.mediaDevices.enumerateDevices.bind(d.mediaDevices);
                            d.mediaDevices.enumerateDevices = function() {
                                return m().then(void 0, function(a) {
                                    if ("NotFoundError" === a.name) return [];
                                    throw a;
                                })
                            }
                        }
                        if (49 > c.version) {
                            var l = d.mediaDevices.getUserMedia.bind(d.mediaDevices);
                            d.mediaDevices.getUserMedia = function(a) {
                                return l(a).then(function(b) {
                                    if (a.audio && !b.getAudioTracks().length || a.video && !b.getVideoTracks().length) throw b.getTracks().forEach(function(a) {
                                            a.stop()
                                        }),
                                        new DOMException("The object can not be found here.", "NotFoundError");
                                    return b
                                }, function(a) {
                                    return Promise.reject(e(a))
                                })
                            }
                        }
                        if (!(55 < c.version && "autoGainControl" in d.mediaDevices.getSupportedConstraints())) {
                            var q = function(a, b, c) {
                                    b in a && !(c in a) && (a[c] = a[b], delete a[b])
                                },
                                w = d.mediaDevices.getUserMedia.bind(d.mediaDevices);
                            d.mediaDevices.getUserMedia = function(a) {
                                "object" === typeof a && "object" === typeof a.audio && (a = JSON.parse(JSON.stringify(a)), q(a.audio, "autoGainControl", "mozAutoGainControl"), q(a.audio,
                                    "noiseSuppression", "mozNoiseSuppression"));
                                return w(a)
                            };
                            if (a && a.prototype.getSettings) {
                                var x = a.prototype.getSettings;
                                a.prototype.getSettings = function() {
                                    var a = x.apply(this, arguments);
                                    q(a, "mozAutoGainControl", "autoGainControl");
                                    q(a, "mozNoiseSuppression", "noiseSuppression");
                                    return a
                                }
                            }
                            if (a && a.prototype.applyConstraints) {
                                var B = a.prototype.applyConstraints;
                                a.prototype.applyConstraints = function(a) {
                                    "audio" === this.kind && "object" === typeof a && (a = JSON.parse(JSON.stringify(a)), q(a, "autoGainControl", "mozAutoGainControl"),
                                        q(a, "noiseSuppression", "mozNoiseSuppression"));
                                    return B.apply(this, [a])
                                }
                            }
                        }
                        d.getUserMedia = function(a, b, e) {
                            if (44 > c.version) return h(a, b, e);
                            f.deprecated("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia");
                            d.mediaDevices.getUserMedia(a).then(b, e)
                        }
                    }
                }, {
                    "../utils": 13
                }],
                12: [function(d, a, e) {
                    var f = d("../utils");
                    a.exports = {
                        shimCallbacksAPI: function(a) {
                            if ("object" === typeof a && a.RTCPeerConnection) {
                                a = a.RTCPeerConnection.prototype;
                                var b = a.createOffer,
                                    d = a.createAnswer,
                                    e = a.setLocalDescription,
                                    f = a.setRemoteDescription,
                                    h = a.addIceCandidate;
                                a.createOffer = function(a, c) {
                                    var d = b.apply(this, [2 <= arguments.length ? arguments[2] : arguments[0]]);
                                    if (!c) return d;
                                    d.then(a, c);
                                    return Promise.resolve()
                                };
                                a.createAnswer = function(a, b) {
                                    var c = d.apply(this, [2 <= arguments.length ? arguments[2] : arguments[0]]);
                                    if (!b) return c;
                                    c.then(a, b);
                                    return Promise.resolve()
                                };
                                var k = function(a, b, c) {
                                    a = e.apply(this, [a]);
                                    if (!c) return a;
                                    a.then(b, c);
                                    return Promise.resolve()
                                };
                                a.setLocalDescription = k;
                                k = function(a, b, c) {
                                    a = f.apply(this, [a]);
                                    if (!c) return a;
                                    a.then(b, c);
                                    return Promise.resolve()
                                };
                                a.setRemoteDescription = k;
                                k = function(a, b, c) {
                                    a = h.apply(this, [a]);
                                    if (!c) return a;
                                    a.then(b, c);
                                    return Promise.resolve()
                                };
                                a.addIceCandidate = k
                            }
                        },
                        shimLocalStreamsAPI: function(a) {
                            if ("object" === typeof a && a.RTCPeerConnection) {
                                "getLocalStreams" in a.RTCPeerConnection.prototype || (a.RTCPeerConnection.prototype.getLocalStreams = function() {
                                    this._localStreams || (this._localStreams = []);
                                    return this._localStreams
                                });
                                "getStreamById" in a.RTCPeerConnection.prototype || (a.RTCPeerConnection.prototype.getStreamById =
                                    function(a) {
                                        var b = null;
                                        this._localStreams && this._localStreams.forEach(function(c) {
                                            c.id === a && (b = c)
                                        });
                                        this._remoteStreams && this._remoteStreams.forEach(function(c) {
                                            c.id === a && (b = c)
                                        });
                                        return b
                                    });
                                if (!("addStream" in a.RTCPeerConnection.prototype)) {
                                    var b = a.RTCPeerConnection.prototype.addTrack;
                                    a.RTCPeerConnection.prototype.addStream = function(a) {
                                        this._localStreams || (this._localStreams = []); - 1 === this._localStreams.indexOf(a) && this._localStreams.push(a);
                                        var c = this;
                                        a.getTracks().forEach(function(d) {
                                            b.call(c, d,
                                                a)
                                        })
                                    };
                                    a.RTCPeerConnection.prototype.addTrack = function(a, c) {
                                        c && (this._localStreams ? -1 === this._localStreams.indexOf(c) && this._localStreams.push(c) : this._localStreams = [c]);
                                        b.call(this, a, c)
                                    }
                                }
                                "removeStream" in a.RTCPeerConnection.prototype || (a.RTCPeerConnection.prototype.removeStream = function(a) {
                                    this._localStreams || (this._localStreams = []);
                                    var b = this._localStreams.indexOf(a);
                                    if (-1 !== b) {
                                        this._localStreams.splice(b, 1);
                                        var c = this,
                                            d = a.getTracks();
                                        this.getSenders().forEach(function(a) {
                                            -1 !== d.indexOf(a.track) &&
                                                c.removeTrack(a)
                                        })
                                    }
                                })
                            }
                        },
                        shimRemoteStreamsAPI: function(a) {
                            "object" === typeof a && a.RTCPeerConnection && ("getRemoteStreams" in a.RTCPeerConnection.prototype || (a.RTCPeerConnection.prototype.getRemoteStreams = function() {
                                return this._remoteStreams ? this._remoteStreams : []
                            }), "onaddstream" in a.RTCPeerConnection.prototype || Object.defineProperty(a.RTCPeerConnection.prototype, "onaddstream", {
                                get: function() {
                                    return this._onaddstream
                                },
                                set: function(a) {
                                    this._onaddstream && (this.removeEventListener("addstream", this._onaddstream),
                                        this.removeEventListener("track", this._onaddstreampoly));
                                    this.addEventListener("addstream", this._onaddstream = a);
                                    this.addEventListener("track", this._onaddstreampoly = function(a) {
                                        var b = a.streams[0];
                                        this._remoteStreams || (this._remoteStreams = []);
                                        0 <= this._remoteStreams.indexOf(b) || (this._remoteStreams.push(b), b = new Event("addstream"), b.stream = a.streams[0], this.dispatchEvent(b))
                                    }.bind(this))
                                }
                            }))
                        },
                        shimGetUserMedia: function(a) {
                            var b = a && a.navigator;
                            b.getUserMedia || (b.webkitGetUserMedia ? b.getUserMedia = b.webkitGetUserMedia.bind(b) :
                                b.mediaDevices && b.mediaDevices.getUserMedia && (b.getUserMedia = function(a, c, d) {
                                    b.mediaDevices.getUserMedia(a).then(c, d)
                                }.bind(b)))
                        },
                        shimRTCIceServerUrls: function(a) {
                            var b = a.RTCPeerConnection;
                            a.RTCPeerConnection = function(a, c) {
                                if (a && a.iceServers) {
                                    for (var d = [], e = 0; e < a.iceServers.length; e++) {
                                        var h = a.iceServers[e];
                                        !h.hasOwnProperty("urls") && h.hasOwnProperty("url") ? (f.deprecated("RTCIceServer.url", "RTCIceServer.urls"), h = JSON.parse(JSON.stringify(h)), h.urls = h.url, delete h.url, d.push(h)) : d.push(a.iceServers[e])
                                    }
                                    a.iceServers =
                                        d
                                }
                                return new b(a, c)
                            };
                            a.RTCPeerConnection.prototype = b.prototype;
                            "generateCertificate" in a.RTCPeerConnection && Object.defineProperty(a.RTCPeerConnection, "generateCertificate", {
                                get: function() {
                                    return b.generateCertificate
                                }
                            })
                        },
                        shimTrackEventTransceiver: function(a) {
                            "object" === typeof a && a.RTCPeerConnection && "receiver" in a.RTCTrackEvent.prototype && !a.RTCTransceiver && Object.defineProperty(a.RTCTrackEvent.prototype, "transceiver", {
                                get: function() {
                                    return {
                                        receiver: this.receiver
                                    }
                                }
                            })
                        },
                        shimCreateOfferLegacy: function(a) {
                            var b =
                                a.RTCPeerConnection.prototype.createOffer;
                            a.RTCPeerConnection.prototype.createOffer = function(a) {
                                if (a) {
                                    var c = this.getTransceivers().find(function(a) {
                                        return a.sender.track && "audio" === a.sender.track.kind
                                    });
                                    !1 === a.offerToReceiveAudio && c ? "sendrecv" === c.direction ? c.setDirection("sendonly") : "recvonly" === c.direction && c.setDirection("inactive") : !0 !== a.offerToReceiveAudio || c || this.addTransceiver("audio");
                                    c = this.getTransceivers().find(function(a) {
                                        return a.sender.track && "video" === a.sender.track.kind
                                    });
                                    !1 === a.offerToReceiveVideo &&
                                        c ? "sendrecv" === c.direction ? c.setDirection("sendonly") : "recvonly" === c.direction && c.setDirection("inactive") : !0 !== a.offerToReceiveVideo || c || this.addTransceiver("video")
                                }
                                return b.apply(this, arguments)
                            }
                        }
                    }
                }, {
                    "../utils": 13
                }],
                13: [function(d, a, e) {
                    var f = !0,
                        b = !0;
                    d = {
                        disableLog: function(a) {
                            return "boolean" !== typeof a ? Error("Argument type: " + typeof a + ". Please use a boolean.") : (f = a) ? "adapter.js logging disabled" : "adapter.js logging enabled"
                        },
                        disableWarnings: function(a) {
                            if ("boolean" !== typeof a) return Error("Argument type: " +
                                typeof a + ". Please use a boolean.");
                            b = !a;
                            return "adapter.js deprecation warnings " + (a ? "disabled" : "enabled")
                        },
                        log: function() {
                            "object" !== typeof window || f || "undefined" !== typeof console && "function" === typeof console.log && console.log.apply(console, arguments)
                        },
                        deprecated: function(a, d) {
                            b && console.warn(a + " is deprecated, please use " + d + " instead.")
                        },
                        extractVersion: function(a, b, d) {
                            return (a = a.match(b)) && a.length >= d && parseInt(a[d], 10)
                        },
                        detectBrowser: function(a) {
                            var b = a && a.navigator,
                                c = {
                                    browser: null,
                                    version: null
                                };
                            if ("undefined" === typeof a || !a.navigator) return c.browser = "Not a browser.", c;
                            b.mozGetUserMedia ? (c.browser = "firefox", c.version = this.extractVersion(b.userAgent, /Firefox\/(\d+)\./, 1)) : b.webkitGetUserMedia ? a.webkitRTCPeerConnection ? (c.browser = "chrome", c.version = this.extractVersion(b.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)) : b.userAgent.match(/Version\/(\d+).(\d+)/) ? (c.browser = "safari", c.version = this.extractVersion(b.userAgent, /AppleWebKit\/(\d+)\./, 1)) : c.browser = "Unsupported webkit-based browser with GUM support but no WebRTC support." :
                                b.mediaDevices && b.userAgent.match(/Edge\/(\d+).(\d+)$/) ? (c.browser = "edge", c.version = this.extractVersion(b.userAgent, /Edge\/(\d+).(\d+)$/, 2)) : b.mediaDevices && b.userAgent.match(/AppleWebKit\/(\d+)\./) ? (c.browser = "safari", c.version = this.extractVersion(b.userAgent, /AppleWebKit\/(\d+)\./, 1)) : c.browser = "Not a supported browser.";
                            return c
                        }
                    };
                    a.exports = {
                        log: d.log,
                        deprecated: d.deprecated,
                        disableLog: d.disableLog,
                        disableWarnings: d.disableWarnings,
                        extractVersion: d.extractVersion,
                        shimCreateObjectURL: d.shimCreateObjectURL,
                        detectBrowser: d.detectBrowser.bind(d)
                    }
                }, {}]
            }, {}, [3])(3)
        }()
    }).call(q, h(23))
}, function(m, q, h) {
    h(48)(h(49))
}, function(m, q) {
    m.exports = function(h) {
        function f(f) {
            "undefined" !== typeof console && (console.error || console.log)("[Script Loader]", f)
        }
        try {
            "undefined" !== typeof execScript && "undefined" !== typeof attachEvent && "undefined" === typeof addEventListener ? execScript(h) : "undefined" !== typeof eval ? eval.call(null, h) : f("EvalError: No eval function available")
        } catch (g) {
            f(g)
        }
    }
}, function(m, q) {
    m.exports = "/* globals $$, jQuery, Elements, document, window, L */\n\n/**\n* Copyright 2013 Marc J. Schmidt. See the LICENSE file at the top-level\n* directory of this distribution and at\n* https://github.com/marcj/css-element-queries/blob/master/LICENSE.\n*/\nthis.L \x3d this.L || {};\n\n/**\n * @param {HTMLElement} element\n * @param {String}      prop\n * @returns {String|Number}\n */\nL.GetComputedStyle \x3d (computedElement, prop) \x3d\x3e {\n  if (computedElement.currentStyle) {\n    return computedElement.currentStyle[prop];\n  } else if (window.getComputedStyle) {\n    return window.getComputedStyle(computedElement, null).getPropertyValue(prop);\n  }\n  return computedElement.style[prop];\n};\n\n  /**\n   *\n   * @type {Function}\n   * @constructor\n   */\nL.ElementQueries \x3d function ElementQueries() {\n      /**\n       *\n       * @param element\n       * @returns {Number}\n       */\n  function getEmSize(element \x3d document.documentElement) {\n    const fontSize \x3d L.GetComputedStyle(element, 'fontSize');\n    return parseFloat(fontSize) || 16;\n  }\n\n      /**\n       *\n       * @copyright https://github.com/Mr0grog/element-query/blob/master/LICENSE\n       *\n       * @param element\n       * @param value\n       * @param units\n       * @returns {*}\n       */\n  function convertToPx(element, originalValue) {\n    let vh;\n    let vw;\n    let chooser;\n    const units \x3d originalValue.replace(/[0-9]*/, '');\n    const value \x3d parseFloat(originalValue);\n    switch (units) {\n      case 'px':\n        return value;\n      case 'em':\n        return value * getEmSize(element);\n      case 'rem':\n        return value * getEmSize();\n              // Viewport units!\n              // According to http://quirksmode.org/mobile/tableViewport.html\n              // documentElement.clientWidth/Height gets us the most reliable info\n      case 'vw':\n        return (value * document.documentElement.clientWidth) / 100;\n      case 'vh':\n        return (value * document.documentElement.clientHeight) / 100;\n      case 'vmin':\n      case 'vmax':\n        vw \x3d document.documentElement.clientWidth / 100;\n        vh \x3d document.documentElement.clientHeight / 100;\n        chooser \x3d Math[units \x3d\x3d\x3d 'vmin' ? 'min' : 'max'];\n        return value * chooser(vw, vh);\n      default:\n        return value;\n              // for now, not supporting physical units (since they are just a set number of px)\n              // or ex/ch (getting accurate measurements is hard)\n    }\n  }\n\n      /**\n       *\n       * @param {HTMLElement} element\n       * @constructor\n       */\n  function SetupInformation(element) {\n    this.element \x3d element;\n    this.options \x3d [];\n    let i;\n    let j;\n    let option;\n    let width \x3d 0;\n    let height \x3d 0;\n    let value;\n    let actualValue;\n    let attrValues;\n    let attrValue;\n    let attrName;\n\n          /**\n           * @param option {mode: 'min|max', property: 'width|height', value: '123px'}\n           */\n    this.addOption \x3d (newOption) \x3d\x3e {\n      this.options.push(newOption);\n    };\n\n    const attributes \x3d ['min-width', 'min-height', 'max-width', 'max-height'];\n\n          /**\n           * Extracts the computed width/height and sets to min/max- attribute.\n           */\n    this.call \x3d () \x3d\x3e {\n              // extract current dimensions\n      width \x3d this.element.offsetWidth;\n      height \x3d this.element.offsetHeight;\n\n      attrValues \x3d {};\n\n      for (i \x3d 0, j \x3d this.options.length; i \x3c j; i +\x3d 1) {\n        option \x3d this.options[i];\n        value \x3d convertToPx(this.element, option.value);\n\n        actualValue \x3d option.property \x3d\x3d\x3d 'width' ? width : height;\n        attrName \x3d `${option.mode}-${option.property}`;\n        attrValue \x3d '';\n\n        if (option.mode \x3d\x3d\x3d 'min' \x26\x26 actualValue \x3e\x3d value) {\n          attrValue +\x3d option.value;\n        }\n\n        if (option.mode \x3d\x3d\x3d 'max' \x26\x26 actualValue \x3c\x3d value) {\n          attrValue +\x3d option.value;\n        }\n\n        if (!attrValues[attrName]) attrValues[attrName] \x3d '';\n        if (attrValue \x26\x26 (` ${attrValues[attrName]} `)\n                                            .indexOf(` ${attrValue} `) \x3d\x3d\x3d -1) {\n          attrValues[attrName] +\x3d ` ${attrValue}`;\n        }\n      }\n\n      for (let k \x3d 0; k \x3c attributes.length; k +\x3d 1) {\n        if (attrValues[attributes[k]]) {\n          this.element.setAttribute(attributes[k],\n                                                attrValues[attributes[k]].substr(1));\n        } else {\n          this.element.removeAttribute(attributes[k]);\n        }\n      }\n    };\n  }\n\n      /**\n       * @param {HTMLElement} element\n       * @param {Object}      options\n       */\n  function setupElement(originalElement, options) {\n    const element \x3d originalElement;\n    if (element.elementQueriesSetupInformation) {\n      element.elementQueriesSetupInformation.addOption(options);\n    } else {\n      element.elementQueriesSetupInformation \x3d new SetupInformation(element);\n      element.elementQueriesSetupInformation.addOption(options);\n      element.sensor \x3d new L.ResizeSensor(element, () \x3d\x3e {\n        element.elementQueriesSetupInformation.call();\n      });\n    }\n    element.elementQueriesSetupInformation.call();\n    return element;\n  }\n\n      /**\n       * @param {String} selector\n       * @param {String} mode min|max\n       * @param {String} property width|height\n       * @param {String} value\n       */\n  function queueQuery(selector, mode, property, value) {\n    let query;\n    if (document.querySelectorAll) query \x3d document.querySelectorAll.bind(document);\n    if (!query \x26\x26 typeof $$ !\x3d\x3d 'undefined') query \x3d $$;\n    if (!query \x26\x26 typeof jQuery !\x3d\x3d 'undefined') query \x3d jQuery;\n\n    if (!query) {\n      throw new Error('No document.querySelectorAll, jQuery or Mootools\\'s $$ found.');\n    }\n\n    const elements \x3d query(selector) || [];\n    for (let i \x3d 0, j \x3d elements.length; i \x3c j; i +\x3d 1) {\n      elements[i] \x3d setupElement(elements[i], {\n        mode,\n        property,\n        value,\n      });\n    }\n  }\n\n  const regex \x3d /,?([^,\\n]*)\\[[\\s\\t]*(min|max)-(width|height)[\\s\\t]*[~$^]?\x3d[\\s\\t]*\"([^\"]*)\"[\\s\\t]*]([^\\n\\s{]*)/mgi;  // jshint ignore:line\n\n      /**\n       * @param {String} css\n       */\n  function extractQuery(originalCss) {\n    let match;\n    const css \x3d originalCss.replace(/'/g, '\"');\n    while ((match \x3d regex.exec(css)) !\x3d\x3d null) {\n      if (match.length \x3e 5) {\n        queueQuery(match[1] || match[5], match[2], match[3], match[4]);\n      }\n    }\n  }\n\n      /**\n       * @param {CssRule[]|String} rules\n       */\n  function readRules(originalRules) {\n    if (!originalRules) {\n      return;\n    }\n    let selector \x3d '';\n    let rules \x3d originalRules;\n    if (typeof originalRules \x3d\x3d\x3d 'string') {\n      rules \x3d originalRules.toLowerCase();\n      if (rules.indexOf('min-width') !\x3d\x3d -1 || rules.indexOf('max-width') !\x3d\x3d -1) {\n        extractQuery(rules);\n      }\n    } else {\n      for (let i \x3d 0, j \x3d rules.length; i \x3c j; i +\x3d 1) {\n        if (rules[i].type \x3d\x3d\x3d 1) {\n          selector \x3d rules[i].selectorText || rules[i].cssText;\n          if (selector.indexOf('min-height') !\x3d\x3d -1 ||\n                          selector.indexOf('max-height') !\x3d\x3d -1) {\n            extractQuery(selector);\n          } else if (selector.indexOf('min-width') !\x3d\x3d -1 ||\n                                 selector.indexOf('max-width') !\x3d\x3d -1) {\n            extractQuery(selector);\n          }\n        } else if (rules[i].type \x3d\x3d\x3d 4) {\n          readRules(rules[i].cssRules || rules[i].rules);\n        }\n      }\n    }\n  }\n\n      /**\n       * Searches all css rules and setups the event listener\n       * to all elements with element query rules..\n       */\n  this.init \x3d () \x3d\x3e {\n    const styleSheets \x3d document.styleSheets || [];\n    for (let i \x3d 0, j \x3d styleSheets.length; i \x3c j; i +\x3d 1) {\n      readRules(styleSheets[i].cssText ||\n                        styleSheets[i].cssRules ||\n                        styleSheets[i].rules);\n    }\n  };\n};\n\nfunction init() {\n  (new L.ElementQueries()).init();\n}\n\nif (window.addEventListener) {\n  window.addEventListener('load', init, false);\n} else {\n  window.attachEvent('onload', init);\n}\n\n  /**\n   * Iterate over each of the provided element(s).\n   *\n   * @param {HTMLElement|HTMLElement[]} elements\n   * @param {Function}                  callback\n   */\nfunction forEachElement(elements, callback \x3d () \x3d\x3e {}) {\n  const elementsType \x3d Object.prototype.toString.call(elements);\n  const isCollectionTyped \x3d (elementsType \x3d\x3d\x3d '[object Array]' ||\n          (elementsType \x3d\x3d\x3d '[object NodeList]') ||\n          (elementsType \x3d\x3d\x3d '[object HTMLCollection]') ||\n          (typeof jQuery !\x3d\x3d 'undefined' \x26\x26 elements instanceof jQuery) || // jquery\n          (typeof Elements !\x3d\x3d 'undefined' \x26\x26 elements instanceof Elements) // mootools\n      );\n  let i \x3d 0;\n  const j \x3d elements.length;\n  if (isCollectionTyped) {\n    for (; i \x3c j; i +\x3d 1) {\n      callback(elements[i]);\n    }\n  } else {\n    callback(elements);\n  }\n}\n  /**\n   * Class for dimension change detection.\n   *\n   * @param {Element|Element[]|Elements|jQuery} element\n   * @param {Function} callback\n   *\n   * @constructor\n   */\nL.ResizeSensor \x3d function ResizeSensor(element, callback \x3d () \x3d\x3e {}) {\n      /**\n       *\n       * @constructor\n       */\n  function EventQueue() {\n    let q \x3d [];\n    this.add \x3d (ev) \x3d\x3e {\n      q.push(ev);\n    };\n\n    let i;\n    let j;\n    this.call \x3d () \x3d\x3e {\n      for (i \x3d 0, j \x3d q.length; i \x3c j; i +\x3d 1) {\n        q[i].call();\n      }\n    };\n\n    this.remove \x3d (ev) \x3d\x3e {\n      const newQueue \x3d [];\n      for (i \x3d 0, j \x3d q.length; i \x3c j; i +\x3d 1) {\n        if (q[i] !\x3d\x3d ev) newQueue.push(q[i]);\n      }\n      q \x3d newQueue;\n    };\n\n    this.length \x3d () \x3d\x3e q.length;\n  }\n\n      /**\n       *\n       * @param {HTMLElement} element\n       * @param {Function}    resized\n       */\n  function attachResizeEvent(htmlElement, resized) {\n    // Only used for the dirty checking, so the event callback count is limted\n    //  to max 1 call per fps per sensor.\n    // In combination with the event based resize sensor this saves cpu time,\n    // because the sensor is too fast and\n    // would generate too many unnecessary events.\n    const customRequestAnimationFrame \x3d window.requestAnimationFrame ||\n    window.mozRequestAnimationFrame ||\n    window.webkitRequestAnimationFrame ||\n    function delay(fn) {\n      return window.setTimeout(fn, 20);\n    };\n\n    const newElement \x3d htmlElement;\n    if (!newElement.resizedAttached) {\n      newElement.resizedAttached \x3d new EventQueue();\n      newElement.resizedAttached.add(resized);\n    } else if (newElement.resizedAttached) {\n      newElement.resizedAttached.add(resized);\n      return;\n    }\n\n    newElement.resizeSensor \x3d document.createElement('div');\n    newElement.resizeSensor.className \x3d 'resize-sensor';\n    const style \x3d 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; ' +\n                      'overflow: hidden; z-index: -1; visibility: hidden;';\n    const styleChild \x3d 'position: absolute; left: 0; top: 0; transition: 0s;';\n\n    newElement.resizeSensor.style.cssText \x3d style;\n    newElement.resizeSensor.innerHTML \x3d\n              `\x3cdiv class\x3d\"resize-sensor-expand\" style\x3d\"${style}\"\x3e` +\n                  `\x3cdiv style\x3d\"${styleChild}\"\x3e\x3c/div\x3e` +\n              '\x3c/div\x3e' +\n              `\x3cdiv class\x3d\"resize-sensor-shrink\" style\x3d\"${style}\"\x3e` +\n                  `\x3cdiv style\x3d\"${styleChild} width: 200%; height: 200%\"\x3e\x3c/div\x3e` +\n              '\x3c/div\x3e';\n    newElement.appendChild(newElement.resizeSensor);\n\n    if (L.GetComputedStyle(newElement, 'position') \x3d\x3d\x3d 'static') {\n      newElement.style.position \x3d 'relative';\n    }\n\n    const expand \x3d newElement.resizeSensor.childNodes[0];\n    const expandChild \x3d expand.childNodes[0];\n    const shrink \x3d newElement.resizeSensor.childNodes[1];\n\n    const reset \x3d () \x3d\x3e {\n      expandChild.style.width \x3d `${100000}px`;\n      expandChild.style.height \x3d `${100000}px`;\n\n      expand.scrollLeft \x3d 100000;\n      expand.scrollTop \x3d 100000;\n\n      shrink.scrollLeft \x3d 100000;\n      shrink.scrollTop \x3d 100000;\n    };\n\n    reset();\n    let dirty \x3d false;\n\n    const dirtyChecking \x3d () \x3d\x3e {\n      if (!newElement.resizedAttached) return;\n\n      if (dirty) {\n        newElement.resizedAttached.call();\n        dirty \x3d false;\n      }\n\n      customRequestAnimationFrame(dirtyChecking);\n    };\n\n    customRequestAnimationFrame(dirtyChecking);\n    let lastWidth;\n    let lastHeight;\n    let cachedWidth;\n    let cachedHeight; // useful to not query offsetWidth twice\n\n    const onScroll \x3d () \x3d\x3e {\n      if ((cachedWidth \x3d newElement.offsetWidth) !\x3d\x3d lastWidth ||\n                (cachedHeight \x3d newElement.offsetHeight) !\x3d\x3d lastHeight) {\n        dirty \x3d true;\n\n        lastWidth \x3d cachedWidth;\n        lastHeight \x3d cachedHeight;\n      }\n      reset();\n    };\n\n    const addEvent \x3d (el, name, cb) \x3d\x3e {\n      if (el.attachEvent) {\n        el.attachEvent(`on${name}`, cb);\n      } else {\n        el.addEventListener(name, cb);\n      }\n    };\n\n    addEvent(expand, 'scroll', onScroll);\n    addEvent(shrink, 'scroll', onScroll);\n  }\n\n  forEachElement(element, (elem) \x3d\x3e {\n    attachResizeEvent(elem, callback);\n  });\n\n  this.detach \x3d (ev) \x3d\x3e {\n    L.ResizeSensor.detach(element, ev);\n  };\n};\n\nL.ResizeSensor.detach \x3d (element, ev) \x3d\x3e {\n  forEachElement(element, (elem) \x3d\x3e {\n    const elementItem \x3d elem;\n    if (elementItem.resizedAttached \x26\x26 typeof ev \x3d\x3d\x3d 'function') {\n      elementItem.resizedAttached.remove(ev);\n      if (elementItem.resizedAttached.length()) return;\n    }\n    if (elementItem.resizeSensor) {\n      if (elementItem.contains(elementItem.resizeSensor)) {\n        elementItem.removeChild(elementItem.resizeSensor);\n      }\n      delete elementItem.resizeSensor;\n      delete elementItem.resizedAttached;\n    }\n  });\n};\n"
}])["default"];
//# sourceMappingURL=erizo.js.map