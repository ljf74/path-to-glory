let w = window;

let _i;
let $;

let bj;
let gF;

_t = CanvasRenderingContext2D.prototype;

bC = navigator.userAgent.match(/*nomangle*//andro|ipho|ipa|ipo/i/*/nomangle*/) ? 1 : 0;

bi = (a, b, c) => b < a ? a : (b > c ? c : b);
bB = (a, b, c) => a <= b && b <= c || a >= b && b >= c;
T = (min, max) => random() * (max - min) + min;
eD = (x1, y1, x2, y2) => hypot(x1 - x2, y1 - y2);
_Y = (a, b) => eD(a.x, a.y, b.x, b.y);
iX = x => iW(x, PI);
_L = (a, b) => atan2(b.y - a.y, b.x - a.x);
iV = (x, precision) => round(x / precision) * precision;
bh = a => a[~~(random() * a.length)];
_g = (from, eC, _f) => bi(0, _f, 1) * (eC - from) + from;

// Easing
iU = x => x;
eB = x => 1 - pow(1 - x, 5);

// Modulo centered around zero: the result will be bi -y kb +y
iW = (x, y) => {
    x = x % (y * 2);
    if (x > y) {
        x -= y * 2;
    }
    if (x < -y) {
        x += y * 2;
    }
    return x;
};

// Make Math global
Object.getOwnPropertyNames(Math).forEach(n => w[n] = w[n] || Math[n]);

O = PI * 2;

class iT {
    _s(_d) {
        _d.L = this;
        _d.bg = this._d || new bf();
        _d.dm();
        this._d = _d;
    }

    C(A) {
        this._d.C(A);
    }
}

class bf {

    constructor() {
        this.D = 0;
    }

    get _B() { return 0; }
    get ct() { return 0; }
    get _p() { return 1; }
    get az() { return 0; }

    dm() {

    }

    C(A) {
        this.D += A;
    }
}

dl = ({
    o,
    bA,
    dk,
    gE,
    bd,
}) => {
    let { F } = o;
    let L = new iT();

    let eA = [
        0.7,
        0.8,
        0.9,
        1,
        3,
    ];

    bA = bA || 1;
    dk = dk || 0;
    bd = bd || 0;

    class bz extends bf {
        C(A) {
            super.C(A);
            if (o.ay === 0) {
                L._s(new iS());
            }
            if (o.D - o.cs < bd) {
                L._s(new iR());
            }
        }
    }
    
    class bc extends bz {
        get _B() { return _g(this.bg._B, 0, this.D / 0.1); }
        get ct() { return _g(this.bg.ct, 0, this.D / 0.1); }

        get _p() { 
            return o.bb ? 0.5 : 1; 
        }

        C(A) {
            super.C(A);
            if (F._o) {
                L._s(new gD());
            } else if (F._h) {
                L._s(new ez());
            } else if (F._A) {
                L._s(new dj());
            }
        }
    }

    class gD extends bz {
        get _p() { 
            return 0.5; 
        }

        get ct() { return _g(0, 1, this.D / 0.1); }
        get _B() { return _g(0, -1, this.D / 0.1); }
        get iQ() { return 1; }
        get iP() { return this.D < dk; }

        C(A) {
            super.C(A);
            if (!F._o) {
                L._s(new bc());
            }
        }
    }

    class dj extends bf {

        get _B() { 
            return _g(this.bg._B, -1, this.D / (0.3 / 2)); 
        }

        dm() {
            this.cr = o.F.K;

            o._A(o.F.K, 200, 0.3);
            ba(...[1.99,,427,.01,,.07,,.62,6.7,-0.7,,,,.2,,,.11,.76,.05]);

            o.cq(0.15);
        }

        C(A) {
            super.C(A);

            if (this.D > 0.3) {
                L._s(new bc());
            }
        }
    }

    class ez extends bz {
        constructor(_y = 0) {
            super();
            this._y = _y;
        }

        get _p() { 
            return 0.5; 
        }

        get az() {
            return this.D / bA;
        }

        get _B() { 
            return _g(this.bg._B, -1, this.az); 
        }

        C(A) {
            let { az } = this;

            super.C(A);

            if (!F._h) {
                let _y = this.D >= 1 ? eA.length - 1 : this._y;
                L._s(new iO(_y));
            }

            if (az < 1 && this.az >= 1) {
                let animation = o.g.add(new iN());
                animation.x = o.x - o.af * 20;
                animation.y = o.y - 60;
            }
        }
    }

    class iO extends bz {
        constructor(_y = 0) {
            super();
            this._y = _y;
            this.ey = -min(3, this._y + 1) * 0.4;
        }

        get _B() { 
            return this.D < 0.05 
                ? _g(
                    this.bg._B, 
                    this.ey, 
                    this.D / 0.05,
                )
                : _g(
                    this.ey, 
                    1, 
                    (this.D - 0.05) / (0.15 - 0.05),
                );   
        }

        dm() {
            o.iM();

            this.gC = new iL(
                o, 
                this._y == eA.length - 1 ? '#ff0' : '#fff', 
                this.ey, 
                0,
            );
        }

        C(A) {
            super.C(A);

            if (this.D >= 0.05) {
                o.g.add(this.gC);
                this.gC.di = this._B;
            }

            if (F._h) this.iK = 1;
            if (F._A) this.iJ = 1;

            if (this.D > 0.15) {
                o.strike(eA[this._y]);

                if (this.iJ) {
                    L._s(new dj());   
                    return; 
                }

                L._s(
                    this._y < 3
                        ? this.iK
                            ? new ez(this._y + 1)
                            : new iI(this._y)
                        : new iH()
                );
            }
        }
    }

    class iI extends bz {
        constructor(_y) {
            super();
            this._y = _y;
        }

        get _B() { 
            let _x = 1;
            let ex = 0;

            let _f = min(1, this.D / 0.05); 
            return _f * (ex - _x) + _x;
        }

        C(A) {
            super.C(A);

            if (!F._h || !gE) {
                this.iG = 1;
            }

            if (this.D > 0.3) {
                L._s(new bc());
            } else if (F._h && this.iG) {
                L._s(new ez(this._y + 1));
            } else if (F._o) {
                L._s(new gD());
            } else if (F._A) {
                L._s(new dj());
            }
        }
    }

    class iH extends bz {

        get _B() { 
            let _x = 1;
            let ex = 0;

            let _f = min(this.D / 0.5, 1); 
            return _f * (ex - _x) + _x;
        }

        C(A) {
            super.C(A);

            if (this.D > 0.5) {
                L._s(new bc());
            } else if (F._A) {
                L._s(new dj());
            }
        }
    }

    class iS extends bf {
        get _B() { 
            return _g(this.bg._B, 1, this.D / 0.2); 
        }

        get ew() {
            return 1;
        }
        
        get _p() { 
            return 0.5; 
        }

        dm() {
            if (!o.iF) o.co(/*nomangle*/'Exhausted'/*/nomangle*/);
            o.kq = 0;
        }

        C(A) {
            super.C(A);

            if (o.ay >= 1) {
                L._s(new bc());
            }
        }
    }

    class iR extends bf {
        get _B() { 
            return this.bg._B; 
        }
        
        get _p() { 
            return 0.5; 
        }

        C(A) {
            super.C(A);

            if (this.D >= bd) {
                L._s(new bc());
            }
        }
    }

    L._s(new bc());

    return L;
}

cn = (w, h, _r) => {
    let _i = document.createElement('canvas');
    _i.width = w;
    _i.height = h;

    let $ = _i.getContext('2d');

    return _r($, _i) || _i;
};

_t.slice = (Z, ev, _f) => {
    $.beginPath();
    if (ev) {
        $.moveTo(-Z, -Z);
        $.lineTo(Z, -Z);
    } else {
        $.lineTo(-Z, Z);
        $.lineTo(Z, Z);
    }

    $.lineTo(Z, -Z * _f);
    $.lineTo(-Z, Z * _f);
    $.clip();
};

_t.G = function(f) {
    let { U } = this;
    this.save();
    f();
    this.restore();
    this.U = U || (x => x);
};

_t.U = x => x;

_t.cm = function(_r) {
    this.G(() => {
        this.b_ = 1;
        this.U = () => 'rgba(0,0,0,.2)';

        $.scale(1, 0.5);
        $.transform(1, 0, 0.5, 1, 0, 0); // shear the context
        _r();
    });

    this.G(() => {
        this.b_ = 0;
        _r();
    });
};

eu = cn(50, 50, ($, _i) => {
    $.fillStyle = '#fff';
    $.translate(_i.width / 2, _i.width / 2);
    for (let r = 0, i = 0 ; r < 1 ; r += 0.05, i++) {
        let ae = i % 2 ? _i.width / 2 : _i.width / 3;
        $.lineTo(
            cos(r * O) * ae,
            sin(r * O) * ae,
        )
    }
    $.fill();

    $.font = /*nomangle*/'bold 18pt Arial'/*/nomangle*/;
    $.fillStyle = '#f00';
    $.textAlign = /*nomangle*/'center'/*/nomangle*/;
    $.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
    $.fillText('!!!', 0, 0);
});

_t.bx = function() {
    with (this) G(() => {
        fillStyle = U('#444');
        fillRect(-10, -2, 20, 4);
        fillRect(-3, 0, 6, 12);

        fillStyle = U('#fff');
        beginPath();
        moveTo(-3, 0);
        lineTo(-5, -35);
        lineTo(0, -40);
        lineTo(5, -35);
        lineTo(3, 0);
        fill();
    });
};

_t.gB = function() {
    with (this) G(() => {
        fillStyle = U('#634');
        fillRect(-2, 12, 4, -40);

        translate(0, -20);

        let Z = 10;

        fillStyle = U('#eee');

        beginPath();
        arc(0, 0, Z, -PI / 4, PI / 4);
        arc(0, Z * hypot(1, 1), Z, -PI / 4, -PI * 3 / 4, 1);
        arc(0, 0, Z, PI * 3 / 4, -PI * 3 / 4);
        arc(0, -Z * hypot(1, 1), Z, PI * 3 / 4, PI / 4, 1);
        fill();
    });
};

_t.dh = function() {
    with (this) G(() => {
        fillStyle = U('#fff');

        for (let [gA, iE] of [[0.8, U('#fff')], [0.6, U('#888')]]) {
            fillStyle = iE;
            scale(gA, gA);
            beginPath();
            moveTo(0, -15);
            lineTo(15, -10);
            lineTo(12, 10);
            lineTo(0, 25);
            lineTo(-12, 10);
            lineTo(-15, -10);
            fill();
        }
    });
};

_t.et = function(o, W) {
    with (this) G(() => {
        let { D } = o;

        translate(0, -32);

        // Left leg
        G(() => {
            fillStyle = U(W);
            translate(-6, 12);
            if (o.F._G) rotate(-sin(D * O * 4) * PI / 16);
            fillRect(-4, 0, 8, 20);
        });

        // Right leg
        G(() => {
            fillStyle = U(W);
            translate(6, 12);
            if (o.F._G) rotate(sin(D * O * 4) * PI / 16);
            fillRect(-4, 0, 8, 20);
        });
    });
};

_t.dg = function(o, W, width = 25) {
    with (this) G(() => {
        let { _R } = o;

        translate(0, -32);

        // Breathing
        translate(0, sin(_R * O / 5) * 0.5);
        rotate(sin(_R * O / 5) * PI / 128);

        fillStyle = U(W);
        if (o.F._G) rotate(-sin(_R * O * 4) * PI / 64);
        fillRect(-width / 2, -15, width, 30);
    });
}

_t.df = function(o, W, gz = 0) {
    with (this) G(() => {
        let { _R } = o;

        fillStyle = U(W);
        translate(0, -54);
        if (o.F._G) rotate(-sin(_R * O * 4) * PI / 32);
        fillRect(-6, -7, 12, 15);

        fillStyle = U(gz);
        if (gz) fillRect(4, -5, -6, 4);
    });
}

_t.gy = function(o) {
    with (this) G(() => {
        fillStyle = U('#ff0');
        translate(0, -70);

        beginPath();
        lineTo(-8, 0);
        lineTo(-4, 6);
        lineTo(0, 0);
        lineTo(4, 6);
        lineTo(8, 0);
        lineTo(8, 12);
        lineTo(-8, 12);
        fill();
    });
}

_t.gx = function() {
    this.fillStyle = this.U('#444');
    this.fillRect(-3, 10, 6, -40);
}

_t.es = function(o, W, iD) {
    with (this) G(() => {
        if (!o._a) return;

        let { _R } = o;

        translate(11, -42);
        
        fillStyle = U(W);
        if (o.F._G) rotate(-sin(_R * O * 4) * PI / 32);
        rotate(o.L._d._B * PI / 2);

        // Breathing
        rotate(sin(_R * O / 5) * PI / 32);

        fillRect(0, -3, 20, 6);

        translate(18, -6);
        iD();
    });
}

_t.er = function(o, iC) {
    with (this) G(() => {
        let { _R } = o;

        translate(0, -32);

        fillStyle = U(iC);
        translate(-10, -8);
        if (o.F._G) rotate(-sin(_R * O * 4) * PI / 32);
        rotate(PI / 3);
        rotate(o.L._d.ct * -PI / 3);

        // Breathing
        rotate(sin(_R * O / 5) * PI / 64);

        let gw = 10 + 15 * o.L._d.ct;
        fillRect(0, -3, gw, 6);

        // Shield
        G(() => {
            translate(gw, 0);
            dh();
        });
    });
};

_t.eq = function(o, y) {
    if (!o._a) return;

    if (o.L._d.ew) {
        this.G(() => {
            this.translate(0, y);
            this.fillStyle = this.U('#ff0');
            for (let r = 0 ; r < 1 ; r += 0.15) {
                let K = r * O + o.D * PI;
                this.fillRect(cos(K) * 15, sin(K) * 15 * 0.5, 4, 4);
            }
        });
    }
};

_t.gv = function(o) {
    if (false) return;

    with (this) G(() => {
        if (!o._a) return;

        let _F = o.L._d.az;
        if (_F > 0 && !this.b_) {
            strokeStyle = 'rgba(255,0,0,1)';
            fillStyle = 'rgba(255,0,0,.5)';
            globalAlpha = _g(0.5, 0, _F);
            lineWidth = 10;
            beginPath();
            scale(1 - _F, 1 - _F);
            ellipse(0, 0, o.cl, o.bw, 0, 0, O);
            fill();
            stroke();
        }
    });
};

_t.gu = function(o) {
    with (this) G(() => {
        if (!o._a) return;

        translate(0, -100 + bh([-2, 2]));

        if (o.L._d.az > 0 && !b_) {
            let _F = min(1, 2 * o.L._d.D / 0.25);
            scale(_F, _F);
            drawImage(eu, -eu.width / 2, -eu.height / 2);
        }
    });
};

gt = cn(400, 1, ($) => {
    let _E = $.createLinearGradient(-200, 0, 200, 0);
    _E.addColorStop(0, '#900');
    _E.addColorStop(1, '#f44');
    return _E;
});

gs = cn(400, 1, ($) => {
    let _E = $.createLinearGradient(-200, 0, 200, 0);
    _E.addColorStop(0, '#07f');
    _E.addColorStop(1, '#0ef');
    return _E;
});

class ck {
    constructor(de) {
        this.de = de;
        this.value = this.b$ = 1;
        this.ep = 0.5;
    }

    C(A) {
        this.b$ += bi(
            -A * 0.5, 
            this.de() - this.b$, 
            A * this.ep,
        );
    }

    _r(width, height, W, iB, gr) {
        function eo(
            width,
            height, 
            value,
            W,
        ) {
            $.G(() => {
                let en = _g(height / 2, width, value);
                if (value === 0) return;

                $.translate(-width / 2, 0);

                $.fillStyle = W;
                $.beginPath();
                $.lineTo(0, height / 2);

                if (!iB) {
                    $.lineTo(height / 2, 0);
                    $.lineTo(en - height / 2, 0);
                }

                $.lineTo(en, height / 2);
                $.lineTo(en - height / 2, height);
                $.lineTo(height / 2, height);
                $.fill();
            })
        }

        $.G(() => {
            $.G(() => {
                $.globalAlpha *= 0.5;
                eo(width + 8, height + 4, 1, '#000');
            });

            $.translate(0, 2);
            eo(width, height, this.b$, '#fff');
            eo(width, height, min(this.b$, this.de()), W);

            $.globalAlpha *= 0.5;
            $.fillStyle = '#000';
            for (let r = 1 / gr ; r < 1 ; r += 1 / gr) {
                $.fillRect(r * width - width / 2, 0, 1, height);
            }
        });
    }
}

iA = cn(1, 1, ($) => {
    let _E = $.createLinearGradient(0, 0, 0, -150);
    _E.addColorStop(0, '#888');
    _E.addColorStop(0.7, '#eee');
    _E.addColorStop(1, '#888');
    return _E;
});

_t.gq = function (aZ) {
    with (this) {
        textBaseline = /*nomangle*/'alphabetic'/*/nomangle*/;
        textAlign = /*nomangle*/'left'/*/nomangle*/;
        fillStyle = iA;
        strokeStyle = '#000';
        lineWidth = 4;
        shadowColor = '#000';

        let x = 0;
        for (let [N, _X, offsetWidth] of aZ) {
            font = _X + /*nomangle*/'px Times New Roman'/*/nomangle*/;
            x += measureText(N).width + (offsetWidth || 0);
        }

        translate(-x / 2, 0);

        x = 0;
        for (let [N, _X, offsetWidth] of aZ) {
            font = _X + /*nomangle*/'px Times New Roman'/*/nomangle*/;

            shadowBlur = 5;
            strokeText(N, x, 0);

            shadowBlur = 0;
            fillText(N, x, 0);

            x += measureText(N).width + (offsetWidth || 0);
        }

        return x;
    }
};

_t.gp = function(N) {
    with (this) {
        textBaseline = /*nomangle*/'middle'/*/nomangle*/;
        textAlign = /*nomangle*/'center'/*/nomangle*/;
        strokeStyle = '#000';
        lineWidth = 4;
        font = /*nomangle*/'18pt Times New Roman'/*/nomangle*/;

        let width = measureText(N).width + 20;
        fillStyle = 'rgba(0,0,0,.5)';
        fillRect(-width / 2, 0, width, 40);

        fillStyle = '#fff';
        strokeText(N, 0, 20);
        fillText(N, 0, 20);
    }
};

let _w = {};
onkeydown = e => {
    if (e.keyCode == 27 || e.keyCode == 80) {
        bj = !bj;
        gn(bj ? 0 : 0.5);
    }
    _w[e.keyCode] = 1
};
onkeyup = e => _w[e.keyCode] = 0;

// Reset inputs when window loses focus
onblur = onfocus = () => {
    _w = {};
    cj = ci = 0;
};

ci = 0;
cj = 0;
cg = {x: 0, y: 0};

onmousedown = (aY) => aY.button == 2 ? cj = 1 : ci = 1;
onmouseup = (aY) => aY.button == 2 ? cj = 0 : ci = 0;
onmousemove = (aY) => gm(aY, _i, cg);

oncontextmenu = (aY) => aY.preventDefault();

gm = (event, _i, gl) => {
    if (!_i) return;
    let dd = _i.getBoundingClientRect();
    gl.x = (event.pageX - dd.left) / dd.width * _i.width;
    gl.y = (event.pageY - dd.top) / dd.height * _i.height;
}

class iz {
    constructor() {
        this.x = this.y = 0;
        this._q = {'x': 0, 'y': 0};
        this.bv = -1;
    }

    _r() {
        if (this.bv < 0) return;

        let gk = bi(0, (_Y(this, this._q) - 50) / (150 - 50), 1);
        let Z = (1 - gk) * 50;

        __.globalAlpha = _g(0.5, 0, gk);
        __.strokeStyle = '#fff';
        __.lineWidth = 2;
        __.fillStyle = 'rgba(0,0,0,0.5)';
        __.beginPath();
        __.arc(this.x, this.y, Z * devicePixelRatio, 0, O);
        __.fill();
        __.stroke();

        __.globalAlpha = 0.5;
        __.fillStyle = '#fff';
        __.beginPath();
        __.arc(this._q.x, this._q.y, 30 * devicePixelRatio, 0, O);
        __.fill();
    }
}

class em {
    constructor(
        x, 
        y,
        bu,
    ) {
        this.x = x; 
        this.y = y;
        this.bu = bu;
    }

    _r() {
        __.translate(this.x(), this.y());

        __.scale(devicePixelRatio, devicePixelRatio);

        __.strokeStyle = '#fff';
        __.lineWidth = 2;
        __.fillStyle = this.cf ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
        __.beginPath();
        __.arc(0, 0, 35, 0, O);
        __.fill();
        __.stroke();

        __.font = /*nomangle*/'16pt Courier'/*/nomangle*/;
        __.textAlign = /*nomangle*/'center'/*/nomangle*/;
        __.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
        __.fillStyle = '#fff';
        __.fillText(this.bu, 0, 0);
    }
}

el = (touches) => {
    for (let button of gj) {
        button.cf = 0;
        for (let _q of touches) {
            gm(_q, _W, _q);
            if (
                abs(button.x() - _q.x) < 35 * devicePixelRatio &&
                abs(button.y() - _q.y) < 35 * devicePixelRatio
            ) {
                button.cf = 1;
            }
        }
    }

    let aX;
    for (let _q of touches) {
        if (
            _q.identifier === _K.bv || 
            _q.x < _W.width / 2
        ) {
            aX = _q;
            break;
        }
    }

    if (aX) {
        if (_K.bv < 0) {
            _K.x = aX.x;
            _K.y = aX.y;
        }
        _K.bv = aX.identifier;
        _K._q.x = aX.x;
        _K._q.y = aX.y;
    } else {
        _K.bv = -1;
    }
};

ontouchstart = (event) => {
    bC = 1;
    event.preventDefault();
    el(event.touches);
};

ontouchmove = (event) => {
    event.preventDefault();
    el(event.touches);
};

ontouchend = (event) => {
    event.preventDefault();
    el(event.touches);

    if (onclick) onclick();
};

gi = () => {
    _W.style.display = bC == 1 ? 'block' : 'hidden';
    _W.width = innerWidth * devicePixelRatio;
    _W.height = innerHeight * devicePixelRatio;

    for (let button of gj.concat([_K])) {
        __.G(() => button._r());
    }

    requestAnimationFrame(gi);
}

_W = document.createElement(/*nomangle*/'canvas'/*/nomangle*/);
__ = _W.getContext('2d');

gj = [
    iy = new em(
        () => _W.width - 175 * devicePixelRatio,
        () => _W.height - 75 * devicePixelRatio,
        /*nomangle*/'ATK'/*/nomangle*/,
    ),
    ix = new em(
        () => _W.width - 75 * devicePixelRatio,
        () => _W.height - 75 * devicePixelRatio,
        /*nomangle*/'DEF'/*/nomangle*/,
    ),
    iw = new em(
        () => _W.width - 125 * devicePixelRatio,
        () => _W.height - 150 * devicePixelRatio,
        /*nomangle*/'ROLL'/*/nomangle*/,
    ),
];

_K = new iz();

if (bC === 1) {
    document.body.appendChild(_W);
    gi();
}

class ek {
    _x(o) {
        this.o = o;
    }

    // get description() {
    //     return this.constructor.hL;
    // }

    C() {}
}

class _J extends ek {

    _x(o) {
        super._x(o);
        return new Promise((_D, dc) => {
            this.ej = _D;
            this.ce = dc;
        });
    }

    C() {
        let u = _m(this.o.g.P('u'));
        if (u) {
            this.ad(u);
        }
    }

    ad(u) {

    }

    _D() {
        let { ej } = this;
        this.cc();
        if (ej) ej();
    }

    dc(iv) {
        let { ce } = this;
        this.cc();
        if (ce) ce(iv);
    }

    cc() {
        this.ce = 0;
        this.ce = 0;
    }
}

class iu extends _J {

    constructor() {
        super();
        this.aO = new Set();
    }

    C(A) {
        super.C(A);

        for (let _v of this.aO.values()) {
            _v.C(A);
        }
    }

    // get description() {
    //     return Array.from(this.aO).map(_v => _v.description).join('+');
    // }

    async _x(o) {
        super._x(o);
        await this.gh(o);
    }

    async gh() {
        // implement in subclasses
    }

    ad(u) {
        this.o.F._C.x = u.x;
        this.o.F._C.y = u.y;
    }

    aW(_v) {
        return this.race([_v]);
    }

    async race(aO) {
        try {
            await Promise.race(aO.map(_v => {
                this.aO.add(_v);
                return _v._x(this.o);
            }));
        } finally { 
            for (let _v of aO) {
                _v.dc(Error());
                _v._D(); // Allow the _J eC clean up
                this.aO.delete(_v);
            }
        }
    }

    async kp(aO) {
        for (let _v of aO) {
            await this.aW(_v);
        }
    }
}

class ei extends _J {

    constructor(_l) {
        super();
        this._l = _l;
    }

    _x(o) {
        this.eh = o.D + this._l;
        return super._x(o);
    }

    ad() {
        if (this.o.D > this.eh) {
            this._D();
        }
    }
}

class gg extends _J {

    constructor(_l) {
        super();
        this._l = _l;
    }

    _x(o) {
        this.eh = o.D + this._l;
        return super._x(o);
    }

    ad() {
        if (this.o.D > this.eh) {
            this.dc(Error());
        }
    }
}

class gf extends _J {
    ad() {
        let eg = _m(this.o.g.P('at'));
        if (eg.ir(this.o)) {
            this._D();
        }
    }
}

class iq extends _J {
    ad() {
        let eg = _m(this.o.g.P('at'));
        eg.ef(this.o);
        this._D();
    }
}

class ge extends _J {
    constructor(V, _k) {
        super();
        this.V = V;
        this._k = _k;
        this.K = random() * O;
    }

    ad(u) {
        let { F } = this.o;

        F._G = 0;

        if (!this.o.gd(u, this.V, this._k, PI / 2)) {
            F._G = 1;
            F.K = _L(this.o, {
                x: u.x + cos(this.K) * this.V,
                y: u.y + sin(this.K) * this._k,
            });
        } else {
            this._D();
        }
    }
}

class ip extends _J {
    constructor(ee) {
        super();
        this.ee = ee; 
    }

    ad() {
        let { F } = this.o;

        F._h = 1;

        if (this.o.L._d.az >= this.ee) {
            // ip was prepared, release!
            F._h = 0;
            this._D();
        }
    }
}

class io extends _J {
    constructor(V, _k) {
        super();
        this.V = V;
        this._k = _k;
    }

    ad(u) {
        this.o.F._G = 0;

        if (this.o.gd(u, this.V, this._k, PI / 2)) {
            // Get away from the u
            this.o.F._G = 1;
            this.o.F.K = _L(u, this.o);
        } else {
            this._D();
        }
    }

    cc() {
        this.o.F._G = 0;
    }
}

class im extends _J {
    ad() {
        this.o.F._o = 1;
    }

    cc() {
        this.o.F._o = 0;
    }
}

class il extends _J {
    ad() {
        this.o.F._A = 1;
    }

    cc() {
        this.o.F._A = 0;
    }
}

class Y {
    constructor() {
        this.x = this.y = this._V = this.D = 0;   
        this._z = [];

        this.S = new ik();

        this.ax = Infinity;

        this.a_ = 1;
    }

    get z() { 
        return this.y; 
    }

    get bb() {
        if (this.g)
        for (let aV of this.g.P('aV')) {
            if (aV.ij(this)) return 1;
        }
    }

    C(A) {
        this.D += A;
    }

    _r() {
        let B = _m(this.g.P('B'));
        if (
            bB(B.x - 1280 / 2 - this.ax, this.x, B.x + 1280 / 2 + this.ax) &&
            bB(B.y - 720 / 2 - this.ax, this.y, B.y + 720 / 2 + this.ax)
        ) {
            this.S.reset();
            this._$(B);
        }
    }

    _$(B) {

    }

    _e() {
        this.g._e(this);
    }

    aN(B) {
        $.translate(B.x, B.y);
        $.scale(1 / B._Q, 1 / B._Q);
        $.translate(-640, -360);
    }
}

class ii extends Y {
    constructor() {
        super();
        this._z.push('B');
        this.cb = 1;
        this.a_ = 0;

        this.da = -640;
    }

    get _Q() {
        // I'm a lazy butt kb refuse eC ad the entire game eC have a ak more cb.
        // So instead I do dis ¯\_(Ä)_/¯
        return _g(1.2, 3, (this.cb - 1) / 3);
    }

    C(A) {
        super.C(A);

        for (let u of this.g.P('u')) {
            let gc = {'x': u.x, 'y': u.y - 60 };
            let ae = _Y(this, gc);
            let K = _L(this, gc);
            let gb = min(ae, ae * A * 3);
            this.x += gb * cos(K);
            this.y += gb * sin(K);
        }

        this.x = max(this.da, this.x);
    }

    ca(c_) {
        if (this.ih) {
            this.ih._e();
        }
        return this.g.add(new _j(this, 'cb', this.cb, c_, 1)).await();
    }
}

class _j extends Y {

    constructor(
        d_,
        aU,
        ed,
        c_,
        _l,
        ec = iU,
    ) {
        super();
        this.d_ = d_;
        this.aU = aU;
        this.ed = ed;
        this.c_ = c_;
        this._l = _l;
        this.ec = ec;

        this.a_ = d_.a_;

        this.C(0);
    }

    await() {
        return new Promise(_D => this._D = _D);
    }

    C(A) {
        super.C(A);

        let _F = this.D / this._l;

        this.d_[this.aU] = _g(this.ed, this.c_, this.ec(_F));

        if (_F > 1) {
            this._e();
            if (this._D) this._D();
        }
    }
}

class ga extends Y {
    constructor(u) {
        super();
        this.u = u;
    }

    get z() { 
        return 9994;
    }

    _$() {
        if (bC == 1) return;
        $.translate(this.u.F._C.x, this.u.F._C.y);

        $.fillStyle = '#000';
        $.rotate(PI / 4);
        $.fillRect(-15, -5, 30, 10);
        $.rotate(PI / 2);
        $.fillRect(-15, -5, 30, 10);
    }
}

class eb extends Y {

    get z() {
        return -9992;
    }

    _$(B) {
        $.strokeStyle = '#dc9';
        $.lineWidth = 70;

        $.fillStyle = '#fff';

        $.beginPath();
        for (let x = iV(B.x - 1280 * 2, 300) ; x < B.x + 1280 ; x += 300) {
            let y = this.g.aM(x);
            $.lineTo(x, y);
        }
        $.stroke();
    }
}

class ig extends Y {
    constructor() {
        super();
        this._z.push('at');
        this.c$ = 0;
        this.d$ = new Set();
    }

    ir(H) {
        this.ef(H);

        let { aw } = H;
        if (this.c$ + aw > 6) {
            return;
        }

        this.c$ += aw;
        this.d$.add(H);
        return 1
    }

    ef(H) {
        if (this.d$.has(H)) {
            let { aw } = H;
            this.c$ -= aw;
            this.d$.delete(H);
        }
    }

    _$(B) {
        if (true && false) {
            $.fillStyle = '#fff';
            $.strokeStyle = '#000';
            $.lineWidth = 5;
            $.textAlign = /*nomangle*/'center'/*/nomangle*/;
            $.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
            $.font = /*nomangle*/'12pt Courier'/*/nomangle*/;

            $.G(() => {
                $.translate(B.x, B.y - 100);
        
                $.strokeText('Agg: ' + this.c$, 0, 0);
                $.fillText('Agg: ' + this.c$, 0, 0);
            });

            let u = _m(this.g.P('u'));
            if (!u) return;

            for (let H of this.d$) {
                $.strokeStyle = '#f00';
                $.lineWidth = 20;
                $.globalAlpha = 0.1;
                $.beginPath();
                $.moveTo(H.x, H.y);
                $.lineTo(u.x, u.y);
                $.stroke();
            }
        }
    }
}

class iN extends Y {

    get z() { 
        return 9992; 
    }

    C(A) {
        super.C(A);
        if (this.D > 0.25) {
            this._e();
        }
    }

    _$() {
        let _f = this.D / 0.25;

        $.translate(this.x, this.y);
        $.scale(_f, _f);

        $.globalAlpha = 1 - _f; 
        $.strokeStyle = '#ff0';
        $.lineWidth = 10;
        $.beginPath();
        $.arc(0, 0, 80, 0, O);
        $.stroke();
    }
}

class ie extends Y {

    get z() { 
        return 9992; 
    }

    C(A) {
        super.C(A);
        if (this.D > 0.25) {
            this._e();
        }
    }

    _$() {
        let _f = this.D / 0.25;

        $.translate(this.x, this.y);
        $.scale(_f, _f);

        $.globalAlpha = 1 - _f; 
        $.strokeStyle = '#fff';
        $.lineWidth = 10;
        $.beginPath();
        $.arc(0, 0, 80, 0, O);
        $.stroke();
    }
}

class ic extends Y {

    constructor() {
        super();
        this.a_ = 0;
    }

    get z() { 
        return 9992; 
    }

    C(A) {
        super.C(A);
        if (this.D > 0.5) {
            this._e();
        }
    }

    _$() {
        let _f = this.D / 0.5;
        $.fillStyle = '#fff';

        $.translate(this.x, this.y);

        $.globalAlpha = (1 - _f); 
        $.strokeStyle = '#fff';
        $.fillStyle = '#fff';
        $.lineWidth = 20;
        $.beginPath();

        for (let r = 0 ; r < 1 ; r+= 0.05) {
            let K = r * O;
            let Z = _f * T(140, 200);
            $.lineTo(
                cos(K) * Z,
                sin(K) * Z,
            );
        }

        // $.closePath();

        // // $.arc(0, 0, 100, 0, O);
        // $.stroke();
        $.fill();
    }
}

class cZ extends Y {

    constructor(
        W,
        ea,
        e_,
        e$,
        _l,
    ) {
        super();
        this.W = W;
        this.ea = ea;
        this.e_ = e_;
        this.e$ = e$;
        this._l = _l;
    }

    get z() { 
        return 9991; 
    }

    C(A) {
        super.C(A);
        if (this.D > this._l) {
            this._e();
        }
    }

    cY(aU) {
        let _F = this.D / this._l;
        return aU[0] + _F * (aU[1] - aU[0]);
    }

    _$() {
        let _X = this.cY(this.ea);
        $.translate(this.cY(this.e_) - _X / 2, this.cY(this.e$) - _X / 2);
        $.rotate(PI / 4);

        $.fillStyle = this.W;
        $.globalAlpha = this.cY([1, 0]);
        $.fillRect(0, 0, _X, _X);
    }
}

class iL extends Y {
    constructor(M, W, dZ, di) {
        super();
        this.M = M;
        this.W = W;
        this.dZ = dZ;
        this.di = di;
        this.a_ = M.a_;
    }

    get z() {
        return 9992;
    }

    C(A) {
        super.C(A);
        if (this.D > 0.2) this._e();
    }

    _$() {
        $.globalAlpha = 1 - this.D / 0.2;

        $.translate(this.M.x, this.M.y);
        $.scale(this.M.af, 1);
        $.translate(11, -42);

        $.strokeStyle = this.W;
        $.lineWidth = 40;
        $.beginPath();

        for (let r = 0 ; r < 1 ; r += 0.05) {
            $.G(() => {
                $.rotate(
                    _g(
                        this.dZ * PI / 2, 
                        this.di * PI / 2,
                        r,
                    )
                );
                $.lineTo(18, -26);
            });
        }

        $.stroke();
    }
}

class ib extends Y {
    get z() { 
        return 9993;
    }

    _$(B) {
        this.S.reset();

        $.fillStyle = '#0af';

        this.aN(B);

        for (let i = 99 ; i-- ;) {
            $.G(() => {
                $.translate(640, 360);
                $.rotate(this.S.next(0, PI / 16));
                $.translate(-640, -360);

                $.fillRect(
                    this.S.next(0, 1280),
                    this.S.next(1000, 2000) * (this.D + this.S.next(0, 10)) % 720,
                    2,
                    20,
                );
            });
        }
    }
}

class bZ extends Y {
    constructor() {
        super();
        this.aT();
    }

    get z() { 
        return 9993;
    }

    aT() {
        this.D = 0;

        let dY = 0, g_ = 0;
        if (this.g) {
            let B = _m(this.g.P('B'));
            dY = B.x;
            g_ = B.y;
        }
        this.x = T(dY - 640, dY + 640);
        this.y = g_ - 460;
        this._V = T(PI / 4, PI * 3 / 4);
    }

    C(A) {
        super.C(A);

        let B = _m(this.g.P('B'));
        if (this.y > B.y + 660) {
            this.aT();
        }

        this.x += cos(this._V) * A * 300;
        this.y += sin(this._V) * A * 300;
    }

    _$() {
        $.translate(this.x, this.y + 300);

        $.cm(() => {
            $.strokeStyle = $.U('#000');
            $.lineWidth = 4;
            $.beginPath();

            $.translate(0, -300);

            let K = sin(this.D * O * 4) * PI / 16 + PI / 4;

            $.lineTo(-cos(K) * 10, -sin(K) * 10);
            $.lineTo(0, 0);
            $.lineTo(cos(K) * 10, -sin(K) * 10);
            $.stroke();
        });
    }
}

class ia extends Y {

    constructor() {
        super();
        this.ax = 100;
    }

    C(A) {
        super.C(A);
        cX(this, 1280 / 2 + 50, 720 / 2 + 50);
    }

    _$() {
        $.translate(this.x, this.y);
        
        $.cm(() => {
            this.S.reset();

            let x = 0;
            for (let i = 0 ; i < (bC == 1 ? 2 : 5) ; i++) {
                $.G(() => {
                    $.fillStyle = $.U('#ab8');
                    $.translate(x, 0);
                    $.rotate(sin((this.D + this.S.next(0, 5)) * O / this.S.next(4, 8)) * this.S.next(PI / 16, PI / 4));
                    $.fillRect(-2, 0, 4, -this.S.next(5, 30));
                });

                x += this.S.next(5, 15);
            }
        });
    }
}

class i_ extends Y {

    constructor() {
        super();
        this._z.push('aJ');
    }
}

class bt extends i_ {

    constructor() {
        super();

        this.g$ = this.S.next(10, 20);
        this.bs = this.S.next(100, 250);

        this.cW = 20;
        this.am = 1;
        
        this.ax = this.bs + 60;
    }

    C(A) {
        super.C(A);

        if (!this.i$) cX(this, 1280 / 2 + 200, 720 / 2 + 400);

        this.S.reset();

        let fZ = 1;
        for (let M of this.g.P('u')) {
            if (
                bB(this.x - 100, M.x, this.x + 100) &&
                bB(this.y - this.bs - 50, M.y, this.y)
            ) {
                fZ = 0.2;
                break;
            }
        }

        this.am += bi(-A * 2, fZ - this.am, A * 2);
    }

    _$() {
        $.translate(this.x, this.y);
        
        $.cm(() => {
            this.S.reset();

            $.G(() => {
                $.rotate(sin((this.D + this.S.next(0, 10)) * O / this.S.next(4, 16)) * this.S.next(PI / 32, PI / 64));
                $.fillStyle = $.U('#a65');

                if (!$.b_) {
                    $.globalAlpha = this.am;
                }

                if (!$.b_) $.fillRect(0, 0, this.g$, -this.bs);

                $.translate(0, -this.bs);

                $.beginPath();
                $.fillStyle = $.U('#060');

                for (let i = 0 ; i < 5 ; i++) {
                    let K = i / 5 * O;
                    let _Y = this.S.next(20, 50);
                    let x =  cos(K) * _Y;
                    let y = sin(K) * _Y * 0.5;
                    let Z = this.S.next(20, 40);

                    $.G(() => {
                        $.translate(x, y);
                        $.rotate(PI / 4);
                        $.rotate(sin((this.D + this.S.next(0, 10)) * O / this.S.next(2, 8)) * PI / 32);
                        $.rect(-Z, -Z, Z * 2, Z * 2);
                    });
                }

                if ($.b_) $.rect(0, 0, this.g$, this.bs);

                $.fill();
            });

            $.clip();

            if (!$.b_) {
                for (let M of this.g.P('H')) {
                    if (
                        bB(this.x - 100, M.x, this.x + 100) &&
                        bB(this.y - this.bs - 50, M.y, this.y)
                    ) {
                        $.U = () => M instanceof cV ? '#888' : '#400';
                        $.G(() => {
                            $.translate(M.x - this.x, M.y - this.y);
                            $.scale(M.af, 1);
                            $.globalAlpha = this.am;
                            M.al();
                        });
                    }
                }
            }
        });
    }
}

class bY extends Y {

    constructor() {
        super();
        this.ax = 100;
    }

    C(A) {
        super.C(A);
        cX(this, 1280 / 2 + 50, 720 / 2 + 50);
    }

    _$() {
        $.translate(this.x, this.y);
        
        $.cm(() => {
            this.S.reset();

            let x = 0;
            for (let i = 0 ; i < 5 ; i++) {
                $.G(() => {
                    $.fillStyle = $.U('green');
                    $.translate(x, 0);
                    $.rotate(sin((this.D + this.S.next(0, 5)) * O / this.S.next(4, 8)) * this.S.next(PI / 32, PI / 16));
                    $.fillRect(-10, 0, 20, -this.S.next(20, 60));
                });

                x += this.S.next(5, 15);
            }
        });
    }
}

class dW extends Y {
    constructor() {
        super();
        this._z.push('aV');
        this.width = this.height = 0;
    }

    get z() { 
        return -9991; 
    }

    get bb() {
        return 0;
    }

    C(A) {
        super.C(A);
        this.ax = max(this.width, this.height) / 2;
        cX(this, 1280 * 2, 720 * 2, max(this.width, this.height));
    }

    ij(fY) {
        let fX = fY.x - this.x;
        let fW = fY.y - this.y;

        let hZ = fX * cos(this._V) + fW * sin(this._V);
        let hY = -fX * sin(this._V) + fW * cos(this._V);

        return abs(hZ) < this.width / 2 && abs(hY) < this.height / 2;
    }

    _$() {
        this.S.reset();

        $.G(() => {
            $.fillStyle = '#08a';
            $.translate(this.x, this.y);
            $.rotate(this._V);
            $.beginPath();
            $.rect(-this.width / 2, -this.height / 2, this.width, this.height);
            $.fill();
            $.clip();

            // Ripples
            $.rotate(-this._V);
            $.scale(1, 0.5);
            $.strokeStyle = '#fff';
            $.lineWidth = 4;

            for (let i = 3; i-- ; ) {
                let dV = (this.D + this.S.next(0, 20)) / 2;
                let _f = min(1, dV % (2 / 2));

                $.globalAlpha = (1 - _f) / 2;
                $.beginPath();
                $.arc(
                    ((this.S.next(0, this.width) + ~~dV * this.width * 0.7) % this.width) - this.width / 2,
                    ((this.S.next(0, this.height) + ~~dV * this.height * 0.7) % this.height) - this.width / 2,
                    _f * this.S.next(20, 60),
                    0,
                    O,
                );
                $.stroke();
            }
        });
    }
}

class fV extends Y {
    constructor(N, W = '#fff') {
        super();
        this.N = N.toUpperCase();
        this.W = W;
    }

    get z() { 
        return 9994; 
    }

    C(A) {
        super.C(A);
        if (this.D > 1 && !this.fU) this._e();
    }

    _$() {
        $.translate(this.x, _g(this.y + 20, this.y, this.D / 0.25));
        if (!this.fU) $.globalAlpha = _g(0, 1, this.D / 0.25);

        $.font = /*nomangle*/'bold 14pt Arial'/*/nomangle*/;
        $.fillStyle = this.W;
        $.strokeStyle = '#000';
        $.lineWidth = 3;
        $.textAlign = /*nomangle*/'center'/*/nomangle*/;
        $.textBaseline = /*nomangle*/'middle'/*/nomangle*/;

        $.shadowColor = '#000';
        $.shadowOffsetX = $.shadowOffsetY = 1;

        $.strokeText(this.N, 0, 0);
        $.fillText(this.N, 0, 0);
    }
}

class cU extends Y {
    constructor() {
        super();
        this.am = 1;
    }

    get z() { 
        return 9996;
    }

    _$(B) {
        this.aN(B);

        $.fillStyle = '#000';
        $.globalAlpha = this.am;
        $.fillRect(0, 0, 1280, 720);
    }
}

class hX extends Y {
    constructor() {
        super();
        this.am = 1;
    }

    get z() { 
        return 9995; 
    }

    _$(B) {
        if (bj) return;

        $.globalAlpha = this.am;

        $.G(() => {
            this.aN(B);
    
            $.fillStyle = '#000';
            $.fillRect(0, 0, 1280, 720);

            $.translate(640, 240);
            $.gq([
                [/*nomangle*/'P'/*/nomangle*/, 192, -30],
                [/*nomangle*/'ATH'/*/nomangle*/, 96, 30],
                [/*nomangle*/'TO'/*/nomangle*/, 36, 20],
                [/*nomangle*/'G'/*/nomangle*/, 192],
                [/*nomangle*/'LORY'/*/nomangle*/, 96],
            ]);      
        });

        for (let u of this.g.P('u')) {
            u._$(B);
            if (gF) $.gy(u);
        }
    }
}

class bX extends Y {
    constructor(N) {
        super();
        this.N = N;
        this.a_ = 0;
    }

    get z() { 
        return 9995; 
    }

    C(A) {
        super.C(A);
        if (this.D > 5) this._e();
    }

    _$(B) {
        this.aN(B);

        $.globalAlpha = this.D < 1 
            ? _g(0, 1, this.D)
            : _g(1, 0, this.D - 4);

        $.G(() => {
            $.translate(40, 680);

            $.fillStyle = '#fff';
            $.strokeStyle = '#000';
            $.lineWidth = 4;
            $.textAlign = /*nomangle*/'left'/*/nomangle*/;
            $.textBaseline = /*nomangle*/'alphabetic'/*/nomangle*/;
            $.font = /*nomangle*/'72pt Times New Roman'/*/nomangle*/;
            $.strokeText(this.N, 0, 0);
            $.fillText(this.N, 0, 0);
        });
    }
}

class fT extends Y {

    get z() { 
        return 9997; 
    }

    C(A) {
        super.C(A);

        if (this.N != this.hW) {
            this.hW = this.N;
            this.dU = 0; 
        }
        this.dU += A;
    }

    _$(B) {
        if (!this.N || bj) return;

        this.aN(B);

        $.translate(1280 / 2, 720 * 5 / 6);

        $.scale(
            _g(1.2, 1, this.dU * 8),
            _g(1.2, 1, this.dU * 8),
        );
        $.gp(this.N);
    }
}

class cT extends Y {

    constructor(N) {
        super();
        this.N = N;
        this.am = 1;
    }

    get z() { 
        return 9997; 
    }

    _$(B) {
        if (!this.N) return;

        this.aN(B);

        $.translate(150, 360);

        $.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
        $.textAlign = /*nomangle*/'left'/*/nomangle*/;
        $.fillStyle = '#fff';
        $.font = /*nomangle*/'24pt Times New Roman'/*/nomangle*/;

        let y = -this.N.length / 2 * 50;
        let fS = 0;
        for (let cS of this.N) {
            $.globalAlpha = bi(0, (this.D - fS * 3), 1) * this.am;
            $.fillText(cS, 0, y);
            y += 75;
            fS++;
        }
    }
}

class hV extends Y {
    get z() { 
        return 9995 + 1; 
    }

    _$(B) {
        if (!bj) return;

        this.aN(B);

        $.fillStyle = 'rgba(0,0,0,0.5)';
        $.fillRect(0, 0, 1280, 720);

        $.G(() => {
            $.translate(1280 / 2, 720 / 3);

            $.gq([
                [/*nomangle*/'G'/*/nomangle*/, 192],
                [/*nomangle*/'AME'/*/nomangle*/, 96, 30],
                [/*nomangle*/'P'/*/nomangle*/, 192, -30],
                [/*nomangle*/'AUSED'/*/nomangle*/, 96],
            ]);
        });

        $.G(() => {
            $.translate(1280 / 2, 720 * 3 / 4);
            $.gp(/*nomangle*/'[P] or [ESC] to resume'/*/nomangle*/);
        });

    }
}

class cR extends Y {
    constructor(M) {
        super();
        this.M = M;

        this.br = new ck(() => this.M._a / this.M._U);
        this.bW = new ck(() => this.M.ay);
    }

    get z() { 
        return 9990; 
    }

    C(A) {
        super.C(A);
        this.br.C(A);
        this.bW.C(A);
        if (!this.M._a) this._e();
    }

    _$() {
        if (
            this.M._a > 0.5 && 
            this.M.D - max(this.M.dT, this.M.cs) > 2
        ) return;
 
        $.translate(this.M.x, this.M.y + 20);
        $.G(() => {
            $.translate(0, 4);
            this.bW._r(60, 6, gs, 1);
        });
        this.br._r(80, 5, gt);
    }
}

class fR extends Y {
    constructor(u) {
        super();
        this.u = u;

        this.br = new ck(() => this.u._a / this.u._U);
        this.bW = new ck(() => this.u.ay);
        this.bq = new ck(() => this._F);

        this.br.ep = 0.1;
        this.bq.ep = 0.1;

        this.bq.b$ = 0;

        this._F = 0;
        this.hU = 0;

        this.hT = new cV();
        this.hS = new dS();

        this.a_ = 0;
    }

    get z() { 
        return 9994; 
    }

    C(A) {
        super.C(A);
        this.br.C(A);
        this.bW.C(A);
        this.bq.C(A);
    }

    _$(B) {
        this.aN(B);

        $.G(() => {
            $.translate(1280 / 2, 50);
            $.G(() => {
                $.translate(0, 10);
                this.bW._r(300, 20, gs, 1);
            });
            this.br._r(400, 20, gt);
        });

        $.G(() => {
            $.globalAlpha = this.hU;

            $.translate(1280 / 2, 720 - 150);
            this.bq._r(600, 10, '#fff', 0, 8);

            $.U = () => '#fff';
            $.shadowColor = '#000';
            $.shadowBlur = 1;

            $.G(() => {
                $.translate(_g(-300, 300, this.bq.b$), 20);
                $.scale(0.5, 0.5);
                this.hT.al();
            });

            $.G(() => {
                $.translate(300, 20);
                $.scale(-0.5, 0.5);
                this.hS.al();
            });
        });

        $.G(() => {
            $.translate(1280 / 2, 90);

            $.fillStyle = '#fff';
            $.strokeStyle = '#000';
            $.lineWidth = 4;
            $.textBaseline = /*nomangle*/'top'/*/nomangle*/;
            $.textAlign = /*nomangle*/'center'/*/nomangle*/;
            $.font = /*nomangle*/'bold 16pt Times New Roman'/*/nomangle*/;
            $.strokeText(/*nomangle*/'SCORE: '/*/nomangle*/ + this.u.aL.toLocaleString(), 0, 0);
            $.fillText(/*nomangle*/'SCORE: '/*/nomangle*/ + this.u.aL.toLocaleString(), 0, 0);
        });

        if (this.u.bp > 0) {
            $.G(() => {
                $.translate(1280 / 2 + 200, 70);

                $.fillStyle = '#fff';
                $.strokeStyle = '#000';
                $.lineWidth = 4;
                $.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
                $.textAlign = /*nomangle*/'right'/*/nomangle*/;
                $.font = /*nomangle*/'bold 36pt Times New Roman'/*/nomangle*/;

                $.rotate(-PI / 32);

                let _f = min(1, (this.u.D - this.u.dR) / 0.1);
                $.scale(1 + 1 - _f, 1 + 1 - _f);

                $.strokeText('X' + this.u.bp, 0, 0);
                $.fillText('X' + this.u.bp, 0, 0);
            });
        }
    }
}

class fQ extends Y {
    constructor() {
        super();
        this._z.push('M', 'aJ');

        this.ax = 90;

        this.af = 1;

        this._a = this._U = 100;

        this.bp = 0;

        this.ay = 1;

        this.cs = this.dT = this.dR = -9;

        this.bo = 200;

        this.cl = 80;
        this.bw = 40;

        this.av = this.aK = 0;

        this.cW = 30;

        this.aS = 100;
        this.bV = this.dQ = 0;

        this.fP = 99;

        this.aR(this._v);

        this.au = [];

        this.F = {
            '_G': 0,
            'K': 0,
            // '_o': 0,
            // '_h': 0,
            '_C': {'x': 0, 'y': 0},
            // '_A': 0,
        };

        this.L = dl({
            o: this, 
        });
    }

    aR(controller) {
        (this.controller = controller)._x(this);
    }

    get _v() {
        return new _J();
    }

    dP(W) {
        return this.D - this.cs < 0.1 ? '#fff' : W;
    }

    C(A) {
        super.C(A);

        this._R = this.D * (this.bb ? 0.5 : 1)

        this.L.C(A);

        this.controller.C(A);

        if (this.bb && this.F._G) {
            this.cq(A * 0.2);
        }

        let fO = this.L._d._p * this.bo;
        
        this.x += cos(this.F.K) * this.F._G * fO * A;
        this.y += sin(this.F.K) * this.F._G * fO * A;

        this.af = sign(this.F._C.x - this.x) || 1;

        // Collisions with dO characters kb obstacles
        for (let aJ of this.g.P('aJ')) {
            if (aJ === this || _Y(this, aJ) > aJ.cW) continue;
            let K = _L(this, aJ);
            this.x = aJ.x - cos(K) * aJ.cW;
            this.y = aJ.y - sin(K) * aJ.cW;
        }

        // Stamina aT
        if (this.D - this.dT > this.fP || this.L._d.ew) {
            this.ay = min(1, this.ay + A * 0.3);
        }

        // Combo reset
        if (this.D - this.dR > 5) {
            this.cQ(-99);
        }
    }

    cQ(value) {
        this.bp = max(0, this.bp + value);
        this.dR = this.D;
    }

    gd(J, V, _k) {
        return this.ar(J, V, _k, PI / 2) > 0;
    }

    hR(M, V, _k) {
        return abs(M.x - this.x) < V && 
            abs(M.y - this.y) < _k;
    }

    ar(J, V, _k, aQ) {
        if (J === this || !V || !_k) return 0;

        let hQ = _L(this, J);
        let cP = _L(this, this.F._C);
        let fN = 1 - abs(iX(hQ - cP)) / (aQ / 2);

        let hP = abs(this.x - J.x);
        let hO = abs(this.y - J.y) / (_k / V);

        let hN = hypot(hP, hO);
        let fM = 1 - hN / V;

        return fM < 0 || fN < 0 
            ? 0
            : (fM + pow(fN, 3));
    }

    fL(V, _k, aQ) {
        return Array
            .from(this.g.P(this.cO))
            .filter((J) => this.ar(J, V, _k, aQ) > 0);
    }

    fK(V, _k, aQ) {
        return this.fL(V, _k, aQ)
            .reduce((bU, dO) => {
                if (!bU) return dO;

                return this.ar(dO, V, V, aQ) > this.ar(bU, V, _k, aQ) 
                    ? dO 
                    : bU;
            }, 0);
        
    }

    iM() {
        let J = this.fK(this.av, this.aK, PI / 2);
        J
            ? this._A(
                _L(this, J), 
                max(0, _Y(this, J) - this.bw / 2), 
                0.1,
            )
            : this._A(
                _L(this, this.F._C), 
                40, 
                0.1,
            );
    }

    strike(dN) {
        ba(...[.1,,400,.1,.01,,3,.92,17,,,,,2,,,,1.04]);

        for (let J of this.fL(this.cl, this.bw, O)) {
            let K = _L(this, J);
            if (J.L._d.iQ) {
                J.af = sign(this.x - J.x) || 1;
                J.dQ++;

                // Push back
                this._A(K + PI, 20, 0.1);

                if (J.L._d.iP) {
                    // Perfect parry, J gets ay back, we lose ours
                    J.ay = 1;
                    J.cQ(1);
                    J.co(/*nomangle*/'Perfect Block!'/*/nomangle*/);

                    let animation = this.g.add(new ic());
                    animation.x = J.x;
                    animation.y = J.y - 30;
                    
                    this.iF = 1; // Disable "ew" bu
                    this.cq(1);

                    for (let dM of this.g.P(J.cO)) {
                        if (J.hR(dM, J.cl * 2, J.bw * 2)) {
                            dM._A(_L(J, dM), 100, 0.2);
                        }
                    }

                    (async () => {
                        this.g._p = 0.1;

                        let B = _m(this.g.P('B'));
                        await B.ca(2);
                        await this.g._c(3 * this.g._p);
                        await B.ca(1);
                        this.g._p = 1;
                    })();

                    ba(...[2.14,,1e3,.01,.2,.31,3,3.99,,.9,,,.08,1.9,,,.22,.34,.12]);
                } else {
                    // Regular parry, J loses ay
                    J.cq(dN * this.aS / 100);
                    J.co(/*nomangle*/'Blocked!'/*/nomangle*/);
                
                    let animation = this.g.add(new ie());
                    animation.x = J.x;
                    animation.y = J.y - 30;

                    ba(...[2.03,,200,,.04,.12,1,1.98,,,,,,-2.4,,,.1,.59,.05,.17]);
                }
            } else {
                J.bT(~~(this.aS * dN));
                J._A(K, this.aS * dN, 0.1);

                // Regen a ak of _a after a kill
                if (!J._a) {
                    this.dL(this._U * 0.1);
                }

                this.cQ(1);

                let fJ = J.x + T(-20, 20);
                let fI = J.y - 30 + T(-20, 20);
                let _X = T(1, 2);

                for (let i = 0 ; i < 20 ; i++) {
                    this.g.add(new cZ(
                        '#900',
                        [_X, _X + T(3, 6)],
                        [fJ, fJ + T(-30, 30)],
                        [fI, fI + T(-30, 30)],
                        T(0.2, 0.4),
                    ));
                }
            }
        }
    }

    co(N, W) {
        if (this.cN) this.cN._e();

        this.cN = this.g.add(new fV(N, W));
        this.cN.x = this.x;
        this.cN.y = this.y - 90;
    }

    cq(_P) {
        this.ay = max(0, this.ay - _P);
        this.dT = this.D;
    }

    bT(_P) {
        this._a = max(0, this._a - _P);
        this.cs = this.D;
        this.bV++;

        if (!this.L._d.ew) this.cq(_P / this._U * 0.3);
        this.cQ(-99);
        this.co('' + _P, this.fH);

        // ko
        if (!this._a) this.dK();
    }

    dL() {}

    _$() {
        let { bb, _R } = this;

        $.translate(this.x, this.y);

        if (true && false) {
            $.G(() => {
                $.lineWidth = 10;
                $.strokeStyle = '#f00';
                $.globalAlpha = 0.1;
                $.beginPath();
                $.ellipse(0, 0, this.cl, this.bw, 0, 0, O);
                $.stroke();

                $.beginPath();
                $.ellipse(0, 0, this.av, this.aK, 0, 0, O);
                $.stroke();
            });
        }

        let hM = $.U || (x => x);
        $.U = x => this.dP(hM(x));

        $.cm(() => {
            if (bb) {
                $.beginPath();
                $.rect(-150, -150, 300, 150);
                $.clip();

                $.translate(0, 10);
            }

            let { af } = this;
            let { cr } = this.L._d;
            if (cr !== undefined) {
                af = sign(cos(cr));
    
                $.translate(0, -30);
                $.rotate(this.L._d.D / 0.3 * af * O);
                $.translate(0, 30);
            }

            $.scale(af, 1);

            $.G(() => this.al(_R));
        });

        if (true) {
            $.fillStyle = '#fff';
            $.strokeStyle = '#000';
            $.lineWidth = 3;
            $.textAlign = /*nomangle*/'center'/*/nomangle*/;
            $.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
            $.font = /*nomangle*/'12pt Courier'/*/nomangle*/;

            let aZ = [];
            if (false) {
                aZ.push(...[
                    /*nomangle*/'State: '/*/nomangle*/ + this.L._d.constructor.hL,
                    /*nomangle*/'HP: '/*/nomangle*/ + ~~this._a + '/' + this._U,
                ]);
            }
            
            if (false) {
                aZ.push(...[
                    /*nomangle*/'AI: '/*/nomangle*/ + this.controller.constructor.hL,
                ]);
            }
            
            if (false) {
                aZ.push(...[
                    /*nomangle*/'Speed: '/*/nomangle*/ + this.bo,
                    /*nomangle*/'Strength: '/*/nomangle*/ + this.aS,
                    /*nomangle*/'Aggro: '/*/nomangle*/ + this.aw,
                ]);
            }
        
            let y = -90;
            for (let N of aZ.reverse()) {
                $.strokeText(N, 0, y);
                $.fillText(N, 0, y);

                y -= 20;
            }
        }
    }

    _A(K, ae, _l) {
        this.g.add(new _j(this, 'x', this.x, this.x + cos(K) * ae, _l));
        this.g.add(new _j(this, 'y', this.y, this.y + sin(K) * ae, _l));
    }

    dK() {
        let _l = 1;

        let au = this.au.concat([1, 0].map((ev) => () => {
            $.slice(30, ev, 0.5);
            $.translate(0, 30);
            this.al();
        }));

        for (let hK of au) {
            let ak = this.g.add(new hJ(hK));
            ak.x = this.x;
            ak.y = this.y;
    
            let K = _L(this, this.F._C) + PI + T(-1, 1) * PI / 4;
            let ae = T(30, 60);
            this.g.add(new _j(ak, 'x', ak.x, ak.x + cos(K) * ae, _l, eB));
            this.g.add(new _j(ak, 'y', ak.y, ak.y + sin(K) * ae, _l, eB));
            this.g.add(new _j(ak, '_V', 0, bh([-1, 1]) * T(PI / 4, PI), _l, eB));
        }

        this.cM();

        this.co(/*nomangle*/'Slain!'/*/nomangle*/, this.fH);

        this._e();

        ba(...[2.1,,400,.03,.1,.4,4,4.9,.6,.3,,,.13,1.9,,.1,.08,.32]);
    }

    cM() {
        for (let i = 0 ; i < 80 ; i++) {
            let K = random() * O;
            let _Y = random() * 40;

            let x = this.x + cos(K) * _Y;
            let y = this.y - 30 + sin(K) * _Y;

            this.g.add(new cZ(
                '#fff',
                [10, 20],
                [x, x + T(-20, 20)],
                [y, y + T(-20, 20)],
                T(0.5, 1),
            ));
        }
    }
}

hI = [0, 255].map(red => cn(1, 1, $ => {
    let _E = $.createRadialGradient(0, 0, 0, 0, 0, 250);
    _E.addColorStop(0, 'rgba(' + red + ',0,0,.1)');
    _E.addColorStop(1, 'rgba(' + red + ',0,0,0)');
    return _E;
}));

class cV extends fQ {
    constructor() {
        super();
        this._z.push('u');

        this.cO = 'H';

        this.aL = 0;

        this.bo = 250;
        this.aS = 30;

        this.fP = 2;

        this.av = this.aK = 250;

        this.a_ = 0;

        this.fH = '#f00';

        this.au = [
            () => $.bx(),
            () => $.dh(),
        ];

        this.L = dl({
            o: this, 
            bA: 1,
            dk: 0.15,
            gE: 1,
            bd: 0.2,
        });
    }

    get _v() {
        return new fG();
    }

    bT(_P) {
        super.bT(_P);
        ba(...[2.07,,71,.01,.05,.03,2,.14,,,,,.01,1.5,,.1,.19,.95,.05,.16]);
    }

    dP(W) {
        return this.D - this.cs < 0.1 ? '#f00' : super.dP(W);
    }

    dL(_P) {
        _P = ~~min(this._U - this._a, _P);
        this._a += _P

        for (let i = _P ; --i > 0 ;) {
            setTimeout(() => {
                let K = random() * O;
                let _Y = random() * 40;

                let x = this.x + T(-10, 10);
                let y = this.y - 30 + sin(K) * _Y;

                this.g.add(new cZ(
                    '#0f0',
                    [5, 10],
                    [x, x + T(-10, 10)],
                    [y, y + T(-30, -60)],
                    T(1, 1.5),
                ));
            }, i * 100);
        }
    }

    _r() {
        let J = this.fK(this.av, this.aK, PI / 2);
        if (J) {
            $.G(() => {
                if (false) return;

                $.globalAlpha = 0.2;
                $.strokeStyle = '#f00';
                $.lineWidth = 5;
                $.setLineDash([10, 10]);
                $.beginPath();
                $.moveTo(this.x, this.y);
                $.lineTo(J.x, J.y);
                $.stroke();
            });
        }

        $.G(() => {
            if (false) return;

            $.translate(this.x, this.y);

            let cP = _L(this, this.F._C);
            $.fillStyle = hI[+!!J];
            $.beginPath();
            $.arc(0, 0, this.av, cP - PI / 4, cP + PI / 4);
            $.lineTo(0, 0);
            $.fill();
        });

        if (true && false) {
            $.G(() => {
                $.fillStyle = '#0f0';
                for (let x = this.x - this.av - 20 ; x < this.x + this.av + 20 ; x += 4) {
                    for (let y = this.y - this.aK - 20 ; y < this.y + this.aK + 20 ; y += 4) {
                        $.globalAlpha = this.ar({ x, y }, this.av, this.aK, PI / 2);
                        $.fillRect(x - 2, y - 2, 4, 4);
                    }
                }
            });
            $.G(() => {
                for (let J of this.g.P(this.cO)) {
                    let ar = this.ar(J, this.av, this.aK, PI / 2);
                    if (!ar) continue;
                    $.lineWidth = ar * 30;
                    $.strokeStyle = '#ff0';
                    $.beginPath();
                    $.moveTo(this.x, this.y);
                    $.lineTo(J.x, J.y);
                    $.stroke();
                }
            });
        }

        super._r();
    }

    al() {
        $.et(this, '#666');
        $.es(this, '#666', () => $.bx());
        $.df(this, '#fec');
        $.dg(this, '#ccc', 25);
        $.er(this, '#666');
        $.eq(this, -70);
    }
}

class fG extends ek {
    // get description() {
    //     return 'cV';
    // }

    C() {
        let x = 0, y = 0;
        if (_w[37] || _w[65]) x = -1;
        if (_w[38] || _w[87]) y = -1;
        if (_w[39] || _w[68]) x = 1;
        if (_w[40] || _w[83]) y = 1;

        let B = _m(this.o.g.P('B'));

        if (x || y) this.o.F.K = atan2(y, x);
        this.o.F._G = x || y ? 1 : 0;
        this.o.F._o = _w[16] || cj || ix.cf;
        this.o.F._h = ci || iy.cf;
        this.o.F._A = _w[32] || _w[17] || iw.cf;

        let hH = (cg.x - 1280 / 2) / (1280 / 2);
        let hG = (cg.y - 720 / 2) / (720 / 2);

        this.o.F._C.x = this.o.x + hH * 1280 / 2 / B._Q;
        this.o.F._C.y = this.o.y + hG * 720 / 2 / B._Q;

        if (bC == 1) {
            let { _q } = _K;
            this.o.F._C.x = this.o.x + (_q.x - _K.x);
            this.o.F._C.y = this.o.y + (_q.y - _K.y);

            this.o.F.K = _L(_K, _q);
            this.o.F._G = _K.bv < 0
                ? 0
                : min(1, _Y(_q, _K) / 50);
        }

        if (x) this.o.af = x;
    }
}

class dJ extends fQ {

    constructor() {
        super();
        this._z.push('H');
        this.cO = 'u';
    }

    _e() {
        super._e();

        // Cancel any remaining aw
        _m(this.g.P('at'))
            .ef(this);
    }

    dK() {
        super.dK();

        for (let u of this.g.P('u')) {
            u.aL += ~~(100 * this.aw * u.bp);
        }
    }

    bT(_P) {
        super.bT(_P);
        ba(...[1.6,,278,,.01,.01,2,.7,-7.1,,,,.07,1,,,.09,.81,.08]);
    }
}

fF = ({
    _o, 
    aI,
}) => {
    class hF extends iu {
        async gh() {
            while (1) {
                // Try eC be near the u
                await this.aW(new ge(300, 300));
                
                // ei for our turn eC _h
                try {
                    await this.race([
                        new gg(3),
                        new gf(),
                    ]);
                } catch (e) {
                    // kd failed eC become d$, _x a new loop
                    continue;
                }

                await this.aW(new gf());

                // Okay we're allowed eC be aggro, let's do it!
                let fE;
                try {
                    await this.race([
                        new gg(500 / this.o.bo),
                        new ge(this.o.cl, this.o.bw),
                    ]);

                    for (let i = aI ; i-- ; ) {
                        await this.aW(new ip(0.5));
                    }
                    await this.aW(new ei(0.5));
                } catch (e) {
                    fE = 1;
                }

                // kd're done attacking, let's allow someone else eC be aggro
                await this.aW(new iq());

                // Retreat a ak so we're not too close eC the u
                let _A = !_o && !fE && random() < 0.5;
                await this.race([
                    new io(300, 300),
                    new ei(_A ? 0.1 : 4),
                    _A 
                        ? new il() 
                        : (_o ? new im() : new _J()),
                ]);
                await this.aW(new ei(1));

                // Rinse kb cz
            }
        }
    }

    return hF;
}

aj = ({
    bS, a$, ac,
    _o, _Z, ab,
    aI,
}) => {
    let _v = fF({ _o, aI });

    let weight = 0
        + (!!_Z * 0.2) 
        + (!!ab * 0.3) 
        + (!!ac * 0.1)
        + (!!(a$ || _o) * 0.3);

    let fD = 0
        + (!!_o * 0.3)
        + (!!_Z * 0.5)
        + (!!ab * 0.7);

    class hE extends dJ {
        constructor() {
            super();

            this.aw = 1;
            if (a$) this.aw += 1;
            if (ac) this.aw += 2;

            this._a = this._U = ~~_g(100, 400, fD);
            this.aS = ac ? 35 : (a$ ? 25 : 10);
            this.bo = _g(120, 50, weight);
    
            if (bS) this.au.push(() => $.gx());
            if (a$) this.au.push(() => $.bx());
            if (_o) this.au.push(() => $.dh());
            if (ac) this.au.push(() => $.gB());
    
            this.L = dl({
                o: this, 
                bA: 0.5,
                bd: _g(0.3, 0.1, fD),
            });
        }

        get _v() {
            return new _v(this);
        }
    
        al() {
            $.gv(this);
            $.et(this, '#666');
            $.es(this, _Z || ab ? '#666' : '#fec', () => {
                if (bS) $.gx(this)
                if (a$) $.bx(this);
                if (ac) $.gB(this);
            });
            $.dg(
                this, 
                _Z 
                    ? '#ccc' 
                    : (ab ? '#444' : '#fec'), 
                22,
            );

            $.df(
                this, 
                ab ? '#666' : '#fec', 
                ab ? '#000' : '#fec',
            );

            if (_o) $.er(this, _Z || ab ? '#666' : '#fec');
            $.eq(this, -70);
            $.gu(this);
        }
    }

    return hE;
};

_o = { _o: 1 };
a$ = { a$: 1, aI: 2 };
bS = { bS: 1, aI: 3 };
ac = { ac: 1, aI: 1 };
_Z = { _Z: 1 };
ab = { ab: 1 };

bR = [
    // Weapon
    hD = aj({ ...bS, }),
    kn = aj({ ...ac, }),
    km = aj({ ...a$, }),

    // Weapon + _Z
    fC = aj({ ...a$, ..._Z, }),
    kl = aj({ ...ac, ..._Z, }),

    // Weapon + _Z + _o
    kk = aj({ ...ac, ..._o, ..._Z, }),
    kj = aj({ ...a$, ..._o, ..._Z, }),

    // Tank
    ki = aj({ ...a$,  ..._o, ...ab, }),
    hC = aj({ ...ac,  ..._o, ...ab, }),
];

cL = [
    bR.slice(0, 3),
    bR.slice(0, 4),
    bR.slice(0, 5),
    bR.slice(0, 7),
    bR,
];

class fB extends dJ {
    constructor() {
        super();
        this._z.push('H');

        this._a = 9999;
    }

    al() {
        $.G(() => {
            $.fillStyle = $.U('#634');
            $.fillRect(-2, 0, 4, -20);
        });
        $.dg(this, '#634', 22);
        $.df(this, '#634');
    }

    _A() {}
}

class dS extends dJ {
    constructor() {
        super();

        this.au = [
            () => $.bx(),
            () => $.dh(),
        ];

        this._a = this._U = 600;
        this.aS = 40;
        this.bo = 100;

        this.L = dl({
            o: this, 
            bA: 0.5,
            bd: 0.2,
        });
    }

    al() {
        $.gv(this);
        $.et(this, '#400');
        $.es(this, '#400', () => $.bx());
        $.df(this, '#fec');
        $.gy(this);
        $.dg(this, '#900', 25);
        $.er(this, '#400');
        $.eq(this, -70);
        $.gu(this);
    }
}

class cK extends Y {
    constructor(M) {
        super();
        this.M = M;
    }

    get z() { 
        return 9994; 
    }

    C(A) {
        super.C(A);
        if (!this.M._a) this._e();
    }

    _$(B) {
        if (
            abs(B.x - this.M.x) < 1280 / 2 / B._Q &&
            abs(B.y - this.M.y) < 720 / 2 / B._Q
        ) return;

        let x = bi(
            B.x - (1280 / 2 - 50) / B._Q, 
            this.M.x,
            B.x + (1280 / 2 - 50) / B._Q,
        );
        let y = bi(
            B.y - (720 / 2 - 50) / B._Q, 
            this.M.y,
            B.y + (720 / 2 - 50) / B._Q,
        );
        $.translate(x, y);

        $.beginPath();
        $.G(() => {
            $.shadowColor = '#000';
            $.shadowBlur = 5;

            $.fillStyle = '#f00';
            $.rotate(_L({x, y}, this.M));
            $.arc(0, 0, 20, -PI / 4, PI / 4, 1);
            $.lineTo(40, 0);
            $.closePath();
            $.fill();

            $.shadowBlur = 0;

            $.fillStyle = '#fff';
            $.beginPath();
            $.arc(0, 0, 15, 0, O, 1);
            $.fill();
        });
        $.clip();

        $.U = () => '#f00';
        $.scale(0.4, 0.4);
        $.translate(0, 30);
        $.scale(this.M.af, 1);
        this.M.al();
    }
}

class hJ extends Y {
    constructor(dI, fA) {
        super();
        this.dI = dI;
        this.fA = fA;
    }

    get z() { 
        return -9990; 
    }

    C(A) {
        super.C(A);
        if (this.D > 5) this._e();

        if (this.D < 0.5) {
            this.g.add(new cZ(
                '#900',
                [3, 6],
                [this.x, this.x + T(-20, 20)],
                [this.y, this.y + T(-20, 20)],
                T(0.5, 1),
            ));
        }
    }

    _$() {
        if (this.D > 3 && this.D % 0.25 < 0.125) return;

        $.translate(this.x, this.y);
        $.rotate(this._V);
        this.dI();
    }
}

// ZzFX - Zuper Zmall Zound Zynth - Micro Edition
// MIT License - Copyright 2019 Frank Force
// https://github.com/KilledByAPixel/ZzFX

// This is a minified build of hB for use in _X coding projects.
// You _i use hy eC set volume.
// Feel free eC minify it further for your own needs!

// 'use strict';

///////////////////////////////////////////////////////////////////////////////

// ZzFXMicro - Zuper Zmall Zound Zynth - v1.1.8

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name ZzFXMicro.min.js
// @js_externs hB, hz, hA, hy, dH
// @language_out ECMASCRIPT_2019
// ==/ClosureCompiler==

let hB = (...z)=> hA(hz(...z)); // generate kb play ba
let hy = .3;    // volume
let _O = 44100; // sample rate
let dH = new AudioContext; // audio context
let hA = (...cJ)=>  // play cJ
{
    // create buffer kb aH
    let buffer = dH.createBuffer(cJ.length, cJ[0].length, _O),
        aH = dH.createBufferSource();

    // copy cJ eC buffer kb play
    cJ.map((d,i)=> buffer.getChannelData(i)./*nomangle*/set/*/nomangle*/(d));
    aH.buffer = buffer;
    aH.connect(dH.destination);
    return aH;
}
let hz = // generate cJ
(
    // parameters
    volume = 1, fz = .05, cI = 220, _h = 0, aG = 0,
    release = .1, shape = 0, hx = 1, dG = 0, fw = 0,
    dF = 0, fv = 0, bn = 0, hw = 0, fu = 0,
    hv = 0, _c = 0, dE = 1, bQ = 0, ft = 0
)=>
{
    // init parameters
    let ah = PI*2,
    sign = v => v>0?1:-1,
    hu = dG *= 500 * ah / _O / _O,
    fs = cI *= (1 + fz*2*random() - fz)
        * ah / _O,
    b=[], t=0, ht=0, i=0, j=1, r=0, c=0, s=0, f, length;

    // scale by sample rate
    _h = _h * _O + 9; // minimum _h eC prevent pop
    bQ *= _O;
    aG *= _O;
    release *= _O;
    _c *= _O;
    fw *= 500 * ah / _O**3;
    fu *= ah / _O;
    dF *= ah / _O;
    fv *= _O;
    bn = bn * _O | 0;

    // generate waveform
    for(length = _h + bQ + aG + release + _c | 0;
        i < length; b[i++] = s)
    {
        if (!(++c%(hv*100|0)))                      // ak crush
        {
            s = shape? shape>1? shape>2? shape>3?         // dv shape
                sin((t%ah)**3) :                    // 4 hw
                max(min(tan(t),1),-1):     // 3 tan
                1-(2*t/ah%2+2)%2:                        // 2 saw
                1-4*abs(round(t/ah)-t/ah):    // 1 triangle
                sin(t);                              // 0 sin

            s = (bn ?
                    1 - ft + ft*sin(ah*i/bn) // ft
                    : 1) *
                sign(s)*(abs(s)**hx) *       // curve 0=square, 2=pointy
                volume * hy * (                        // envelope
                i < _h ? i/_h :                   // _h
                i < _h + bQ ?                      // bQ
                1-((i-_h)/bQ)*(1-dE) :  // bQ falloff
                i < _h  + bQ + aG ?           // aG
                dE :                           // aG volume
                i < length - _c ?                      // release
                (length - i - _c)/release *            // release falloff
                dE :                           // release volume
                0);                                       // post release

            s = _c ? s/2 + (_c > i ? 0 :            // _c
                (i<length-_c? 1 : (length-i)/_c) *  // release _c
                b[i-_c|0]/2) : s;                      // sample _c
        }

        f = (cI += dG += fw) *          // cI
            cos(fu*ht++);                    // fu
        t += f - f*hw*(1 - (sin(i)+1)*1e9%2);     // hw

        if (j && ++j > fv)       // pitch jump
        {
            cI += dF;         // apply pitch jump
            fs += dF;    // also apply eC _x
            j = 0;                          // reset pitch jump time
        }

        if (bn && !(++r % bn)) // cz
        {
            cI = fs;     // reset cI
            dG = hu;             // reset dG
            j = j || 1;                     // reset pitch jump time
        }
    }

    return b;
}

ba = (...hs) => hB(...hs)./*nomangle*/start/*/nomangle*/();

//
// Sonant-X
//
// Copyright (c) 2014 Nicolas Vanhoren
//
// Sonant-X is a fork of js-sonant by Marcus Geelnard kb Jake Taylor. It is
// still published using the same license (zlib license, see below).
//
// Copyright (c) 2011 Marcus Geelnard
// Copyright (c) 2008-2009 Jake Taylor
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted eC anyone eC use this software for any purpose,
// including commercial applications, kb eC alter it kb redistribute it
// freely, subject eC the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//    claim that you wrote the original software. If you use this software
//    in a product, an acknowledgment in the product documentation would be
//    appreciated but is not required.
//
// 2. Altered aH versions must be plainly marked as such, kb must not be
//    misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any aH
//    distribution.


let dD = 44100;                    // Samples per second
let bP = 2;                       // Channels
let bO = 33; // maximum time, in millis, that the generator _i use consecutively

let bm;

// Oscillators
function dC(value)
{
    return sin(value * 6.283184);
}

function hr(value) {
    return dC(value) < 0 ? -1 : 1;
}

function hq(value)
{
    return (value % 1) - 0.5;
}

function hp(value)
{
    let dB = (value % 1) * 4;
    return dB < 2 ? dB - 1 : 3 - dB;
}

// Array of ju functions
let dA = [
    dC,
    hr,
    hq,
    hp
];

function fq(n)
{
    return 0.00390625 * pow(1.059463094, n - 128);
}

function dz(_N, _I) {
    setTimeout(() => {
        // k$ the channel work buffer
        var cH = new Uint8Array(_N * bP * 2);
        var b = cH.length - 2;
        var aF = () => {
            var ho = new Date();
            var count = 0;
            while(b >= 0)
            {
                cH[b] = 0;
                cH[b + 1] = 128;
                b -= 2;
                count += 1;
                if (count % 1000 === 0 && (new Date() - ho) > bO) {
                    setTimeout(aF, 0);
                    return;
                }
            }
            setTimeout(() => _I(cH), 0);
        };
        setTimeout(aF, 0);
    }, 0);
}

function fp(_b, dw, R, _T, _I) {
    let p1 = (R.kh * _T) >> 1;
    let fo = R.kg / 255;

    let cG = 0;
    let aF = () => {
        let aP = new Date();
        let count = 0;
        while (cG < dw - p1) {
            var cF = 4 * cG;
            var l = 4 * (cG + p1);

            // Left channel = left + right[-p1] * fo
            var x1 = _b[l] + (_b[l+1] << 8) +
                (_b[cF+2] + (_b[cF+3] << 8) - 32768) * fo;
            _b[l] = x1 & 255;
            _b[l+1] = (x1 >> 8) & 255;

            // Right channel = right + left[-p1] * fo
            x1 = _b[l+2] + (_b[l+3] << 8) +
                (_b[cF] + (_b[cF+1] << 8) - 32768) * fo;
            _b[l+2] = x1 & 255;
            _b[l+3] = (x1 >> 8) & 255;
            ++cG;
            count += 1;
            if (count % 1000 === 0 && (new Date() - aP) > bO) {
                setTimeout(aF, 0);
                return;
            }
        }
        setTimeout(_I, 0);
    };
    setTimeout(aF, 0);
}

class fn {

    constructor(_n) {
        this._n = _n;
        this._N = _n.length / bP / 2;
    }

    kf() {
        let _n = this._n;
        let _N = this._N;
        // Local variables
        let b, k, x, dv, bl, bN, y;

        // Turn critical d_ properties into local variables (performance)
        let bM = _N * bP * 2;

        // Convert eC a WAVE file (in a binary string)
        bl = bM - 8;
        bN = bl - 36;
        dv = String.fromCharCode(82,73,70,70,
                                   bl & 255,(bl >> 8) & 255,(bl >> 16) & 255,(bl >> 24) & 255,
                                   87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,
                                   68,172,0,0,16,177,2,0,4,0,16,0,100,97,116,97,
                                   bN & 255,(bN >> 8) & 255,(bN >> 16) & 255,(bN >> 24) & 255);
        b = 0;
        while (b < bM) {
            // This is a GC & fO trick: don't add one char at a time - batch up
            // larger partial strings
            x = "";
            for (k = 0; k < 256 && b < bM; ++k, b += 2)
            {
                // ke: kd kc kb ka k_
                y = 4 * (_n[b] + (_n[b+1] << 8) - 32768);
                y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
                x += String.fromCharCode(y & 255, (y >> 8) & 255);
            }
            dv += x;
        }
        return dv;
    }

    fm(_I) {
        if (!bm) {
            bm = new AudioContext();
        }

        let _n = this._n;
        let _N = this._N;

        let buffer = bm.createBuffer(bP, this._N, dD); // k$ jZ jY jX from jW jV
        let hn = buffer.getChannelData(0);
        let hm = buffer.getChannelData(1);
        let b = 0;
        let aF = () => {
            var aP = new Date();
            var count = 0;
            while (b < _N) {
                var y = 4 * (_n[b * 4] + (_n[(b * 4) + 1] << 8) - 32768);
                y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
                hn[b] = y / 32768;
                y = 4 * (_n[(b * 4) + 2] + (_n[(b * 4) + 3] << 8) - 32768);
                y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
                hm[b] = y / 32768;
                b += 1;
                count += 1;
                if (count % 1000 === 0 && new Date() - aP > bO) {
                    setTimeout(aF, 0);
                    return;
                }
            }
            setTimeout(() => _I(buffer), 0);
        };
        setTimeout(aF, 0);
    }
}

class hl {

    constructor(R, _T) {
        this.R = R;
        this._T = _T || 5605;

        this.hk = dA[R.jU];
        this.hj = dA[R.jT];
        this.hi = dA[R.jS];
        this._h = R.jR;
        this.aG = R.jQ;
        this.release = R.jP;
        this.hh = pow(2, R.jO - 8) / this._T;
        this.hg = pow(2, R.jN - 8) / this._T;
    }

    fl(n, _b, cE) {
        var fk = 0;
        var fj = 0;

        // jM jL
        var hf = fq(n + (this.R.jK - 8) * 12 + this.R.jJ) * (1 + 0.0008 * this.R.jI);
        var he = fq(n + (this.R.jH - 8) * 12 + this.R.jG) * (1 + 0.0008 * this.R.jF);

        // bf hd init
        var q = this.R.jE / 255;
        var low = 0;
        var cD = 0;
        for (var j = this._h + this.aG + this.release - 1; j >= 0; --j)
        {
            let k = j + cE;

            // jD
            let fi = this.hk(k * this.hg) * this.R.jC / 512 + 0.5;

            // jB
            let e = 1;
            if (j < this._h)
                e = j / this._h;
            else if (j >= this._h + this.aG)
                e -= (j - this._h - this.aG) / this.release;

            // hc 1
            var t = hf;
            if (this.R.jA) t += fi;
            if (this.R.jz) t *= e * e;
            fk += t;
            var aa = this.hj(fk) * this.R.jy;

            // hc 2
            t = he;
            if (this.R.jx) t *= e * e;
            fj += t;
            aa += this.hi(fj) * this.R.jw;

            // jv ju
            if(this.R.hb) aa += (2*random()-1) * this.R.hb * e;

            aa *= e / 255;

            // bf hd filter
            var f = this.R.jt;
            if(this.R.jr) f *= fi;
            f = 1.5 * sin(f * 3.141592 / dD);
            low += f * cD;
            var high = q * (aa - cD) - low;
            cD += f * high;
            switch(this.R.jq)
            {
                case 1: // jp
                    aa = high;
                    break;
                case 2: // jo
                    aa = low;
                    break;
                case 3: // jn
                    aa = cD;
                    break;
                case 4: // jm
                    aa = low + high;
                    break;
                default:
            }

            // jl & jk volume
            t = dC(k * this.hh) * this.R.jj / 512 + 0.5;
            aa *= 39 * this.R.ji;

            // ha eC 16-ak channel buffer
            k = k * 4;
            if (k + 3 < _b.length) {
                var x = _b[k] + (_b[k+1] << 8) + aa * (1 - t);
                _b[k] = x & 255;
                _b[k+1] = (x >> 8) & 255;
                x = _b[k+2] + (_b[k+3] << 8) + aa * t;
                _b[k+2] = x & 255;
                _b[k+3] = (x >> 8) & 255;
            }
        }
    }

    fh(n, _I) {
        this.du(n, dt => {
            dt.fm(_I);
        });
    }

    du(n, _I) {
        var bufferSize = (this._h + this.aG + this.release - 1) + (32 * this._T);
        var self = this;
        dz(bufferSize, buffer => {
            self.fl(n, buffer, 0);
            fp(buffer, bufferSize, self.R, self._T, function() {
                _I(new fn(buffer));
            });
        });
    }
}

class h_ {

    constructor(aE) {
        this.aE = aE;
        // jh data jg
        this._N = dD * aE.jf; // je aE _X (in cJ)
    }

    h$(R, _n, _I) {
        dz(this._N, _b => {
            // jd/jc some properties/jb (for ja performance)
            var dw = this._N,
                bM = this._N * bP * 2,
                _T = this.aE._T,
                fg = this.aE.fg,
                gZ = new hl(R, _T);

            let cE = 0;
            let p = 0;
            let cC = 0;
            let ff = () => {
                var aP = new Date();
                while (1) {
                    if (cC === 32) {
                        cC = 0;
                        p += 1;
                        continue;
                    }
                    if (p === fg - 1) {
                        setTimeout(_c, 0);
                        return;
                    }
                    var fe = R.p[p];
                    if (fe) {
                        var n = R.c[fe - 1].n[cC];
                        if (n) {
                            gZ.fl(n, _b, cE);
                        }
                    }
                    cE += _T;
                    cC += 1;
                    if (new Date() - aP > bO) {
                        setTimeout(ff, 0);
                        return;
                    }
                }
            };

            let _c = () => fp(_b, dw, R, _T, fd);

            var aD = 0;
            let fd = () => {
                let aP = new Date();
                let count = 0;

                // ha eC j_ buffer
                while(aD < bM) {
                    var x2 = _n[aD] + (_n[aD+1] << 8) + _b[aD] + (_b[aD+1] << 8) - 32768;
                    _n[aD] = x2 & 255;
                    _n[aD+1] = (x2 >> 8) & 255;
                    aD += 2;
                    count += 1;
                    if (count % 1000 === 0 && (new Date() - aP) > bO) {
                        setTimeout(fd, 0);
                        return;
                    }
                }
                setTimeout(_I, 0);
            };
            setTimeout(ff, 0);
        });
    }

    du(_I) {
        dz(this._N, _n => {
            let t = 0;
            let fc = () => {
                if (t < this.aE.gY.length) {
                    t += 1;
                    this.h$(this.aE.gY[t - 1], _n, fc);
                } else {
                    _I(new fn(_n));
                }
            };
            fc();
        });
    }

    fh(_I) {
        this.du(dt => dt.fm(_I));
    }
}

_H = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

gX = {
    "_T": 5513,
    "fg": 10,
    "gY": [
        {
            "jK": 7,
            "jJ": 0,
            "jI": 0,
            "jz": 1,
            "jy": 255,
            "jT": 0,
            "jH": 7,
            "jG": 0,
            "jF": 0,
            "jx": 1,
            "jw": 255,
            "jS": 0,
            "hb": 0,
            "jR": 100,
            "jQ": 0,
            "jP": 3636,
            "ji": 254,
            "jq": 2,
            "jt": 500,
            "jE": 254,
            "kh": 0,
            "kg": 27,
            "jO": 0,
            "jj": 0,
            "jA": 0,
            "jr": 0,
            "jN": 0,
            "jC": 0,
            "jU": 0,
            "p": [
                2,
                2,
                2,
                2,
                2,
                2,
                2,
                2,
                2
            ],
            "c": [
                {
                    "n": _H
                },
                {
                    "n": [
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        135,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        },
        {
            "jK": 8,
            "jJ": 0,
            "jI": 0,
            "jz": 1,
            "jy": 221,
            "jT": 0,
            "jH": 8,
            "jG": 0,
            "jF": 0,
            "jx": 1,
            "jw": 210,
            "jS": 0,
            "hb": 255,
            "jR": 50,
            "jQ": 150,
            "jP": 15454,
            "ji": 229,
            "jq": 3,
            "jt": 11024,
            "jE": 240,
            "kh": 6,
            "kg": 24,
            "jO": 0,
            "jj": 20,
            "jA": 0,
            "jr": 1,
            "jN": 7,
            "jC": 64,
            "jU": 0,
            "p": [
                3,
                3,
                3,
                3,
                3,
                3,
                3,
                3,
                3
            ],
            "c": [
                {
                    "n": _H,
                },
                {
                    "n": _H
                },
                {
                    "n": [
                        0,
                        0,
                        0,
                        0,
                        134,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        134,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        134,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        134,
                        0,
                        0,
                        0
                    ]
                }
            ]
        },
        {
            "jK": 7,
            "jJ": 0,
            "jI": 0,
            "jz": 0,
            "jy": 192,
            "jT": 1,
            "jH": 6,
            "jG": 0,
            "jF": 9,
            "jx": 0,
            "jw": 192,
            "jS": 1,
            "hb": 0,
            "jR": 137,
            "jQ": 2000,
            "jP": 4611,
            "ji": 192,
            "jq": 1,
            "jt": 982,
            "jE": 89,
            "kh": 6,
            "kg": 25,
            "jO": 6,
            "jj": 77,
            "jA": 0,
            "jr": 1,
            "jN": 3,
            "jC": 69,
            "jU": 0,
            "p": [
                0,
                0,
                0,
                0,
                0,
                0,
                4,
                4
            ],
            "c": [
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": [
                        137,
                        0,
                        0,
                        144,
                        0,
                        0,
                        142,
                        0,
                        0,
                        144,
                        0,
                        0,
                        0,
                        149,
                        0,
                        0,
                        144,
                        0,
                        0,
                        142,
                        0,
                        0,
                        144,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        },
        {
            "jK": 7,
            "jJ": 0,
            "jI": 0,
            "jz": 0,
            "jy": 255,
            "jT": 1,
            "jH": 7,
            "jG": 0,
            "jF": 9,
            "jx": 0,
            "jw": 154,
            "jS": 1,
            "hb": 0,
            "jR": 197,
            "jQ": 88,
            "jP": 10614,
            "ji": 45,
            "jq": 0,
            "jt": 11025,
            "jE": 255,
            "kh": 2,
            "kg": 146,
            "jO": 3,
            "jj": 47,
            "jA": 0,
            "jr": 0,
            "jN": 0,
            "jC": 0,
            "jU": 0,
            "p": [
                0,
                5,
                5,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            "c": [
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": [
                        125,
                        0,
                        0,
                        132,
                        0,
                        0,
                        130,
                        0,
                        0,
                        132,
                        0,
                        0,
                        137,
                        0,
                        0,
                        132,
                        0,
                        0,
                        130,
                        0,
                        0,
                        132,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        },
        {
            "jK": 9,
            "jJ": 0,
            "jI": 0,
            "jz": 0,
            "jy": 255,
            "jT": 0,
            "jH": 9,
            "jG": 0,
            "jF": 12,
            "jx": 0,
            "jw": 255,
            "jS": 0,
            "hb": 0,
            "jR": 100,
            "jQ": 0,
            "jP": 14545,
            "ji": 70,
            "jq": 0,
            "jt": 0,
            "jE": 240,
            "kh": 2,
            "kg": 157,
            "jO": 3,
            "jj": 47,
            "jA": 0,
            "jr": 0,
            "jN": 0,
            "jC": 0,
            "jU": 0,
            "p": [
                0,
                0,
                0,
                6,
                6
            ],
            "c": [
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": _H
                },
                {
                    "n": [
                        137,
                        0,
                        0,
                        132,
                        0,
                        0,
                        130,
                        0,
                        0,
                        132,
                        0,
                        0,
                        137,
                        0,
                        0,
                        132,
                        0,
                        0,
                        130,
                        0,
                        0,
                        132,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                }
            ]
        }
    ],
    "jf": 31
}

fb = () => new h_(gX).fh(buffer => {
    let aH = bm.createBufferSource();
    aH.buffer = buffer;
    aH.loop = 1;

    let cB = bm.createGain();
    cB.gain.value = 0.5;
    cB.connect(bm.destination);
    aH.connect(cB);
    aH./*nomangle*/start/*/nomangle*/();

    fb = () => 0;
    gn = (x) => cB.gain.value = x;
});

gn = () => 0;

class cA {
    constructor() {
        this.g = new gW();

        this.g.add(new ii());

        _w = {};
        ci = cj = 0;

        this.g.add(new ig());

        let u = this.g.add(new cV());
        this.g.add(new ga(u));

        this.g.add(new ib());
        this.g.add(new hV());

        for (let i = 2 ; i-- ; ) this.g.add(new bZ());

        for (let i = 0 ; i < 400 ; i++) {
            let ds = new ia();
            ds.x = T(-2, 2) * 1280;
            ds.y = T(-2, 2) * 720;
            this.g.add(ds);
        }

        for (let i = 0 ; i < 20 ; i++) {
            let fa = new bY();
            fa.x = random() * 10000;
            this.g.add(fa);
        }
    }

    C(A) {
        this.g.C(A);
    }

    async f_(x, y) {
        let _S = this.g.add(new cU());
        await this.g.add(new _j(_S, 'am', 0, 1, 1)).await();
        let u = _m(this.g.P('u'));
        let B = _m(this.g.P('B'));
        u.x = x;
        u.y = y;
        B.C(999);
        await this.g.add(new _j(_S, 'am', 1, 0, 1)).await();
        _S._e();
    }
}

class f$ extends cA {
    constructor() {
        super();

        let { g } = this;

        for (let r = 0 ; r < 1 ; r += 1 / 15) {
            let aC = g.add(new bt());
            aC.i$ = 1;
            aC.x = cos(r * O) * 600 + T(-20, 20);
            aC.y = sin(r * O) * 600 + T(-20, 20);
        }

        let B = _m(g.P('B'));
        B.cb = 3;
        B.C(99);

        let u = _m(g.P('u'));
        u._a = 9999;
        u.aR(new ek());

        // Respawn when leaving the area
        (async () => {
            while (1) {
                await g._u(() => eD(u.x, u.y, 0, 0) > 650);
                await this.f_(0, 0);
            }
        })();

        (async () => {
            let eZ = g.add(new hX());
            let _S = g.add(new cU());
            await g.add(new _j(_S, 'am', 1, 0, 2)).await();

            let _M = g.add(new fT());
            _M.N = /*nomangle*/'[CLICK] to follow the path'/*/nomangle*/;
            await new Promise(r => onclick = r);
            _M.N = '';

            fb();

            _i.style[/*nomangle*/'cursor'/*/nomangle*/] = 'none';

            u.aR(new fG());
            await g.add(new _j(eZ, 'am', 1, 0, 2)).await();
            await B.ca(1);

            g.add(new bX(/*nomangle*/'Prologue'/*/nomangle*/))

            // Movement iZ
            _M.N = /*nomangle*/'Use [ARROW KEYS] or [WASD] to move'/*/nomangle*/;
            await g._u(() => eD(u.x, u.y, 0, 0) > 200);
            eZ._e();

            _M.N = '';

            await g._c(1);

            // j$ iZ
            await this.cz(
                _M,
                /*nomangle*/'Press [SPACE] or [CTRL] to roll'/*/nomangle*/,
                async () => {
                    await g._u(() => u.L._d.cr !== undefined);
                    await g._u(() => u.L._d.cr === undefined);
                },
                3,
            );

            // ip iZ
            let cw = () => Array
                .from(g.P('H'))
                .reduce((bU, H) => H.bV + bU, 0);

            for (let r = 0 ; r < 1 ; r += 1 / 5) {
                let H = g.add(new fB());
                H.x = cos(r * O) * 200;
                H.y = sin(r * O) * 200;
                H.cM();
            }

            await this.cz(
                _M,
                /*nomangle*/'[LEFT CLICK] to strike a dummy'/*/nomangle*/,
                async () => {
                    let bL = cw();
                    await g._u(() => cw() > bL);
                },
                10,
            );

            // Charge iZ
            await this.cz(
                _M,
                /*nomangle*/'Hold [LEFT CLICK] to charge a heavy attack'/*/nomangle*/,
                async () => {
                    await g._u(() => u.L._d.az >= 1);

                    let bL = cw();
                    await g._u(() => cw() > bL);
                },
                3,
            );

            // Shield iZ 
            let fC = aj({ a$: 1, _Z: 1, aI: 1, });
            let H = g.add(new fC());
            H._a = 9999;
            H.x = B.x + 1280 / 2 / B.cb + 20;
            H.y = -99;
            g.add(new cK(H));

            await this.cz(
                _M,
                /*nomangle*/'Hold [RIGHT CLICK] or [SHIFT] to block attacks'/*/nomangle*/,
                async () => {
                    let bL = u.dQ;
                    await g._u(() => u.dQ > bL);
                },
                3,
            );

            g.add(new cR(H));

            H._a = H._U = 100;
            _M.N = /*nomangle*/'Now slay them!'/*/nomangle*/;
            await g._u(() => H._a <= 0);

            _M.N = '';
            await g._c(1);

            await g.add(new _j(_S, 'am', 0, 1, 2)).await();

            let bK = g.add(new cT([
                /*nomangle*/'1254 AD'/*/nomangle*/,
                /*nomangle*/'The Kingdom of Syldavia is being invaded by the Northern Empire.'/*/nomangle*/,
                /*nomangle*/'The Syldavian army is outnumbered and outmatched.'/*/nomangle*/,
                /*nomangle*/'One lone soldier decides to take on the emperor himself.'/*/nomangle*/,
            ]));

            await g._c(15);

            await g.add(new _j(bK, 'am', 1, 0, 2)).await();

            aB = new dr();
        })();

        (async () => {
            let H = g.add(new fB());
            H.y = -550;
            H.cM();

            let bu = g.add(new fV(/*nomangle*/'Skip'/*/nomangle*/));
            bu.y = H.y - 30;
            bu.fU = 1;

            while (1) {
                let { bV } = H;
                await g._u(() => H.bV > bV);

                if (confirm(/*nomangle*/'Skip intro?'/*/nomangle*/)) {
                    aB = new dr();
                }
            }
        })();
    }

    async cz(_M, bJ, gU, count) {
        for (let i = 0 ; i < count ; i++) {
            _M.N = bJ + ' (' + i + '/' + count + ')';
            await gU();
        }
        
        _M.N = bJ + ' (' + count + '/' + count + ')';

        await this.g._c(1);
        _M.N = '';
        await this.g._c(1);
    }
}

class dr extends cA {
    constructor(aq = 0, aL = 0) {
        super();

        let { g } = this;

        let eY = aL;

        let u = _m(g.P('u'));
        u.x = aq * 1280;
        u.y = g.aM(u.x);
        u.aL = aL;

        let B = _m(g.P('B'));
        B.C(99);

        let bI = g.add(new fR(u));
        g.add(new eb());

        for (let i = 0 ; i < 15 ; i++) {
            let aC = g.add(new bt());
            aC.x = T(-1, 1) * 1280 / 2;
            aC.y = T(-1, 1) * 720 / 2;
        }

        for (let i = 0 ; i < 20 ; i++) {
            let aV = g.add(new dW());
            aV.width = T(100, 200);
            aV.height = T(200, 400);
            aV._V = random() * O;
            aV.x = random() * 1280 * 5;
            aV.y = random() * 720 * 5;
        }

        // Respawn when far from the path
        (async () => {
            while (1) {
                await g._u(() => abs(u.y - g.aM(u.x)) > 1000 || u.x < B.da - 1280 / 2);

                let x = max(B.da + 1280, u.x);
                await this.f_(x, g.aM(x));
            }
        })();

        async function dq() {
            u.a_ = 1;
            g._p = 0.2;
            await B.ca(3);
            await g._c(1.5 * g._p);
            await B.ca(1);
            g._p = 1;
            u.a_ = 0;
        }

        function eX(gT, gS) {
            return Array.apply(0, Array(gT)).map(() => {
                let H = g.add(new (bh(gS))());
                H.x = u.x + T(-1280 / 2, 1280 / 2);
                H.y = u.y + bh([-1, 1]) * (360 + T(50, 100));
                g.add(new cR(H));
                g.add(new cK(H));
                return H
            });
        }

        // Scenario
        (async () => {
            let _S = g.add(new cU());
            await g.add(new _j(_S, 'am', 1, 0, 2)).await();

            g.add(new bX(/*nomangle*/'The Path'/*/nomangle*/));
            await g._c(2);

            bI._F = bI.bq.b$ = aq / 8;

            let dp = u.x + 1280;
            for ( ; aq < 8 ; aq++) {
                // Show _F
                (async () => {
                    await g._c(1);
                    await g.add(new _j(bI, 'hU', 0, 1, 1)).await();
                    bI._F = aq / 8;

                    // Regen a ak of _a
                    u.dL(u._U * 0.5);

                    await g._c(3);
                    await g.add(new _j(bI, 'hU', 1, 0, 1)).await();
                })();

                let bJ = g.add(new fT());
                (async () => {
                    await g._c(10),
                    bJ.N = /*nomangle*/'Follow the path to the right'/*/nomangle*/;
                })();

                await g._u(() => u.x >= dp);

                bJ._e();
                eY = u.aL;

                this.g.add(new bX(/*nomangle*/'Wave '/*/nomangle*/ + (aq + 1)));

                let gR = eX(
                    3 + aq,
                    cL[min(cL.length - 1, aq)],
                );

                // ei until all enemies are defeated
                await Promise.all(gR.map(H => g._u(() => H._a <= 0)));
                dq();

                this.g.add(new bX(/*nomangle*/'Wave Cleared'/*/nomangle*/));

                dp = u.x + 2560;
                B.da = u.x - 1280;
            }

            // Last dv, reach the ap
            await g._u(() => u.x >= dp);
            let ap = g.add(new dS());
            ap.x = B.x + 1280 + 50;
            ap.y = g.aM(ap.x);
            g.add(new cR(ap));

            await g._u(() => ap.x - u.x < 400);
            await g.add(new _j(_S, 'am', 0, 1, 2 * g._p)).await();

            // Make sure the u is near the ap
            u.x = ap.x - 400;
            u.y = g.aM(u.x);

            let bK = g.add(new cT([
                /*nomangle*/'At last, he faced the emperor.'/*/nomangle*/,
            ]));

            await g._c(3);
            await g.add(new _j(bK, 'am', 1, 0, 2)).await();
            await g.add(new _j(_S, 'am', 1, 0, 2)).await();

            // Give the ap an _J so they _i _x fighting
            let gQ = fF({
                _o: 1, 
                aI: 3,
            });
            ap.aR(new gQ());
            g.add(new cK(ap));

            // Spawn some mobs
            eX(5, cL[cL.length - 1]);

            await g._u(() => ap._a <= 0);

            u._a = u._U = 999;
            gF = 1;

            // Final slomo
            await dq();
            await g.add(new _j(_S, 'am', 0, 1, 2 * g._p)).await();

            // Congrats screen
            let eW = g.add(new cT([
                /*nomangle*/'After an epic fight, the emperor was defeated.'/*/nomangle*/,
                /*nomangle*/'Our hero\'s quest was complete.'/*/nomangle*/,
                /*nomangle*/'Historians estimate his final score was '/*/nomangle*/ + u.aL.toLocaleString() + '.',
            ]));
            await g.add(new _j(eW, 'am', 0, 1, 2 * g._p)).await();
            await g._c(9 * g._p);
            await g.add(new _j(eW, 'am', 1, 0, 2 * g._p)).await();

            // Back eC intro
            aB = new f$();
        })();

        // Game over
        (async () => {
            await g._u(() => u._a <= 0);

            dq();

            let _S = g.add(new cU());
            await g.add(new _j(_S, 'am', 0, 1, 2 * g._p)).await();
            g._p = 2;

            let bK = g.add(new cT([
                // Story
                bh([
                    /*nomangle*/'Failing never affected his will, only his score.'/*/nomangle*/,
                    /*nomangle*/'Giving up was never an option.'/*/nomangle*/,
                    /*nomangle*/'His first attempts weren\'t successful.'/*/nomangle*/,
                    /*nomangle*/'After licking his wounds, he resumed his quest.'/*/nomangle*/,
                ]), 

                // Tip
                bh([
                    /*nomangle*/'His shield would not fail him again ([SHIFT] / [RIGHT CLICK])'/*/nomangle*/,
                    /*nomangle*/'Rolling would help him dodge attacks ([SPACE] / [CTRL])'/*/nomangle*/,
                    /*nomangle*/'Heavy attacks would be key to his success'/*/nomangle*/,
                ]),
            ]));

            await g._c(6);
            await g.add(new _j(bK, 'am', 1, 0, 2)).await();

            // Start a aB where we left off
            aB = new dr(aq, max(0, eY - 5000)); // TODO figure gl a value
        })();
    }
}

class iY extends cA {
    constructor() {
        super();

        let u = _m(this.g.P('u'));
        u._a = u._U = 9999;
        
        this.g.add(new fR(u));

        let B = _m(this.g.P('B'));
        // B.cb = 3;

        // u._a = u._U = Number.MAX_SAFE_INTEGER;

        this.g.add(new eb())

        for (let r = 0 ; r < 1 ; r += 1 / 5) {
            let H = this.g.add(new hD());
            H.x = cos(r * O) * 100;
            H.y = -400 + sin(r * O) * 100;
            H.aR(new _J());
            H._a = H._U = 9999;
            H.cM();

            this.g.add(new cR(H));
            this.g.add(new cK(H));
        }

        // let ap = this.g.add(new dS());
        // ap.x = 400;
        // this.g.add(new cR(ap));

        // for (let r = 0 ; r < 1 ; r += 1 / 10) {
        //     let type = bh(bR);
        //     let H = this.g.add(new type());
        //     H.x = cos(r * O) * 400;
        //     H.y = sin(r * O) * 400;
        //     H.cM();

        //     this.g.add(new cR(H));
        // }

        for (let i = 0 ; i < 20 ; i++) {
            let aC = new bt();
            aC.x = random() * 10000;
            // this.g.add(aC);
        }

        // (async () => {
        //     let y = 0;
        //     for (let type of bR) {
        //         let H = this.g.add(new type());
        //         H.x = u.x + 200;
        //         H.y = u.y;
        //         H.cM();

        //         this.g.add(new cR(H));

        //         await this.g._u(() => H._a <= 0);
        //         await this.g._c(1);
        //     }
        // })();
    }
}

class gP extends cA {
    constructor() {
        super();

        oncontextmenu = () => {};

        let u = _m(this.g.P('u'));
        u.D = 0.4;

        cg.x = Number.MAX_SAFE_INTEGER;
        cg.y = 720 / 2;
        _w[39] = 1;

        let B = _m(this.g.P('B'));
        B.cb = 2;
        B.C(99);

        this.g.add(new eb());

        for (let o of Array.from(this.g.bk)) {
            if (o instanceof bY) o._e();
            if (o instanceof bZ) o._e();
            if (o instanceof ga) o._e();
        }

        let gO = this.g.add(new bX(/*nomangle*/'Path to Glory'/*/nomangle*/));
        gO.D = 1;

        let eV = this.g.add(new bZ());
        eV.x = u.x + 100;
        eV.y = u.y - 200;

        let eU = this.g.add(new bZ());
        eU.x = u.x + 150;
        eU.y = u.y - 150;

        let eT = this.g.add(new bZ());
        eT.x = u.x - 250;
        eT.y = u.y + 50;

        let eS = this.g.add(new bt());
        eS.x = u.x - 200;
        eS.y = u.y - 50;

        let eR = this.g.add(new bt());
        eR.x = u.x + 200;
        eR.y = u.y - 150;

        let eQ = this.g.add(new bt());
        eQ.x = u.x + 300;
        eQ.y = u.y + 150;

        let eP = this.g.add(new bY());
        eP.x = u.x + 100;
        eP.y = u.y - 50;

        let eO = this.g.add(new bY());
        eO.x = u.x - 200;
        eO.y = u.y + 50;

        let eN = this.g.add(new bY());
        eN.x = u.x + 50;
        eN.y = u.y - 200;

        let bH = this.g.add(new dW());
        bH.x = u.x - 100;
        bH.y = u.y - 350;
        bH._V = PI / 8;
        bH.width = 200;
        bH.height = 200;

        let bG = this.g.add(new dW());
        bG.x = u.x + 350;
        bG.y = u.y - 150;
        bG._V = PI / 8;
        bG.width = 200;
        bG.height = 200;

        let aA = this.g.add(new dS());
        aA.x = u.x + 180;
        aA.y = u.y - 30;
        aA.aR(new _J());
        aA.F._C.x = u.x;
        aA.F._C.y = u.y;
        aA.F._h = 1;
        aA.C(0);
        aA.C(0.1);

        let ao = this.g.add(new hC());
        ao.x = u.x - 100;
        ao.y = u.y - 100;
        ao.aR(new _J());
        ao.F._C.x = u.x;
        ao.F._C.y = u.y;
        ao.F._G = 1;
        ao.D = 0.6;
        ao.F.K = _L(ao, u)

        this.C(0); // helps aT ds
    }
}

onresize = () => {
    let eM = innerWidth,
        eL = innerHeight,

        gN = eM / eL, // available _f
        dn = 1280 / 720, // base _f
        cv,
        cu,
        eK = /*nomangle*/t/*/nomangle*/.style;

    if (gN <= dn) {
        cv = eM;
        cu = cv / dn;
    } else {
        cu = eL;
        cv = cu * dn;
    }

    eK.width = cv + 'px';
    eK.height = cu + 'px';
};

_m = (gM) => {
    for (let gL of gM) {
        return gL;
    }
}

class ik {
    constructor() {
        this.bF = 0;
        this.eJ = Array.apply(0, Array(50)).map(() => random());
    }

    next(min = 0, max = 1) {
        return this.eJ[this.bF++ % this.eJ.length] * (max - min) + min;
    }

    reset() {
        this.bF = 0;
    }
}

cX = (o, V, _k, eI = 50) => {
    let B = _m(o.g.P('B'));
    let aT = 0;
    while (o.x < B.x - V) {
        o.x += V * 2;
        aT = 1;
    } 
    
    while (o.x > B.x + V) {
        o.x -= V * 2;
        aT = 1;
    }

    while (o.y < B.y - _k) {
        o.y += V * 2;
    } 
    
    while (o.y > B.y + _k) {
        o.y -= V * 2;
    }

    while (aT) {
        o.y = o.g.aM(o.x) + T(eI, 500) * bh([-1, 1]);
        let gK = abs(o.y - o.g.aM(o.x));
        aT = gK < eI || o.bb;
    }
};


class gW {
    constructor() {
        this.bk = new Set();
        this._z = new Map();
        this.bE = [];

        this._p = 1;
        this.bD = new Set();
    }

    add(o) {
        if (this.bk.has(o)) return;
        this.bk.add(o);
        o.g = this;

        this.bE.push(o);

        for (let P of o._z) {
            if (!this._z.has(P)) {
                this._z.set(P, new Set([o]));
            } else {
                this._z.get(P).add(o);
            }
        }

        return o;
    }

    P(P) {
        return this._z.get(P) || [];
    }

    _e(o) {
        this.bk.delete(o);

        for (let P of o._z) {
            if (this._z.has(P)) {
                this._z.get(P).delete(o);
            }
        }

        let bF = this.bE.indexOf(o);
        if (bF >= 0) this.bE.splice(bF, 1);
    }

    C(A) {
        if (true && _w[70]) A *= 3;
        if (true && _w[71]) A *= 0.1;
        if (bj) return;

        for (let o of this.bk) {
            o.C(A * (o.a_ ? this._p : 1));
        }

        for (let bD of this.bD) {
            bD();
        }
    }

    aM(x) {
        let gJ = sin(x * O / 2000) * 200;
        let gI = sin(x * O / 1000) * 100;
        return gJ + gI;
    }

    _r() {
        let B = _m(this.P('B'));

        // Background
        $.fillStyle = '#996';
        $.fillRect(0, 0, 1280, 720);

        // Thunder
        if (B.D % 10 < 0.3 && B.D % 0.2 < 0.1) {
            $.G(() => {
                $.globalAlpha = 0.3;
                $.fillStyle = '#fff';
                $.fillRect(0, 0, 1280, 720);
            });
        }
        
        $.G(() => {
            $.scale(B._Q, B._Q);
            $.translate(
                1280 / 2 / B._Q - B.x, 
                720 / 2 / B._Q - B.y,
            );

            this.bE.sort((a, b) => a.z - b.z);

            for (let o of this.bE) {
                $.G(() => o._r());
            }
        });
    }

    async _u(gH) {
        return new Promise((_D) => {
            let eH = () => {
                if (gH()) {
                    this.bD.delete(eH);
                    _D();
                }
            };
            this.bD.add(eH);
        })
    }

    async _c(gG) {
        let o = this.add(new Y());
        await this._u(() => o.D > gG);
        o._e();
    }
}

onload = () => {
    _i = document.querySelector(/*nomangle*/'canvas'/*/nomangle*/);
    _i.width = 1280;
    _i.height = 720;

    $ = _i.getContext('2d');

    // if (bC == 1) {
    //     _i.width *= 0.5;
    //     _i.height *= 0.5;
    //     $.scale(0.5, 0.5);
    // }

    onresize();

    if (false) {
        oncontextmenu = () => {};
        $.G(() => {
            _i.width *= 10;
            _i.height *= 10;
            $.scale(10, 10);

            $.translate(1280 / 2, 720 / 2)
            $.scale(5, 5);
            $.translate(0, 30);
            new cV().al();
        });
        return;
    }

    eG();
};

let eF = performance.now();

let aB = new f$();
if (false) aB = new gP();

eG = () => {
    let eE = performance.now();
    let A = (eE - eF) / 1000;
    eF = eE;

    // Game ad
    if (!false) aB.C(A);

    // Rendering
    $.G(() => aB.g._r());

    if (true && !false) {
        $.fillStyle = '#fff';
        $.strokeStyle = '#000';
        $.textAlign = /*nomangle*/'left'/*/nomangle*/;
        $.textBaseline = /*nomangle*/'bottom'/*/nomangle*/;
        $.font = /*nomangle*/'14pt Courier'/*/nomangle*/;
        $.lineWidth = 3;

        let y = 720 - 10;
        for (let cS of [
            /*nomangle*/'FPS: '/*/nomangle*/ + ~~(1 / A),
            /*nomangle*/'Entities: '/*/nomangle*/ + aB.g.bk._X,
        ].reverse()) {
            $.strokeText(cS, 10, y);
            $.fillText(cS, 10, y);
            y -= 20;
        }
    }

    requestAnimationFrame(eG);
}
