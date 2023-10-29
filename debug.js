let w = window;

let can;
let ctx;

let GAME_PAUSED;
let BEATEN;

canvasPrototype = CanvasRenderingContext2D.prototype;

inputMode = navigator.userAgent.match(/*nomangle*//andro|ipho|ipa|ipo/i/*/nomangle*/) ? 1 : 0;

between = (a, b, c) => b < a ? a : (b > c ? c : b);
isBetween = (a, b, c) => a <= b && b <= c || a >= b && b >= c;
rnd = (min, max) => random() * (max - min) + min;
distP = (x1, y1, x2, y2) => hypot(x1 - x2, y1 - y2);
dist = (a, b) => distP(a.x, a.y, b.x, b.y);
normalize = x => moduloWithNegative(x, PI);
angleBetween = (a, b) => atan2(b.y - a.y, b.x - a.x);
roundToNearest = (x, precision) => round(x / precision) * precision;
pick = a => a[~~(random() * a.length)];
interpolate = (from, to, ratio) => between(0, ratio, 1) * (to - from) + from;

// Easing
linear = x => x;
easeOutQuint = x => 1 - pow(1 - x, 5);

// Modulo centered around zero: the result will be between -y and +y
moduloWithNegative = (x, y) => {
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

TWO_PI = PI * 2;

class StateMachine {
    transitionToState(state) {
        state.stateMachine = this;
        state.previous = this.state || new State();
        state.onEnter();
        this.state = state;
    }

    cycle(elapsed) {
        this.state.cycle(elapsed);
    }
}

class State {

    constructor() {
        this.age = 0;
    }

    get swordRaiseRatio() { return 0; }
    get shieldRaiseRatio() { return 0; }
    get speedRatio() { return 1; }
    get attackPreparationRatio() { return 0; }

    onEnter() {

    }

    cycle(elapsed) {
        this.age += elapsed;
    }
}

characterStateMachine = ({
    entity,
    chargeTime,
    perfectParryTime,
    releaseAttackBetweenStrikes,
    staggerTime,
}) => {
    let { controls } = entity;
    let stateMachine = new StateMachine();

    let attackDamagePattern = [
        0.7,
        0.8,
        0.9,
        1,
        3,
    ];

    chargeTime = chargeTime || 1;
    perfectParryTime = perfectParryTime || 0;
    staggerTime = staggerTime || 0;

    class MaybeExhaustedState extends State {
        cycle(elapsed) {
            super.cycle(elapsed);
            if (entity.stamina === 0) {
                stateMachine.transitionToState(new Exhausted());
            }
            if (entity.age - entity.lastDamage < staggerTime) {
                stateMachine.transitionToState(new Staggered());
            }
        }
    }
    
    class Idle extends MaybeExhaustedState {
        get swordRaiseRatio() { return interpolate(this.previous.swordRaiseRatio, 0, this.age / 0.1); }
        get shieldRaiseRatio() { return interpolate(this.previous.shieldRaiseRatio, 0, this.age / 0.1); }

        get speedRatio() { 
            return entity.inWater ? 0.5 : 1; 
        }

        cycle(elapsed) {
            super.cycle(elapsed);
            if (controls.shield) {
                stateMachine.transitionToState(new Shielding());
            } else if (controls.attack) {
                stateMachine.transitionToState(new Charging());
            } else if (controls.dash) {
                stateMachine.transitionToState(new Dashing());
            }
        }
    }

    class Shielding extends MaybeExhaustedState {
        get speedRatio() { 
            return 0.5; 
        }

        get shieldRaiseRatio() { return interpolate(0, 1, this.age / 0.1); }
        get swordRaiseRatio() { return interpolate(0, -1, this.age / 0.1); }
        get shielded() { return 1; }
        get perfectParry() { return this.age < perfectParryTime; }

        cycle(elapsed) {
            super.cycle(elapsed);
            if (!controls.shield) {
                stateMachine.transitionToState(new Idle());
            }
        }
    }

    class Dashing extends State {

        get swordRaiseRatio() { 
            return interpolate(this.previous.swordRaiseRatio, -1, this.age / (0.3 / 2)); 
        }

        onEnter() {
            this.dashAngle = entity.controls.angle;

            entity.dash(entity.controls.angle, 200, 0.3);
            sound(...[1.99,,427,.01,,.07,,.62,6.7,-0.7,,,,.2,,,.11,.76,.05]);

            entity.loseStamina(0.15);
        }

        cycle(elapsed) {
            super.cycle(elapsed);

            if (this.age > 0.3) {
                stateMachine.transitionToState(new Idle());
            }
        }
    }

    class Charging extends MaybeExhaustedState {
        constructor(counter = 0) {
            super();
            this.counter = counter;
        }

        get speedRatio() { 
            return 0.5; 
        }

        get attackPreparationRatio() {
            return this.age / chargeTime;
        }

        get swordRaiseRatio() { 
            return interpolate(this.previous.swordRaiseRatio, -1, this.attackPreparationRatio); 
        }

        cycle(elapsed) {
            let { attackPreparationRatio } = this;

            super.cycle(elapsed);

            if (!controls.attack) {
                let counter = this.age >= 1 ? attackDamagePattern.length - 1 : this.counter;
                stateMachine.transitionToState(new Strike(counter));
            }

            if (attackPreparationRatio < 1 && this.attackPreparationRatio >= 1) {
                let animation = entity.scene.add(new FullCharge());
                animation.x = entity.x - entity.facing * 20;
                animation.y = entity.y - 60;
            }
        }
    }

    class Strike extends MaybeExhaustedState {
        constructor(counter = 0) {
            super();
            this.counter = counter;
            this.prepareRatio = -min(3, this.counter + 1) * 0.4;
        }

        get swordRaiseRatio() { 
            return this.age < 0.05 
                ? interpolate(
                    this.previous.swordRaiseRatio, 
                    this.prepareRatio, 
                    this.age / 0.05,
                )
                : interpolate(
                    this.prepareRatio, 
                    1, 
                    (this.age - 0.05) / (0.15 - 0.05),
                );   
        }

        onEnter() {
            entity.lunge();

            this.anim = new SwingEffect(
                entity, 
                this.counter == attackDamagePattern.length - 1 ? '#ff0' : '#fff', 
                this.prepareRatio, 
                0,
            );
        }

        cycle(elapsed) {
            super.cycle(elapsed);

            if (this.age >= 0.05) {
                entity.scene.add(this.anim);
                this.anim.toAngle = this.swordRaiseRatio;
            }

            if (controls.attack) this.didTryToAttackAgain = 1;
            if (controls.dash) this.didTryToDash = 1;

            if (this.age > 0.15) {
                entity.strike(attackDamagePattern[this.counter]);

                if (this.didTryToDash) {
                    stateMachine.transitionToState(new Dashing());   
                    return; 
                }

                stateMachine.transitionToState(
                    this.counter < 3
                        ? this.didTryToAttackAgain
                            ? new Charging(this.counter + 1)
                            : new LightRecover(this.counter)
                        : new HeavyRecover()
                );
            }
        }
    }

    class LightRecover extends MaybeExhaustedState {
        constructor(counter) {
            super();
            this.counter = counter;
        }

        get swordRaiseRatio() { 
            let start = 1;
            let end = 0;

            let ratio = min(1, this.age / 0.05); 
            return ratio * (end - start) + start;
        }

        cycle(elapsed) {
            super.cycle(elapsed);

            if (!controls.attack || !releaseAttackBetweenStrikes) {
                this.readyToAttack = 1;
            }

            if (this.age > 0.3) {
                stateMachine.transitionToState(new Idle());
            } else if (controls.attack && this.readyToAttack) {
                stateMachine.transitionToState(new Charging(this.counter + 1));
            } else if (controls.shield) {
                stateMachine.transitionToState(new Shielding());
            } else if (controls.dash) {
                stateMachine.transitionToState(new Dashing());
            }
        }
    }

    class HeavyRecover extends MaybeExhaustedState {

        get swordRaiseRatio() { 
            let start = 1;
            let end = 0;

            let ratio = min(this.age / 0.5, 1); 
            return ratio * (end - start) + start;
        }

        cycle(elapsed) {
            super.cycle(elapsed);

            if (this.age > 0.5) {
                stateMachine.transitionToState(new Idle());
            } else if (controls.dash) {
                stateMachine.transitionToState(new Dashing());
            }
        }
    }

    class Exhausted extends State {
        get swordRaiseRatio() { 
            return interpolate(this.previous.swordRaiseRatio, 1, this.age / 0.2); 
        }

        get exhausted() {
            return 1;
        }
        
        get speedRatio() { 
            return 0.5; 
        }

        onEnter() {
            if (!entity.perfectlyBlocked) entity.displayLabel(/*nomangle*/'Exhausted'/*/nomangle*/);
            entity.perfectBlocked = 0;
        }

        cycle(elapsed) {
            super.cycle(elapsed);

            if (entity.stamina >= 1) {
                stateMachine.transitionToState(new Idle());
            }
        }
    }

    class Staggered extends State {
        get swordRaiseRatio() { 
            return this.previous.swordRaiseRatio; 
        }
        
        get speedRatio() { 
            return 0.5; 
        }

        cycle(elapsed) {
            super.cycle(elapsed);

            if (this.age >= staggerTime) {
                stateMachine.transitionToState(new Idle());
            }
        }
    }

    stateMachine.transitionToState(new Idle());

    return stateMachine;
}

createCanvas = (w, h, render) => {
    let can = document.createElement('canvas');
    can.width = w;
    can.height = h;

    let ctx = can.getContext('2d');

    return render(ctx, can) || can;
};

canvasPrototype.slice = (radius, sliceUp, ratio) => {
    ctx.beginPath();
    if (sliceUp) {
        ctx.moveTo(-radius, -radius);
        ctx.lineTo(radius, -radius);
    } else {
        ctx.lineTo(-radius, radius);
        ctx.lineTo(radius, radius);
    }

    ctx.lineTo(radius, -radius * ratio);
    ctx.lineTo(-radius, radius * ratio);
    ctx.clip();
};

canvasPrototype.wrap = function(f) {
    let { resolveColor } = this;
    this.save();
    f();
    this.restore();
    this.resolveColor = resolveColor || (x => x);
};

canvasPrototype.resolveColor = x => x;

canvasPrototype.withShadow = function(render) {
    this.wrap(() => {
        this.isShadow = 1;
        this.resolveColor = () => 'rgba(0,0,0,.2)';

        ctx.scale(1, 0.5);
        ctx.transform(1, 0, 0.5, 1, 0, 0); // shear the context
        render();
    });

    this.wrap(() => {
        this.isShadow = 0;
        render();
    });
};

exclamation = createCanvas(50, 50, (ctx, can) => {
    ctx.fillStyle = '#fff';
    ctx.translate(can.width / 2, can.width / 2);
    for (let r = 0, i = 0 ; r < 1 ; r += 0.05, i++) {
        let distance = i % 2 ? can.width / 2 : can.width / 3;
        ctx.lineTo(
            cos(r * TWO_PI) * distance,
            sin(r * TWO_PI) * distance,
        )
    }
    ctx.fill();

    ctx.font = /*nomangle*/'bold 18pt Arial'/*/nomangle*/;
    ctx.fillStyle = '#f00';
    ctx.textAlign = /*nomangle*/'center'/*/nomangle*/;
    ctx.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
    ctx.fillText('!!!', 0, 0);
});

canvasPrototype.renderSword = function() {
    with (this) wrap(() => {
        fillStyle = resolveColor('#444');
        fillRect(-10, -2, 20, 4);
        fillRect(-3, 0, 6, 12);

        fillStyle = resolveColor('#fff');
        beginPath();
        moveTo(-3, 0);
        lineTo(-5, -35);
        lineTo(0, -40);
        lineTo(5, -35);
        lineTo(3, 0);
        fill();
    });
};

canvasPrototype.renderAxe = function() {
    with (this) wrap(() => {
        fillStyle = resolveColor('#634');
        fillRect(-2, 12, 4, -40);

        translate(0, -20);

        let radius = 10;

        fillStyle = resolveColor('#eee');

        beginPath();
        arc(0, 0, radius, -PI / 4, PI / 4);
        arc(0, radius * hypot(1, 1), radius, -PI / 4, -PI * 3 / 4, 1);
        arc(0, 0, radius, PI * 3 / 4, -PI * 3 / 4);
        arc(0, -radius * hypot(1, 1), radius, PI * 3 / 4, PI / 4, 1);
        fill();
    });
};

canvasPrototype.renderShield = function() {
    with (this) wrap(() => {
        fillStyle = resolveColor('#fff');

        for (let [bitScale, col] of [[0.8, resolveColor('#fff')], [0.6, resolveColor('#888')]]) {
            fillStyle = col;
            scale(bitScale, bitScale);
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

canvasPrototype.renderLegs = function(entity, color) {
    with (this) wrap(() => {
        let { age } = entity;

        translate(0, -32);

        // Left leg
        wrap(() => {
            fillStyle = resolveColor(color);
            translate(-6, 12);
            if (entity.controls.force) rotate(-sin(age * TWO_PI * 4) * PI / 16);
            fillRect(-4, 0, 8, 20);
        });

        // Right leg
        wrap(() => {
            fillStyle = resolveColor(color);
            translate(6, 12);
            if (entity.controls.force) rotate(sin(age * TWO_PI * 4) * PI / 16);
            fillRect(-4, 0, 8, 20);
        });
    });
};

canvasPrototype.renderChest = function(entity, color, width = 25) {
    with (this) wrap(() => {
        let { renderAge } = entity;

        translate(0, -32);

        // Breathing
        translate(0, sin(renderAge * TWO_PI / 5) * 0.5);
        rotate(sin(renderAge * TWO_PI / 5) * PI / 128);

        fillStyle = resolveColor(color);
        if (entity.controls.force) rotate(-sin(renderAge * TWO_PI * 4) * PI / 64);
        fillRect(-width / 2, -15, width, 30);
    });
}

canvasPrototype.renderHead = function(entity, color, slitColor = 0) {
    with (this) wrap(() => {
        let { renderAge } = entity;

        fillStyle = resolveColor(color);
        translate(0, -54);
        if (entity.controls.force) rotate(-sin(renderAge * TWO_PI * 4) * PI / 32);
        fillRect(-6, -7, 12, 15);

        fillStyle = resolveColor(slitColor);
        if (slitColor) fillRect(4, -5, -6, 4);
    });
}

canvasPrototype.renderCrown = function(entity) {
    with (this) wrap(() => {
        fillStyle = resolveColor('#ff0');
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

canvasPrototype.renderStick = function() {
    this.fillStyle = this.resolveColor('#444');
    this.fillRect(-3, 10, 6, -40);
}

canvasPrototype.renderArm = function(entity, color, renderTool) {
    with (this) wrap(() => {
        if (!entity.health) return;

        let { renderAge } = entity;

        translate(11, -42);
        
        fillStyle = resolveColor(color);
        if (entity.controls.force) rotate(-sin(renderAge * TWO_PI * 4) * PI / 32);
        rotate(entity.stateMachine.state.swordRaiseRatio * PI / 2);

        // Breathing
        rotate(sin(renderAge * TWO_PI / 5) * PI / 32);

        fillRect(0, -3, 20, 6);

        translate(18, -6);
        renderTool();
    });
}

canvasPrototype.renderArmAndShield = function(entity, armColor) {
    with (this) wrap(() => {
        let { renderAge } = entity;

        translate(0, -32);

        fillStyle = resolveColor(armColor);
        translate(-10, -8);
        if (entity.controls.force) rotate(-sin(renderAge * TWO_PI * 4) * PI / 32);
        rotate(PI / 3);
        rotate(entity.stateMachine.state.shieldRaiseRatio * -PI / 3);

        // Breathing
        rotate(sin(renderAge * TWO_PI / 5) * PI / 64);

        let armLength = 10 + 15 * entity.stateMachine.state.shieldRaiseRatio;
        fillRect(0, -3, armLength, 6);

        // Shield
        wrap(() => {
            translate(armLength, 0);
            renderShield();
        });
    });
};

canvasPrototype.renderExhaustion = function(entity, y) {
    if (!entity.health) return;

    if (entity.stateMachine.state.exhausted) {
        this.wrap(() => {
            this.translate(0, y);
            this.fillStyle = this.resolveColor('#ff0');
            for (let r = 0 ; r < 1 ; r += 0.15) {
                let angle = r * TWO_PI + entity.age * PI;
                this.fillRect(cos(angle) * 15, sin(angle) * 15 * 0.5, 4, 4);
            }
        });
    }
};

canvasPrototype.renderAttackIndicator = function(entity) {
    if (false) return;

    with (this) wrap(() => {
        if (!entity.health) return;

        let progress = entity.stateMachine.state.attackPreparationRatio;
        if (progress > 0 && !this.isShadow) {
            strokeStyle = 'rgba(255,0,0,1)';
            fillStyle = 'rgba(255,0,0,.5)';
            globalAlpha = interpolate(0.5, 0, progress);
            lineWidth = 10;
            beginPath();
            scale(1 - progress, 1 - progress);
            ellipse(0, 0, entity.strikeRadiusX, entity.strikeRadiusY, 0, 0, TWO_PI);
            fill();
            stroke();
        }
    });
};

canvasPrototype.renderExclamation = function(entity) {
    with (this) wrap(() => {
        if (!entity.health) return;

        translate(0, -100 + pick([-2, 2]));

        if (entity.stateMachine.state.attackPreparationRatio > 0 && !isShadow) {
            let progress = min(1, 2 * entity.stateMachine.state.age / 0.25);
            scale(progress, progress);
            drawImage(exclamation, -exclamation.width / 2, -exclamation.height / 2);
        }
    });
};

healthGradient = createCanvas(400, 1, (ctx) => {
    let grad = ctx.createLinearGradient(-200, 0, 200, 0);
    grad.addColorStop(0, '#900');
    grad.addColorStop(1, '#f44');
    return grad;
});

staminaGradient = createCanvas(400, 1, (ctx) => {
    let grad = ctx.createLinearGradient(-200, 0, 200, 0);
    grad.addColorStop(0, '#07f');
    grad.addColorStop(1, '#0ef');
    return grad;
});

class Gauge {
    constructor(getValue) {
        this.getValue = getValue;
        this.value = this.displayedValue = 1;
        this.regenRate = 0.5;
    }

    cycle(elapsed) {
        this.displayedValue += between(
            -elapsed * 0.5, 
            this.getValue() - this.displayedValue, 
            elapsed * this.regenRate,
        );
    }

    render(width, height, color, half, ridgeCount) {
        function renderGauge(
            width,
            height, 
            value,
            color,
        ) {
            ctx.wrap(() => {
                let displayedMaxX = interpolate(height / 2, width, value);
                if (value === 0) return;

                ctx.translate(-width / 2, 0);

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.lineTo(0, height / 2);

                if (!half) {
                    ctx.lineTo(height / 2, 0);
                    ctx.lineTo(displayedMaxX - height / 2, 0);
                }

                ctx.lineTo(displayedMaxX, height / 2);
                ctx.lineTo(displayedMaxX - height / 2, height);
                ctx.lineTo(height / 2, height);
                ctx.fill();
            })
        }

        ctx.wrap(() => {
            ctx.wrap(() => {
                ctx.globalAlpha *= 0.5;
                renderGauge(width + 8, height + 4, 1, '#000');
            });

            ctx.translate(0, 2);
            renderGauge(width, height, this.displayedValue, '#fff');
            renderGauge(width, height, min(this.displayedValue, this.getValue()), color);

            ctx.globalAlpha *= 0.5;
            ctx.fillStyle = '#000';
            for (let r = 1 / ridgeCount ; r < 1 ; r += 1 / ridgeCount) {
                ctx.fillRect(r * width - width / 2, 0, 1, height);
            }
        });
    }
}

LOGO_GRADIENT = createCanvas(1, 1, (ctx) => {
    let grad = ctx.createLinearGradient(0, 0, 0, -150);
    grad.addColorStop(0, '#888');
    grad.addColorStop(0.7, '#eee');
    grad.addColorStop(1, '#888');
    return grad;
});

canvasPrototype.renderLargeText = function (bits) {
    with (this) {
        textBaseline = /*nomangle*/'alphabetic'/*/nomangle*/;
        textAlign = /*nomangle*/'left'/*/nomangle*/;
        fillStyle = LOGO_GRADIENT;
        strokeStyle = '#000';
        lineWidth = 4;
        shadowColor = '#000';

        let x = 0;
        for (let [text, size, offsetWidth] of bits) {
            font = size + /*nomangle*/'px Times New Roman'/*/nomangle*/;
            x += measureText(text).width + (offsetWidth || 0);
        }

        translate(-x / 2, 0);

        x = 0;
        for (let [text, size, offsetWidth] of bits) {
            font = size + /*nomangle*/'px Times New Roman'/*/nomangle*/;

            shadowBlur = 5;
            strokeText(text, x, 0);

            shadowBlur = 0;
            fillText(text, x, 0);

            x += measureText(text).width + (offsetWidth || 0);
        }

        return x;
    }
};

canvasPrototype.renderInstruction = function(text) {
    with (this) {
        textBaseline = /*nomangle*/'middle'/*/nomangle*/;
        textAlign = /*nomangle*/'center'/*/nomangle*/;
        strokeStyle = '#000';
        lineWidth = 4;
        font = /*nomangle*/'18pt Times New Roman'/*/nomangle*/;

        let width = measureText(text).width + 20;
        fillStyle = 'rgba(0,0,0,.5)';
        fillRect(-width / 2, 0, width, 40);

        fillStyle = '#fff';
        strokeText(text, 0, 20);
        fillText(text, 0, 20);
    }
};

let DOWN = {};
onkeydown = e => {
    if (e.keyCode == 27 || e.keyCode == 80) {
        GAME_PAUSED = !GAME_PAUSED;
        setSongVolume(GAME_PAUSED ? 0 : 0.5);
    }
    DOWN[e.keyCode] = 1
};
onkeyup = e => DOWN[e.keyCode] = 0;

// Reset inputs when window loses focus
onblur = onfocus = () => {
    DOWN = {};
    MOUSE_RIGHT_DOWN = MOUSE_DOWN = 0;
};

MOUSE_DOWN = 0;
MOUSE_RIGHT_DOWN = 0;
MOUSE_POSITION = {x: 0, y: 0};

onmousedown = (evt) => evt.button == 2 ? MOUSE_RIGHT_DOWN = 1 : MOUSE_DOWN = 1;
onmouseup = (evt) => evt.button == 2 ? MOUSE_RIGHT_DOWN = 0 : MOUSE_DOWN = 0;
onmousemove = (evt) => getEventPosition(evt, can, MOUSE_POSITION);

oncontextmenu = (evt) => evt.preventDefault();

getEventPosition = (event, can, out) => {
    if (!can) return;
    let canvasRect = can.getBoundingClientRect();
    out.x = (event.pageX - canvasRect.left) / canvasRect.width * can.width;
    out.y = (event.pageY - canvasRect.top) / canvasRect.height * can.height;
}

class MobileJoystick {
    constructor() {
        this.x = this.y = 0;
        this.touch = {'x': 0, 'y': 0};
        this.touchIdentifier = -1;
    }

    render() {
        if (this.touchIdentifier < 0) return;

        let extraForceRatio = between(0, (dist(this, this.touch) - 50) / (150 - 50), 1);
        let radius = (1 - extraForceRatio) * 50;

        TOUCH_CONTROLS_CTX.globalAlpha = interpolate(0.5, 0, extraForceRatio);
        TOUCH_CONTROLS_CTX.strokeStyle = '#fff';
        TOUCH_CONTROLS_CTX.lineWidth = 2;
        TOUCH_CONTROLS_CTX.fillStyle = 'rgba(0,0,0,0.5)';
        TOUCH_CONTROLS_CTX.beginPath();
        TOUCH_CONTROLS_CTX.arc(this.x, this.y, radius * devicePixelRatio, 0, TWO_PI);
        TOUCH_CONTROLS_CTX.fill();
        TOUCH_CONTROLS_CTX.stroke();

        TOUCH_CONTROLS_CTX.globalAlpha = 0.5;
        TOUCH_CONTROLS_CTX.fillStyle = '#fff';
        TOUCH_CONTROLS_CTX.beginPath();
        TOUCH_CONTROLS_CTX.arc(this.touch.x, this.touch.y, 30 * devicePixelRatio, 0, TWO_PI);
        TOUCH_CONTROLS_CTX.fill();
    }
}

class MobileButton {
    constructor(
        x, 
        y,
        label,
    ) {
        this.x = x; 
        this.y = y;
        this.label = label;
    }

    render() {
        TOUCH_CONTROLS_CTX.translate(this.x(), this.y());

        TOUCH_CONTROLS_CTX.scale(devicePixelRatio, devicePixelRatio);

        TOUCH_CONTROLS_CTX.strokeStyle = '#fff';
        TOUCH_CONTROLS_CTX.lineWidth = 2;
        TOUCH_CONTROLS_CTX.fillStyle = this.down ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
        TOUCH_CONTROLS_CTX.beginPath();
        TOUCH_CONTROLS_CTX.arc(0, 0, 35, 0, TWO_PI);
        TOUCH_CONTROLS_CTX.fill();
        TOUCH_CONTROLS_CTX.stroke();

        TOUCH_CONTROLS_CTX.font = /*nomangle*/'16pt Courier'/*/nomangle*/;
        TOUCH_CONTROLS_CTX.textAlign = /*nomangle*/'center'/*/nomangle*/;
        TOUCH_CONTROLS_CTX.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
        TOUCH_CONTROLS_CTX.fillStyle = '#fff';
        TOUCH_CONTROLS_CTX.fillText(this.label, 0, 0);
    }
}

updateTouches = (touches) => {
    for (let button of TOUCH_BUTTONS) {
        button.down = 0;
        for (let touch of touches) {
            getEventPosition(touch, TOUCH_CONTROLS_CANVAS, touch);
            if (
                abs(button.x() - touch.x) < 35 * devicePixelRatio &&
                abs(button.y() - touch.y) < 35 * devicePixelRatio
            ) {
                button.down = 1;
            }
        }
    }

    let movementTouch;
    for (let touch of touches) {
        if (
            touch.identifier === TOUCH_JOYSTICK.touchIdentifier || 
            touch.x < TOUCH_CONTROLS_CANVAS.width / 2
        ) {
            movementTouch = touch;
            break;
        }
    }

    if (movementTouch) {
        if (TOUCH_JOYSTICK.touchIdentifier < 0) {
            TOUCH_JOYSTICK.x = movementTouch.x;
            TOUCH_JOYSTICK.y = movementTouch.y;
        }
        TOUCH_JOYSTICK.touchIdentifier = movementTouch.identifier;
        TOUCH_JOYSTICK.touch.x = movementTouch.x;
        TOUCH_JOYSTICK.touch.y = movementTouch.y;
    } else {
        TOUCH_JOYSTICK.touchIdentifier = -1;
    }
};

ontouchstart = (event) => {
    inputMode = 1;
    event.preventDefault();
    updateTouches(event.touches);
};

ontouchmove = (event) => {
    event.preventDefault();
    updateTouches(event.touches);
};

ontouchend = (event) => {
    event.preventDefault();
    updateTouches(event.touches);

    if (onclick) onclick();
};

renderTouchControls = () => {
    TOUCH_CONTROLS_CANVAS.style.display = inputMode == 1 ? 'block' : 'hidden';
    TOUCH_CONTROLS_CANVAS.width = innerWidth * devicePixelRatio;
    TOUCH_CONTROLS_CANVAS.height = innerHeight * devicePixelRatio;

    for (let button of TOUCH_BUTTONS.concat([TOUCH_JOYSTICK])) {
        TOUCH_CONTROLS_CTX.wrap(() => button.render());
    }

    requestAnimationFrame(renderTouchControls);
}

TOUCH_CONTROLS_CANVAS = document.createElement(/*nomangle*/'canvas'/*/nomangle*/);
TOUCH_CONTROLS_CTX = TOUCH_CONTROLS_CANVAS.getContext('2d');

TOUCH_BUTTONS = [
    TOUCH_ATTACK_BUTTON = new MobileButton(
        () => TOUCH_CONTROLS_CANVAS.width - 175 * devicePixelRatio,
        () => TOUCH_CONTROLS_CANVAS.height - 75 * devicePixelRatio,
        /*nomangle*/'ATK'/*/nomangle*/,
    ),
    TOUCH_SHIELD_BUTTON = new MobileButton(
        () => TOUCH_CONTROLS_CANVAS.width - 75 * devicePixelRatio,
        () => TOUCH_CONTROLS_CANVAS.height - 75 * devicePixelRatio,
        /*nomangle*/'DEF'/*/nomangle*/,
    ),
    TOUCH_DASH_BUTTON = new MobileButton(
        () => TOUCH_CONTROLS_CANVAS.width - 125 * devicePixelRatio,
        () => TOUCH_CONTROLS_CANVAS.height - 150 * devicePixelRatio,
        /*nomangle*/'ROLL'/*/nomangle*/,
    ),
];

TOUCH_JOYSTICK = new MobileJoystick();

if (inputMode === 1) {
    document.body.appendChild(TOUCH_CONTROLS_CANVAS);
    renderTouchControls();
}

class CharacterController {
    start(entity) {
        this.entity = entity;
    }

    // get description() {
    //     return this.constructor.name;
    // }

    cycle() {}
}

class AI extends CharacterController {

    start(entity) {
        super.start(entity);
        return new Promise((resolve, reject) => {
            this.doResolve = resolve;
            this.doReject = reject;
        });
    }

    cycle() {
        let player = firstItem(this.entity.scene.category('player'));
        if (player) {
            this.update(player);
        }
    }

    update(player) {

    }

    resolve() {
        let { doResolve } = this;
        this.onDone();
        if (doResolve) doResolve();
    }

    reject(error) {
        let { doReject } = this;
        this.onDone();
        if (doReject) doReject(error);
    }

    onDone() {
        this.doReject = 0;
        this.doReject = 0;
    }
}

class EnemyAI extends AI {

    constructor() {
        super();
        this.ais = new Set();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        for (let ai of this.ais.values()) {
            ai.cycle(elapsed);
        }
    }

    // get description() {
    //     return Array.from(this.ais).map(ai => ai.description).join('+');
    // }

    async start(entity) {
        super.start(entity);
        await this.doStart(entity);
    }

    async doStart() {
        // implement in subclasses
    }

    update(player) {
        this.entity.controls.aim.x = player.x;
        this.entity.controls.aim.y = player.y;
    }

    startAI(ai) {
        return this.race([ai]);
    }

    async race(ais) {
        try {
            await Promise.race(ais.map(ai => {
                this.ais.add(ai);
                return ai.start(this.entity);
            }));
        } finally { 
            for (let ai of ais) {
                ai.reject(Error());
                ai.resolve(); // Allow the AI to clean up
                this.ais.delete(ai);
            }
        }
    }

    async sequence(ais) {
        for (let ai of ais) {
            await this.startAI(ai);
        }
    }
}

class Wait extends AI {

    constructor(duration) {
        super();
        this.duration = duration;
    }

    start(entity) {
        this.endTime = entity.age + this.duration;
        return super.start(entity);
    }

    update() {
        if (this.entity.age > this.endTime) {
            this.resolve();
        }
    }
}

class Timeout extends AI {

    constructor(duration) {
        super();
        this.duration = duration;
    }

    start(entity) {
        this.endTime = entity.age + this.duration;
        return super.start(entity);
    }

    update() {
        if (this.entity.age > this.endTime) {
            this.reject(Error());
        }
    }
}

class BecomeAggressive extends AI {
    update() {
        let tracker = firstItem(this.entity.scene.category('at'));
        if (tracker.requestAggression(this.entity)) {
            this.resolve();
        }
    }
}

class BecomePassive extends AI {
    update() {
        let tracker = firstItem(this.entity.scene.category('at'));
        tracker.cancelAggression(this.entity);
        this.resolve();
    }
}

class ReachPlayer extends AI {
    constructor(radiusX, radiusY) {
        super();
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.angle = random() * TWO_PI;
    }

    update(player) {
        let { controls } = this.entity;

        controls.force = 0;

        if (!this.entity.isStrikable(player, this.radiusX, this.radiusY, PI / 2)) {
            controls.force = 1;
            controls.angle = angleBetween(this.entity, {
                x: player.x + cos(this.angle) * this.radiusX,
                y: player.y + sin(this.angle) * this.radiusY,
            });
        } else {
            this.resolve();
        }
    }
}

class Attack extends AI {
    constructor(chargeRatio) {
        super();
        this.chargeRatio = chargeRatio; 
    }

    update() {
        let { controls } = this.entity;

        controls.attack = 1;

        if (this.entity.stateMachine.state.attackPreparationRatio >= this.chargeRatio) {
            // Attack was prepared, release!
            controls.attack = 0;
            this.resolve();
        }
    }
}

class RetreatAI extends AI {
    constructor(radiusX, radiusY) {
        super();
        this.radiusX = radiusX;
        this.radiusY = radiusY;
    }

    update(player) {
        this.entity.controls.force = 0;

        if (this.entity.isStrikable(player, this.radiusX, this.radiusY, PI / 2)) {
            // Get away from the player
            this.entity.controls.force = 1;
            this.entity.controls.angle = angleBetween(player, this.entity);
        } else {
            this.resolve();
        }
    }

    onDone() {
        this.entity.controls.force = 0;
    }
}

class HoldShield extends AI {
    update() {
        this.entity.controls.shield = 1;
    }

    onDone() {
        this.entity.controls.shield = 0;
    }
}

class Dash extends AI {
    update() {
        this.entity.controls.dash = 1;
    }

    onDone() {
        this.entity.controls.dash = 0;
    }
}

class Entity {
    constructor() {
        this.x = this.y = this.rotation = this.age = 0;   
        this.categories = [];

        this.rng = new RNG();

        this.renderPadding = Infinity;

        this.affectedBySpeedRatio = 1;
    }

    get z() { 
        return this.y; 
    }

    get inWater() {
        if (this.scene)
        for (let water of this.scene.category('water')) {
            if (water.contains(this)) return 1;
        }
    }

    cycle(elapsed) {
        this.age += elapsed;
    }

    render() {
        let camera = firstItem(this.scene.category('camera'));
        if (
            isBetween(camera.x - 1280 / 2 - this.renderPadding, this.x, camera.x + 1280 / 2 + this.renderPadding) &&
            isBetween(camera.y - 720 / 2 - this.renderPadding, this.y, camera.y + 720 / 2 + this.renderPadding)
        ) {
            this.rng.reset();
            this.doRender(camera);
        }
    }

    doRender(camera) {

    }

    remove() {
        this.scene.remove(this);
    }

    cancelCameraOffset(camera) {
        ctx.translate(camera.x, camera.y);
        ctx.scale(1 / camera.appliedZoom, 1 / camera.appliedZoom);
        ctx.translate(-640, -360);
    }
}

class Camera extends Entity {
    constructor() {
        super();
        this.categories.push('camera');
        this.zoom = 1;
        this.affectedBySpeedRatio = 0;

        this.minX = -640;
    }

    get appliedZoom() {
        // I'm a lazy butt and refuse to update the entire game to have a bit more zoom.
        // So instead I do dis ¯\_(Ä)_/¯
        return interpolate(1.2, 3, (this.zoom - 1) / 3);
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        for (let player of this.scene.category('player')) {
            let target = {'x': player.x, 'y': player.y - 60 };
            let distance = dist(this, target);
            let angle = angleBetween(this, target);
            let appliedDist = min(distance, distance * elapsed * 3);
            this.x += appliedDist * cos(angle);
            this.y += appliedDist * sin(angle);
        }

        this.x = max(this.minX, this.x);
    }

    zoomTo(toValue) {
        if (this.previousInterpolator) {
            this.previousInterpolator.remove();
        }
        return this.scene.add(new Interpolator(this, 'zoom', this.zoom, toValue, 1)).await();
    }
}

class Interpolator extends Entity {

    constructor(
        object,
        property,
        fromValue,
        toValue,
        duration,
        easing = linear,
    ) {
        super();
        this.object = object;
        this.property = property;
        this.fromValue = fromValue;
        this.toValue = toValue;
        this.duration = duration;
        this.easing = easing;

        this.affectedBySpeedRatio = object.affectedBySpeedRatio;

        this.cycle(0);
    }

    await() {
        return new Promise(resolve => this.resolve = resolve);
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        let progress = this.age / this.duration;

        this.object[this.property] = interpolate(this.fromValue, this.toValue, this.easing(progress));

        if (progress > 1) {
            this.remove();
            if (this.resolve) this.resolve();
        }
    }
}

class Cursor extends Entity {
    constructor(player) {
        super();
        this.player = player;
    }

    get z() { 
        return 9994;
    }

    doRender() {
        if (inputMode == 1) return;
        ctx.translate(this.player.controls.aim.x, this.player.controls.aim.y);

        ctx.fillStyle = '#000';
        ctx.rotate(PI / 4);
        ctx.fillRect(-15, -5, 30, 10);
        ctx.rotate(PI / 2);
        ctx.fillRect(-15, -5, 30, 10);
    }
}

class Path extends Entity {

    get z() {
        return -9992;
    }

    doRender(camera) {
        ctx.strokeStyle = '#dc9';
        ctx.lineWidth = 70;

        ctx.fillStyle = '#fff';

        ctx.beginPath();
        for (let x = roundToNearest(camera.x - 1280 * 2, 300) ; x < camera.x + 1280 ; x += 300) {
            let y = this.scene.pathCurve(x);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

class AggressivityTracker extends Entity {
    constructor() {
        super();
        this.categories.push('at');
        this.currentAggression = 0;
        this.aggressive = new Set();
    }

    requestAggression(enemy) {
        this.cancelAggression(enemy);

        let { aggression } = enemy;
        if (this.currentAggression + aggression > 6) {
            return;
        }

        this.currentAggression += aggression;
        this.aggressive.add(enemy);
        return 1
    }

    cancelAggression(enemy) {
        if (this.aggressive.has(enemy)) {
            let { aggression } = enemy;
            this.currentAggression -= aggression;
            this.aggressive.delete(enemy);
        }
    }

    doRender(camera) {
        if (true && false) {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 5;
            ctx.textAlign = /*nomangle*/'center'/*/nomangle*/;
            ctx.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
            ctx.font = /*nomangle*/'12pt Courier'/*/nomangle*/;

            ctx.wrap(() => {
                ctx.translate(camera.x, camera.y - 100);
        
                ctx.strokeText('Agg: ' + this.currentAggression, 0, 0);
                ctx.fillText('Agg: ' + this.currentAggression, 0, 0);
            });

            let player = firstItem(this.scene.category('player'));
            if (!player) return;

            for (let enemy of this.aggressive) {
                ctx.strokeStyle = '#f00';
                ctx.lineWidth = 20;
                ctx.globalAlpha = 0.1;
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y);
                ctx.lineTo(player.x, player.y);
                ctx.stroke();
            }
        }
    }
}

class FullCharge extends Entity {

    get z() { 
        return 9992; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.age > 0.25) {
            this.remove();
        }
    }

    doRender() {
        let ratio = this.age / 0.25;

        ctx.translate(this.x, this.y);
        ctx.scale(ratio, ratio);

        ctx.globalAlpha = 1 - ratio; 
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, TWO_PI);
        ctx.stroke();
    }
}

class ShieldBlock extends Entity {

    get z() { 
        return 9992; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.age > 0.25) {
            this.remove();
        }
    }

    doRender() {
        let ratio = this.age / 0.25;

        ctx.translate(this.x, this.y);
        ctx.scale(ratio, ratio);

        ctx.globalAlpha = 1 - ratio; 
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, TWO_PI);
        ctx.stroke();
    }
}

class PerfectParry extends Entity {

    constructor() {
        super();
        this.affectedBySpeedRatio = 0;
    }

    get z() { 
        return 9992; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.age > 0.5) {
            this.remove();
        }
    }

    doRender() {
        let ratio = this.age / 0.5;
        ctx.fillStyle = '#fff';

        ctx.translate(this.x, this.y);

        ctx.globalAlpha = (1 - ratio); 
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        ctx.lineWidth = 20;
        ctx.beginPath();

        for (let r = 0 ; r < 1 ; r+= 0.05) {
            let angle = r * TWO_PI;
            let radius = ratio * rnd(140, 200);
            ctx.lineTo(
                cos(angle) * radius,
                sin(angle) * radius,
            );
        }

        // ctx.closePath();

        // // ctx.arc(0, 0, 100, 0, TWO_PI);
        // ctx.stroke();
        ctx.fill();
    }
}

class Particle extends Entity {

    constructor(
        color,
        valuesSize,
        valuesX,
        valuesY,
        duration,
    ) {
        super();
        this.color = color;
        this.valuesSize = valuesSize;
        this.valuesX = valuesX;
        this.valuesY = valuesY;
        this.duration = duration;
    }

    get z() { 
        return 9991; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.age > this.duration) {
            this.remove();
        }
    }

    interp(property) {
        let progress = this.age / this.duration;
        return property[0] + progress * (property[1] - property[0]);
    }

    doRender() {
        let size = this.interp(this.valuesSize);
        ctx.translate(this.interp(this.valuesX) - size / 2, this.interp(this.valuesY) - size / 2);
        ctx.rotate(PI / 4);

        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.interp([1, 0]);
        ctx.fillRect(0, 0, size, size);
    }
}

class SwingEffect extends Entity {
    constructor(character, color, fromAngle, toAngle) {
        super();
        this.character = character;
        this.color = color;
        this.fromAngle = fromAngle;
        this.toAngle = toAngle;
        this.affectedBySpeedRatio = character.affectedBySpeedRatio;
    }

    get z() {
        return 9992;
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.age > 0.2) this.remove();
    }

    doRender() {
        ctx.globalAlpha = 1 - this.age / 0.2;

        ctx.translate(this.character.x, this.character.y);
        ctx.scale(this.character.facing, 1);
        ctx.translate(11, -42);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 40;
        ctx.beginPath();

        for (let r = 0 ; r < 1 ; r += 0.05) {
            ctx.wrap(() => {
                ctx.rotate(
                    interpolate(
                        this.fromAngle * PI / 2, 
                        this.toAngle * PI / 2,
                        r,
                    )
                );
                ctx.lineTo(18, -26);
            });
        }

        ctx.stroke();
    }
}

class Rain extends Entity {
    get z() { 
        return 9993;
    }

    doRender(camera) {
        this.rng.reset();

        ctx.fillStyle = '#0af';

        this.cancelCameraOffset(camera);

        for (let i = 99 ; i-- ;) {
            ctx.wrap(() => {
                ctx.translate(640, 360);
                ctx.rotate(this.rng.next(0, PI / 16));
                ctx.translate(-640, -360);

                ctx.fillRect(
                    this.rng.next(0, 1280),
                    this.rng.next(1000, 2000) * (this.age + this.rng.next(0, 10)) % 720,
                    2,
                    20,
                );
            });
        }
    }
}

class Bird extends Entity {
    constructor() {
        super();
        this.regen();
    }

    get z() { 
        return 9993;
    }

    regen() {
        this.age = 0;

        let cameraX = 0, cameraY = 0;
        if (this.scene) {
            let camera = firstItem(this.scene.category('camera'));
            cameraX = camera.x;
            cameraY = camera.y;
        }
        this.x = rnd(cameraX - 640, cameraX + 640);
        this.y = cameraY - 460;
        this.rotation = rnd(PI / 4, PI * 3 / 4);
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        let camera = firstItem(this.scene.category('camera'));
        if (this.y > camera.y + 660) {
            this.regen();
        }

        this.x += cos(this.rotation) * elapsed * 300;
        this.y += sin(this.rotation) * elapsed * 300;
    }

    doRender() {
        ctx.translate(this.x, this.y + 300);

        ctx.withShadow(() => {
            ctx.strokeStyle = ctx.resolveColor('#000');
            ctx.lineWidth = 4;
            ctx.beginPath();

            ctx.translate(0, -300);

            let angle = sin(this.age * TWO_PI * 4) * PI / 16 + PI / 4;

            ctx.lineTo(-cos(angle) * 10, -sin(angle) * 10);
            ctx.lineTo(0, 0);
            ctx.lineTo(cos(angle) * 10, -sin(angle) * 10);
            ctx.stroke();
        });
    }
}

class Grass extends Entity {

    constructor() {
        super();
        this.renderPadding = 100;
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        regenEntity(this, 1280 / 2 + 50, 720 / 2 + 50);
    }

    doRender() {
        ctx.translate(this.x, this.y);
        
        ctx.withShadow(() => {
            this.rng.reset();

            let x = 0;
            for (let i = 0 ; i < (inputMode == 1 ? 2 : 5) ; i++) {
                ctx.wrap(() => {
                    ctx.fillStyle = ctx.resolveColor('#ab8');
                    ctx.translate(x, 0);
                    ctx.rotate(sin((this.age + this.rng.next(0, 5)) * TWO_PI / this.rng.next(4, 8)) * this.rng.next(PI / 16, PI / 4));
                    ctx.fillRect(-2, 0, 4, -this.rng.next(5, 30));
                });

                x += this.rng.next(5, 15);
            }
        });
    }
}

class Obstacle extends Entity {

    constructor() {
        super();
        this.categories.push('obstacle');
    }
}

class Tree extends Obstacle {

    constructor() {
        super();

        this.trunkWidth = this.rng.next(10, 20);
        this.trunkHeight = this.rng.next(100, 250);

        this.collisionRadius = 20;
        this.alpha = 1;
        
        this.renderPadding = this.trunkHeight + 60;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (!this.noRegen) regenEntity(this, 1280 / 2 + 200, 720 / 2 + 400);

        this.rng.reset();

        let targetAlpha = 1;
        for (let character of this.scene.category('player')) {
            if (
                isBetween(this.x - 100, character.x, this.x + 100) &&
                isBetween(this.y - this.trunkHeight - 50, character.y, this.y)
            ) {
                targetAlpha = 0.2;
                break;
            }
        }

        this.alpha += between(-elapsed * 2, targetAlpha - this.alpha, elapsed * 2);
    }

    doRender() {
        ctx.translate(this.x, this.y);
        
        ctx.withShadow(() => {
            this.rng.reset();

            ctx.wrap(() => {
                ctx.rotate(sin((this.age + this.rng.next(0, 10)) * TWO_PI / this.rng.next(4, 16)) * this.rng.next(PI / 32, PI / 64));
                ctx.fillStyle = ctx.resolveColor('#a65');

                if (!ctx.isShadow) {
                    ctx.globalAlpha = this.alpha;
                }

                if (!ctx.isShadow) ctx.fillRect(0, 0, this.trunkWidth, -this.trunkHeight);

                ctx.translate(0, -this.trunkHeight);

                ctx.beginPath();
                ctx.fillStyle = ctx.resolveColor('#060');

                for (let i = 0 ; i < 5 ; i++) {
                    let angle = i / 5 * TWO_PI;
                    let dist = this.rng.next(20, 50);
                    let x =  cos(angle) * dist;
                    let y = sin(angle) * dist * 0.5;
                    let radius = this.rng.next(20, 40);

                    ctx.wrap(() => {
                        ctx.translate(x, y);
                        ctx.rotate(PI / 4);
                        ctx.rotate(sin((this.age + this.rng.next(0, 10)) * TWO_PI / this.rng.next(2, 8)) * PI / 32);
                        ctx.rect(-radius, -radius, radius * 2, radius * 2);
                    });
                }

                if (ctx.isShadow) ctx.rect(0, 0, this.trunkWidth, this.trunkHeight);

                ctx.fill();
            });

            ctx.clip();

            if (!ctx.isShadow) {
                for (let character of this.scene.category('enemy')) {
                    if (
                        isBetween(this.x - 100, character.x, this.x + 100) &&
                        isBetween(this.y - this.trunkHeight - 50, character.y, this.y)
                    ) {
                        ctx.resolveColor = () => character instanceof Player ? '#888' : '#400';
                        ctx.wrap(() => {
                            ctx.translate(character.x - this.x, character.y - this.y);
                            ctx.scale(character.facing, 1);
                            ctx.globalAlpha = this.alpha;
                            character.renderBody();
                        });
                    }
                }
            }
        });
    }
}

class Bush extends Entity {

    constructor() {
        super();
        this.renderPadding = 100;
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        regenEntity(this, 1280 / 2 + 50, 720 / 2 + 50);
    }

    doRender() {
        ctx.translate(this.x, this.y);
        
        ctx.withShadow(() => {
            this.rng.reset();

            let x = 0;
            for (let i = 0 ; i < 5 ; i++) {
                ctx.wrap(() => {
                    ctx.fillStyle = ctx.resolveColor('green');
                    ctx.translate(x, 0);
                    ctx.rotate(sin((this.age + this.rng.next(0, 5)) * TWO_PI / this.rng.next(4, 8)) * this.rng.next(PI / 32, PI / 16));
                    ctx.fillRect(-10, 0, 20, -this.rng.next(20, 60));
                });

                x += this.rng.next(5, 15);
            }
        });
    }
}

class Water extends Entity {
    constructor() {
        super();
        this.categories.push('water');
        this.width = this.height = 0;
    }

    get z() { 
        return -9991; 
    }

    get inWater() {
        return 0;
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        this.renderPadding = max(this.width, this.height) / 2;
        regenEntity(this, 1280 * 2, 720 * 2, max(this.width, this.height));
    }

    contains(point) {
        let xInSelf = point.x - this.x;
        let yInSelf = point.y - this.y;

        let xInSelfRotated = xInSelf * cos(this.rotation) + yInSelf * sin(this.rotation);
        let yInSelfRotated = -xInSelf * sin(this.rotation) + yInSelf * cos(this.rotation);

        return abs(xInSelfRotated) < this.width / 2 && abs(yInSelfRotated) < this.height / 2;
    }

    doRender() {
        this.rng.reset();

        ctx.wrap(() => {
            ctx.fillStyle = '#08a';
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.fill();
            ctx.clip();

            // Ripples
            ctx.rotate(-this.rotation);
            ctx.scale(1, 0.5);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;

            for (let i = 3; i-- ; ) {
                let relativeAge = (this.age + this.rng.next(0, 20)) / 2;
                let ratio = min(1, relativeAge % (2 / 2));

                ctx.globalAlpha = (1 - ratio) / 2;
                ctx.beginPath();
                ctx.arc(
                    ((this.rng.next(0, this.width) + ~~relativeAge * this.width * 0.7) % this.width) - this.width / 2,
                    ((this.rng.next(0, this.height) + ~~relativeAge * this.height * 0.7) % this.height) - this.width / 2,
                    ratio * this.rng.next(20, 60),
                    0,
                    TWO_PI,
                );
                ctx.stroke();
            }
        });
    }
}

class Label extends Entity {
    constructor(text, color = '#fff') {
        super();
        this.text = text.toUpperCase();
        this.color = color;
    }

    get z() { 
        return 9994; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.age > 1 && !this.infinite) this.remove();
    }

    doRender() {
        ctx.translate(this.x, interpolate(this.y + 20, this.y, this.age / 0.25));
        if (!this.infinite) ctx.globalAlpha = interpolate(0, 1, this.age / 0.25);

        ctx.font = /*nomangle*/'bold 14pt Arial'/*/nomangle*/;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = /*nomangle*/'center'/*/nomangle*/;
        ctx.textBaseline = /*nomangle*/'middle'/*/nomangle*/;

        ctx.shadowColor = '#000';
        ctx.shadowOffsetX = ctx.shadowOffsetY = 1;

        ctx.strokeText(this.text, 0, 0);
        ctx.fillText(this.text, 0, 0);
    }
}

class Fade extends Entity {
    constructor() {
        super();
        this.alpha = 1;
    }

    get z() { 
        return 9996;
    }

    doRender(camera) {
        this.cancelCameraOffset(camera);

        ctx.fillStyle = '#000';
        ctx.globalAlpha = this.alpha;
        ctx.fillRect(0, 0, 1280, 720);
    }
}

class Logo extends Entity {
    constructor() {
        super();
        this.alpha = 1;
    }

    get z() { 
        return 9995; 
    }

    doRender(camera) {
        if (GAME_PAUSED) return;

        ctx.globalAlpha = this.alpha;

        ctx.wrap(() => {
            this.cancelCameraOffset(camera);
    
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 1280, 720);

            ctx.translate(640, 240);
            ctx.renderLargeText([
                [/*nomangle*/'P'/*/nomangle*/, 192, -30],
                [/*nomangle*/'ATH'/*/nomangle*/, 96, 30],
                [/*nomangle*/'TO'/*/nomangle*/, 36, 20],
                [/*nomangle*/'G'/*/nomangle*/, 192],
                [/*nomangle*/'LORY'/*/nomangle*/, 96],
            ]);      
        });

        for (let player of this.scene.category('player')) {
            player.doRender(camera);
            if (BEATEN) ctx.renderCrown(player);
        }
    }
}

class Announcement extends Entity {
    constructor(text) {
        super();
        this.text = text;
        this.affectedBySpeedRatio = 0;
    }

    get z() { 
        return 9995; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.age > 5) this.remove();
    }

    doRender(camera) {
        this.cancelCameraOffset(camera);

        ctx.globalAlpha = this.age < 1 
            ? interpolate(0, 1, this.age)
            : interpolate(1, 0, this.age - 4);

        ctx.wrap(() => {
            ctx.translate(40, 680);

            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.textAlign = /*nomangle*/'left'/*/nomangle*/;
            ctx.textBaseline = /*nomangle*/'alphabetic'/*/nomangle*/;
            ctx.font = /*nomangle*/'72pt Times New Roman'/*/nomangle*/;
            ctx.strokeText(this.text, 0, 0);
            ctx.fillText(this.text, 0, 0);
        });
    }
}

class Instruction extends Entity {

    get z() { 
        return 9997; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (this.text != this.previousText) {
            this.previousText = this.text;
            this.textAge = 0; 
        }
        this.textAge += elapsed;
    }

    doRender(camera) {
        if (!this.text || GAME_PAUSED) return;

        this.cancelCameraOffset(camera);

        ctx.translate(1280 / 2, 720 * 5 / 6);

        ctx.scale(
            interpolate(1.2, 1, this.textAge * 8),
            interpolate(1.2, 1, this.textAge * 8),
        );
        ctx.renderInstruction(this.text);
    }
}

class Exposition extends Entity {

    constructor(text) {
        super();
        this.text = text;
        this.alpha = 1;
    }

    get z() { 
        return 9997; 
    }

    doRender(camera) {
        if (!this.text) return;

        this.cancelCameraOffset(camera);

        ctx.translate(150, 360);

        ctx.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
        ctx.textAlign = /*nomangle*/'left'/*/nomangle*/;
        ctx.fillStyle = '#fff';
        ctx.font = /*nomangle*/'24pt Times New Roman'/*/nomangle*/;

        let y = -this.text.length / 2 * 50;
        let lineIndex = 0;
        for (let line of this.text) {
            ctx.globalAlpha = between(0, (this.age - lineIndex * 3), 1) * this.alpha;
            ctx.fillText(line, 0, y);
            y += 75;
            lineIndex++;
        }
    }
}

class PauseOverlay extends Entity {
    get z() { 
        return 9995 + 1; 
    }

    doRender(camera) {
        if (!GAME_PAUSED) return;

        this.cancelCameraOffset(camera);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, 1280, 720);

        ctx.wrap(() => {
            ctx.translate(1280 / 2, 720 / 3);

            ctx.renderLargeText([
                [/*nomangle*/'G'/*/nomangle*/, 192],
                [/*nomangle*/'AME'/*/nomangle*/, 96, 30],
                [/*nomangle*/'P'/*/nomangle*/, 192, -30],
                [/*nomangle*/'AUSED'/*/nomangle*/, 96],
            ]);
        });

        ctx.wrap(() => {
            ctx.translate(1280 / 2, 720 * 3 / 4);
            ctx.renderInstruction(/*nomangle*/'[P] or [ESC] to resume'/*/nomangle*/);
        });

    }
}

class CharacterHUD extends Entity {
    constructor(character) {
        super();
        this.character = character;

        this.healthGauge = new Gauge(() => this.character.health / this.character.maxHealth);
        this.staminaGauge = new Gauge(() => this.character.stamina);
    }

    get z() { 
        return 9990; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        this.healthGauge.cycle(elapsed);
        this.staminaGauge.cycle(elapsed);
        if (!this.character.health) this.remove();
    }

    doRender() {
        if (
            this.character.health > 0.5 && 
            this.character.age - max(this.character.lastStaminaLoss, this.character.lastDamage) > 2
        ) return;
 
        ctx.translate(this.character.x, this.character.y + 20);
        ctx.wrap(() => {
            ctx.translate(0, 4);
            this.staminaGauge.render(60, 6, staminaGradient, 1);
        });
        this.healthGauge.render(80, 5, healthGradient);
    }
}

class PlayerHUD extends Entity {
    constructor(player) {
        super();
        this.player = player;

        this.healthGauge = new Gauge(() => this.player.health / this.player.maxHealth);
        this.staminaGauge = new Gauge(() => this.player.stamina);
        this.progressGauge = new Gauge(() => this.progress);

        this.healthGauge.regenRate = 0.1;
        this.progressGauge.regenRate = 0.1;

        this.progressGauge.displayedValue = 0;

        this.progress = 0;
        this.progressAlpha = 0;

        this.dummyPlayer = new Player();
        this.dummyKing = new KingEnemy();

        this.affectedBySpeedRatio = 0;
    }

    get z() { 
        return 9994; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        this.healthGauge.cycle(elapsed);
        this.staminaGauge.cycle(elapsed);
        this.progressGauge.cycle(elapsed);
    }

    doRender(camera) {
        this.cancelCameraOffset(camera);

        ctx.wrap(() => {
            ctx.translate(1280 / 2, 50);
            ctx.wrap(() => {
                ctx.translate(0, 10);
                this.staminaGauge.render(300, 20, staminaGradient, 1);
            });
            this.healthGauge.render(400, 20, healthGradient);
        });

        ctx.wrap(() => {
            ctx.globalAlpha = this.progressAlpha;

            ctx.translate(1280 / 2, 720 - 150);
            this.progressGauge.render(600, 10, '#fff', 0, 8);

            ctx.resolveColor = () => '#fff';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 1;

            ctx.wrap(() => {
                ctx.translate(interpolate(-300, 300, this.progressGauge.displayedValue), 20);
                ctx.scale(0.5, 0.5);
                this.dummyPlayer.renderBody();
            });

            ctx.wrap(() => {
                ctx.translate(300, 20);
                ctx.scale(-0.5, 0.5);
                this.dummyKing.renderBody();
            });
        });

        ctx.wrap(() => {
            ctx.translate(1280 / 2, 90);

            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.textBaseline = /*nomangle*/'top'/*/nomangle*/;
            ctx.textAlign = /*nomangle*/'center'/*/nomangle*/;
            ctx.font = /*nomangle*/'bold 16pt Times New Roman'/*/nomangle*/;
            ctx.strokeText(/*nomangle*/'SCORE: '/*/nomangle*/ + this.player.score.toLocaleString(), 0, 0);
            ctx.fillText(/*nomangle*/'SCORE: '/*/nomangle*/ + this.player.score.toLocaleString(), 0, 0);
        });

        if (this.player.combo > 0) {
            ctx.wrap(() => {
                ctx.translate(1280 / 2 + 200, 70);

                ctx.fillStyle = '#fff';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                ctx.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
                ctx.textAlign = /*nomangle*/'right'/*/nomangle*/;
                ctx.font = /*nomangle*/'bold 36pt Times New Roman'/*/nomangle*/;

                ctx.rotate(-PI / 32);

                let ratio = min(1, (this.player.age - this.player.lastComboChange) / 0.1);
                ctx.scale(1 + 1 - ratio, 1 + 1 - ratio);

                ctx.strokeText('X' + this.player.combo, 0, 0);
                ctx.fillText('X' + this.player.combo, 0, 0);
            });
        }
    }
}

class Character extends Entity {
    constructor() {
        super();
        this.categories.push('character', 'obstacle');

        this.renderPadding = 90;

        this.facing = 1;

        this.health = this.maxHealth = 100;

        this.combo = 0;

        this.stamina = 1;

        this.lastDamage = this.lastStaminaLoss = this.lastComboChange = -9;

        this.baseSpeed = 200;

        this.strikeRadiusX = 80;
        this.strikeRadiusY = 40;

        this.magnetRadiusX = this.magnetRadiusY = 0;

        this.collisionRadius = 30;

        this.strength = 100;
        this.damageCount = this.parryCount = 0;

        this.staminaRecoveryDelay = 99;

        this.setController(this.ai);

        this.gibs = [];

        this.controls = {
            'force': 0,
            'angle': 0,
            // 'shield': 0,
            // 'attack': 0,
            'aim': {'x': 0, 'y': 0},
            // 'dash': 0,
        };

        this.stateMachine = characterStateMachine({
            entity: this, 
        });
    }

    setController(controller) {
        (this.controller = controller).start(this);
    }

    get ai() {
        return new AI();
    }

    getColor(color) {
        return this.age - this.lastDamage < 0.1 ? '#fff' : color;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        this.renderAge = this.age * (this.inWater ? 0.5 : 1)

        this.stateMachine.cycle(elapsed);

        this.controller.cycle(elapsed);

        if (this.inWater && this.controls.force) {
            this.loseStamina(elapsed * 0.2);
        }

        let speed = this.stateMachine.state.speedRatio * this.baseSpeed;
        
        this.x += cos(this.controls.angle) * this.controls.force * speed * elapsed;
        this.y += sin(this.controls.angle) * this.controls.force * speed * elapsed;

        this.facing = sign(this.controls.aim.x - this.x) || 1;

        // Collisions with other characters and obstacles
        for (let obstacle of this.scene.category('obstacle')) {
            if (obstacle === this || dist(this, obstacle) > obstacle.collisionRadius) continue;
            let angle = angleBetween(this, obstacle);
            this.x = obstacle.x - cos(angle) * obstacle.collisionRadius;
            this.y = obstacle.y - sin(angle) * obstacle.collisionRadius;
        }

        // Stamina regen
        if (this.age - this.lastStaminaLoss > this.staminaRecoveryDelay || this.stateMachine.state.exhausted) {
            this.stamina = min(1, this.stamina + elapsed * 0.3);
        }

        // Combo reset
        if (this.age - this.lastComboChange > 5) {
            this.updateCombo(-99);
        }
    }

    updateCombo(value) {
        this.combo = max(0, this.combo + value);
        this.lastComboChange = this.age;
    }

    isStrikable(victim, radiusX, radiusY) {
        return this.strikability(victim, radiusX, radiusY, PI / 2) > 0;
    }

    isWithinRadii(character, radiusX, radiusY) {
        return abs(character.x - this.x) < radiusX && 
            abs(character.y - this.y) < radiusY;
    }

    strikability(victim, radiusX, radiusY, fov) {
        if (victim === this || !radiusX || !radiusY) return 0;

        let angleToVictim = angleBetween(this, victim);
        let aimAngle = angleBetween(this, this.controls.aim);
        let angleScore = 1 - abs(normalize(angleToVictim - aimAngle)) / (fov / 2);

        let dX = abs(this.x - victim.x);
        let adjustedDY = abs(this.y - victim.y) / (radiusY / radiusX);

        let adjustedDistance = hypot(dX, adjustedDY);
        let distanceScore = 1 - adjustedDistance / radiusX;

        return distanceScore < 0 || angleScore < 0 
            ? 0
            : (distanceScore + pow(angleScore, 3));
    }

    pickVictims(radiusX, radiusY, fov) {
        return Array
            .from(this.scene.category(this.targetTeam))
            .filter((victim) => this.strikability(victim, radiusX, radiusY, fov) > 0);
    }

    pickVictim(radiusX, radiusY, fov) {
        return this.pickVictims(radiusX, radiusY, fov)
            .reduce((acc, other) => {
                if (!acc) return other;

                return this.strikability(other, radiusX, radiusX, fov) > this.strikability(acc, radiusX, radiusY, fov) 
                    ? other 
                    : acc;
            }, 0);
        
    }

    lunge() {
        let victim = this.pickVictim(this.magnetRadiusX, this.magnetRadiusY, PI / 2);
        victim
            ? this.dash(
                angleBetween(this, victim), 
                max(0, dist(this, victim) - this.strikeRadiusY / 2), 
                0.1,
            )
            : this.dash(
                angleBetween(this, this.controls.aim), 
                40, 
                0.1,
            );
    }

    strike(relativeStrength) {
        sound(...[.1,,400,.1,.01,,3,.92,17,,,,,2,,,,1.04]);

        for (let victim of this.pickVictims(this.strikeRadiusX, this.strikeRadiusY, TWO_PI)) {
            let angle = angleBetween(this, victim);
            if (victim.stateMachine.state.shielded) {
                victim.facing = sign(this.x - victim.x) || 1;
                victim.parryCount++;

                // Push back
                this.dash(angle + PI, 20, 0.1);

                if (victim.stateMachine.state.perfectParry) {
                    // Perfect parry, victim gets stamina back, we lose ours
                    victim.stamina = 1;
                    victim.updateCombo(1);
                    victim.displayLabel(/*nomangle*/'Perfect Block!'/*/nomangle*/);

                    let animation = this.scene.add(new PerfectParry());
                    animation.x = victim.x;
                    animation.y = victim.y - 30;
                    
                    this.perfectlyBlocked = 1; // Disable "exhausted" label
                    this.loseStamina(1);

                    for (let parryVictim of this.scene.category(victim.targetTeam)) {
                        if (victim.isWithinRadii(parryVictim, victim.strikeRadiusX * 2, victim.strikeRadiusY * 2)) {
                            parryVictim.dash(angleBetween(victim, parryVictim), 100, 0.2);
                        }
                    }

                    (async () => {
                        this.scene.speedRatio = 0.1;

                        let camera = firstItem(this.scene.category('camera'));
                        await camera.zoomTo(2);
                        await this.scene.delay(3 * this.scene.speedRatio);
                        await camera.zoomTo(1);
                        this.scene.speedRatio = 1;
                    })();

                    sound(...[2.14,,1e3,.01,.2,.31,3,3.99,,.9,,,.08,1.9,,,.22,.34,.12]);
                } else {
                    // Regular parry, victim loses stamina
                    victim.loseStamina(relativeStrength * this.strength / 100);
                    victim.displayLabel(/*nomangle*/'Blocked!'/*/nomangle*/);
                
                    let animation = this.scene.add(new ShieldBlock());
                    animation.x = victim.x;
                    animation.y = victim.y - 30;

                    sound(...[2.03,,200,,.04,.12,1,1.98,,,,,,-2.4,,,.1,.59,.05,.17]);
                }
            } else {
                victim.damage(~~(this.strength * relativeStrength));
                victim.dash(angle, this.strength * relativeStrength, 0.1);

                // Regen a bit of health after a kill
                if (!victim.health) {
                    this.heal(this.maxHealth * 0.1);
                }

                this.updateCombo(1);

                let impactX = victim.x + rnd(-20, 20);
                let impactY = victim.y - 30 + rnd(-20, 20);
                let size = rnd(1, 2);

                for (let i = 0 ; i < 20 ; i++) {
                    this.scene.add(new Particle(
                        '#900',
                        [size, size + rnd(3, 6)],
                        [impactX, impactX + rnd(-30, 30)],
                        [impactY, impactY + rnd(-30, 30)],
                        rnd(0.2, 0.4),
                    ));
                }
            }
        }
    }

    displayLabel(text, color) {
        if (this.lastLabel) this.lastLabel.remove();

        this.lastLabel = this.scene.add(new Label(text, color));
        this.lastLabel.x = this.x;
        this.lastLabel.y = this.y - 90;
    }

    loseStamina(amount) {
        this.stamina = max(0, this.stamina - amount);
        this.lastStaminaLoss = this.age;
    }

    damage(amount) {
        this.health = max(0, this.health - amount);
        this.lastDamage = this.age;
        this.damageCount++;

        if (!this.stateMachine.state.exhausted) this.loseStamina(amount / this.maxHealth * 0.3);
        this.updateCombo(-99);
        this.displayLabel('' + amount, this.damageLabelColor);

        // Death
        if (!this.health) this.die();
    }

    heal() {}

    doRender() {
        let { inWater, renderAge } = this;

        ctx.translate(this.x, this.y);

        if (true && false) {
            ctx.wrap(() => {
                ctx.lineWidth = 10;
                ctx.strokeStyle = '#f00';
                ctx.globalAlpha = 0.1;
                ctx.beginPath();
                ctx.ellipse(0, 0, this.strikeRadiusX, this.strikeRadiusY, 0, 0, TWO_PI);
                ctx.stroke();

                ctx.beginPath();
                ctx.ellipse(0, 0, this.magnetRadiusX, this.magnetRadiusY, 0, 0, TWO_PI);
                ctx.stroke();
            });
        }

        let orig = ctx.resolveColor || (x => x);
        ctx.resolveColor = x => this.getColor(orig(x));

        ctx.withShadow(() => {
            if (inWater) {
                ctx.beginPath();
                ctx.rect(-150, -150, 300, 150);
                ctx.clip();

                ctx.translate(0, 10);
            }

            let { facing } = this;
            let { dashAngle } = this.stateMachine.state;
            if (dashAngle !== undefined) {
                facing = sign(cos(dashAngle));
    
                ctx.translate(0, -30);
                ctx.rotate(this.stateMachine.state.age / 0.3 * facing * TWO_PI);
                ctx.translate(0, 30);
            }

            ctx.scale(facing, 1);

            ctx.wrap(() => this.renderBody(renderAge));
        });

        if (true) {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.textAlign = /*nomangle*/'center'/*/nomangle*/;
            ctx.textBaseline = /*nomangle*/'middle'/*/nomangle*/;
            ctx.font = /*nomangle*/'12pt Courier'/*/nomangle*/;

            let bits = [];
            if (false) {
                bits.push(...[
                    /*nomangle*/'State: '/*/nomangle*/ + this.stateMachine.state.constructor.name,
                    /*nomangle*/'HP: '/*/nomangle*/ + ~~this.health + '/' + this.maxHealth,
                ]);
            }
            
            if (false) {
                bits.push(...[
                    /*nomangle*/'AI: '/*/nomangle*/ + this.controller.constructor.name,
                ]);
            }
            
            if (false) {
                bits.push(...[
                    /*nomangle*/'Speed: '/*/nomangle*/ + this.baseSpeed,
                    /*nomangle*/'Strength: '/*/nomangle*/ + this.strength,
                    /*nomangle*/'Aggro: '/*/nomangle*/ + this.aggression,
                ]);
            }
        
            let y = -90;
            for (let text of bits.reverse()) {
                ctx.strokeText(text, 0, y);
                ctx.fillText(text, 0, y);

                y -= 20;
            }
        }
    }

    dash(angle, distance, duration) {
        this.scene.add(new Interpolator(this, 'x', this.x, this.x + cos(angle) * distance, duration));
        this.scene.add(new Interpolator(this, 'y', this.y, this.y + sin(angle) * distance, duration));
    }

    die() {
        let duration = 1;

        let gibs = this.gibs.concat([1, 0].map((sliceUp) => () => {
            ctx.slice(30, sliceUp, 0.5);
            ctx.translate(0, 30);
            this.renderBody();
        }));

        for (let step of gibs) {
            let bit = this.scene.add(new Corpse(step));
            bit.x = this.x;
            bit.y = this.y;
    
            let angle = angleBetween(this, this.controls.aim) + PI + rnd(-1, 1) * PI / 4;
            let distance = rnd(30, 60);
            this.scene.add(new Interpolator(bit, 'x', bit.x, bit.x + cos(angle) * distance, duration, easeOutQuint));
            this.scene.add(new Interpolator(bit, 'y', bit.y, bit.y + sin(angle) * distance, duration, easeOutQuint));
            this.scene.add(new Interpolator(bit, 'rotation', 0, pick([-1, 1]) * rnd(PI / 4, PI), duration, easeOutQuint));
        }

        this.poof();

        this.displayLabel(/*nomangle*/'Slain!'/*/nomangle*/, this.damageLabelColor);

        this.remove();

        sound(...[2.1,,400,.03,.1,.4,4,4.9,.6,.3,,,.13,1.9,,.1,.08,.32]);
    }

    poof() {
        for (let i = 0 ; i < 80 ; i++) {
            let angle = random() * TWO_PI;
            let dist = random() * 40;

            let x = this.x + cos(angle) * dist;
            let y = this.y - 30 + sin(angle) * dist;

            this.scene.add(new Particle(
                '#fff',
                [10, 20],
                [x, x + rnd(-20, 20)],
                [y, y + rnd(-20, 20)],
                rnd(0.5, 1),
            ));
        }
    }
}

FOV_GRADIENT = [0, 255].map(red => createCanvas(1, 1, ctx => {
    let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 250);
    grad.addColorStop(0, 'rgba(' + red + ',0,0,.1)');
    grad.addColorStop(1, 'rgba(' + red + ',0,0,0)');
    return grad;
}));

class Player extends Character {
    constructor() {
        super();
        this.categories.push('player');

        this.targetTeam = 'enemy';

        this.score = 0;

        this.baseSpeed = 250;
        this.strength = 30;

        this.staminaRecoveryDelay = 2;

        this.magnetRadiusX = this.magnetRadiusY = 250;

        this.affectedBySpeedRatio = 0;

        this.damageLabelColor = '#f00';

        this.gibs = [
            () => ctx.renderSword(),
            () => ctx.renderShield(),
        ];

        this.stateMachine = characterStateMachine({
            entity: this, 
            chargeTime: 1,
            perfectParryTime: 0.15,
            releaseAttackBetweenStrikes: 1,
            staggerTime: 0.2,
        });
    }

    get ai() {
        return new PlayerController();
    }

    damage(amount) {
        super.damage(amount);
        sound(...[2.07,,71,.01,.05,.03,2,.14,,,,,.01,1.5,,.1,.19,.95,.05,.16]);
    }

    getColor(color) {
        return this.age - this.lastDamage < 0.1 ? '#f00' : super.getColor(color);
    }

    heal(amount) {
        amount = ~~min(this.maxHealth - this.health, amount);
        this.health += amount

        for (let i = amount ; --i > 0 ;) {
            setTimeout(() => {
                let angle = random() * TWO_PI;
                let dist = random() * 40;

                let x = this.x + rnd(-10, 10);
                let y = this.y - 30 + sin(angle) * dist;

                this.scene.add(new Particle(
                    '#0f0',
                    [5, 10],
                    [x, x + rnd(-10, 10)],
                    [y, y + rnd(-30, -60)],
                    rnd(1, 1.5),
                ));
            }, i * 100);
        }
    }

    render() {
        let victim = this.pickVictim(this.magnetRadiusX, this.magnetRadiusY, PI / 2);
        if (victim) {
            ctx.wrap(() => {
                if (false) return;

                ctx.globalAlpha = 0.2;
                ctx.strokeStyle = '#f00';
                ctx.lineWidth = 5;
                ctx.setLineDash([10, 10]);
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(victim.x, victim.y);
                ctx.stroke();
            });
        }

        ctx.wrap(() => {
            if (false) return;

            ctx.translate(this.x, this.y);

            let aimAngle = angleBetween(this, this.controls.aim);
            ctx.fillStyle = FOV_GRADIENT[+!!victim];
            ctx.beginPath();
            ctx.arc(0, 0, this.magnetRadiusX, aimAngle - PI / 4, aimAngle + PI / 4);
            ctx.lineTo(0, 0);
            ctx.fill();
        });

        if (true && false) {
            ctx.wrap(() => {
                ctx.fillStyle = '#0f0';
                for (let x = this.x - this.magnetRadiusX - 20 ; x < this.x + this.magnetRadiusX + 20 ; x += 4) {
                    for (let y = this.y - this.magnetRadiusY - 20 ; y < this.y + this.magnetRadiusY + 20 ; y += 4) {
                        ctx.globalAlpha = this.strikability({ x, y }, this.magnetRadiusX, this.magnetRadiusY, PI / 2);
                        ctx.fillRect(x - 2, y - 2, 4, 4);
                    }
                }
            });
            ctx.wrap(() => {
                for (let victim of this.scene.category(this.targetTeam)) {
                    let strikability = this.strikability(victim, this.magnetRadiusX, this.magnetRadiusY, PI / 2);
                    if (!strikability) continue;
                    ctx.lineWidth = strikability * 30;
                    ctx.strokeStyle = '#ff0';
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(victim.x, victim.y);
                    ctx.stroke();
                }
            });
        }

        super.render();
    }

    renderBody() {
        ctx.renderLegs(this, '#666');
        ctx.renderArm(this, '#666', () => ctx.renderSword());
        ctx.renderHead(this, '#fec');
        ctx.renderChest(this, '#ccc', 25);
        ctx.renderArmAndShield(this, '#666');
        ctx.renderExhaustion(this, -70);
    }
}

class PlayerController extends CharacterController {
    // get description() {
    //     return 'Player';
    // }

    cycle() {
        let x = 0, y = 0;
        if (DOWN[37] || DOWN[65]) x = -1;
        if (DOWN[38] || DOWN[87]) y = -1;
        if (DOWN[39] || DOWN[68]) x = 1;
        if (DOWN[40] || DOWN[83]) y = 1;

        let camera = firstItem(this.entity.scene.category('camera'));

        if (x || y) this.entity.controls.angle = atan2(y, x);
        this.entity.controls.force = x || y ? 1 : 0;
        this.entity.controls.shield = DOWN[16] || MOUSE_RIGHT_DOWN || TOUCH_SHIELD_BUTTON.down;
        this.entity.controls.attack = MOUSE_DOWN || TOUCH_ATTACK_BUTTON.down;
        this.entity.controls.dash = DOWN[32] || DOWN[17] || TOUCH_DASH_BUTTON.down;

        let mouseRelX = (MOUSE_POSITION.x - 1280 / 2) / (1280 / 2);
        let mouseRelY = (MOUSE_POSITION.y - 720 / 2) / (720 / 2);

        this.entity.controls.aim.x = this.entity.x + mouseRelX * 1280 / 2 / camera.appliedZoom;
        this.entity.controls.aim.y = this.entity.y + mouseRelY * 720 / 2 / camera.appliedZoom;

        if (inputMode == 1) {
            let { touch } = TOUCH_JOYSTICK;
            this.entity.controls.aim.x = this.entity.x + (touch.x - TOUCH_JOYSTICK.x);
            this.entity.controls.aim.y = this.entity.y + (touch.y - TOUCH_JOYSTICK.y);

            this.entity.controls.angle = angleBetween(TOUCH_JOYSTICK, touch);
            this.entity.controls.force = TOUCH_JOYSTICK.touchIdentifier < 0
                ? 0
                : min(1, dist(touch, TOUCH_JOYSTICK) / 50);
        }

        if (x) this.entity.facing = x;
    }
}

class Enemy extends Character {

    constructor() {
        super();
        this.categories.push('enemy');
        this.targetTeam = 'player';
    }

    remove() {
        super.remove();

        // Cancel any remaining aggression
        firstItem(this.scene.category('at'))
            .cancelAggression(this);
    }

    die() {
        super.die();

        for (let player of this.scene.category('player')) {
            player.score += ~~(100 * this.aggression * player.combo);
        }
    }

    damage(amount) {
        super.damage(amount);
        sound(...[1.6,,278,,.01,.01,2,.7,-7.1,,,,.07,1,,,.09,.81,.08]);
    }
}

createEnemyAI = ({
    shield, 
    attackCount,
}) => {
    class EnemyTypeAI extends EnemyAI {
        async doStart() {
            while (1) {
                // Try to be near the player
                await this.startAI(new ReachPlayer(300, 300));
                
                // Wait for our turn to attack
                try {
                    await this.race([
                        new Timeout(3),
                        new BecomeAggressive(),
                    ]);
                } catch (e) {
                    // We failed to become aggressive, start a new loop
                    continue;
                }

                await this.startAI(new BecomeAggressive());

                // Okay we're allowed to be aggro, let's do it!
                let failedToAttack;
                try {
                    await this.race([
                        new Timeout(500 / this.entity.baseSpeed),
                        new ReachPlayer(this.entity.strikeRadiusX, this.entity.strikeRadiusY),
                    ]);

                    for (let i = attackCount ; i-- ; ) {
                        await this.startAI(new Attack(0.5));
                    }
                    await this.startAI(new Wait(0.5));
                } catch (e) {
                    failedToAttack = 1;
                }

                // We're done attacking, let's allow someone else to be aggro
                await this.startAI(new BecomePassive());

                // Retreat a bit so we're not too close to the player
                let dash = !shield && !failedToAttack && random() < 0.5;
                await this.race([
                    new RetreatAI(300, 300),
                    new Wait(dash ? 0.1 : 4),
                    dash 
                        ? new Dash() 
                        : (shield ? new HoldShield() : new AI()),
                ]);
                await this.startAI(new Wait(1));

                // Rinse and repeat
            }
        }
    }

    return EnemyTypeAI;
}

createEnemyType = ({
    stick, sword, axe,
    shield, armor, superArmor,
    attackCount,
}) => {
    let ai = createEnemyAI({ shield, attackCount });

    let weight = 0
        + (!!armor * 0.2) 
        + (!!superArmor * 0.3) 
        + (!!axe * 0.1)
        + (!!(sword || shield) * 0.3);

    let protection = 0
        + (!!shield * 0.3)
        + (!!armor * 0.5)
        + (!!superArmor * 0.7);

    class EnemyType extends Enemy {
        constructor() {
            super();

            this.aggression = 1;
            if (sword) this.aggression += 1;
            if (axe) this.aggression += 2;

            this.health = this.maxHealth = ~~interpolate(100, 400, protection);
            this.strength = axe ? 35 : (sword ? 25 : 10);
            this.baseSpeed = interpolate(120, 50, weight);
    
            if (stick) this.gibs.push(() => ctx.renderStick());
            if (sword) this.gibs.push(() => ctx.renderSword());
            if (shield) this.gibs.push(() => ctx.renderShield());
            if (axe) this.gibs.push(() => ctx.renderAxe());
    
            this.stateMachine = characterStateMachine({
                entity: this, 
                chargeTime: 0.5,
                staggerTime: interpolate(0.3, 0.1, protection),
            });
        }

        get ai() {
            return new ai(this);
        }
    
        renderBody() {
            ctx.renderAttackIndicator(this);
            ctx.renderLegs(this, '#666');
            ctx.renderArm(this, armor || superArmor ? '#666' : '#fec', () => {
                if (stick) ctx.renderStick(this)
                if (sword) ctx.renderSword(this);
                if (axe) ctx.renderAxe(this);
            });
            ctx.renderChest(
                this, 
                armor 
                    ? '#ccc' 
                    : (superArmor ? '#444' : '#fec'), 
                22,
            );

            ctx.renderHead(
                this, 
                superArmor ? '#666' : '#fec', 
                superArmor ? '#000' : '#fec',
            );

            if (shield) ctx.renderArmAndShield(this, armor || superArmor ? '#666' : '#fec');
            ctx.renderExhaustion(this, -70);
            ctx.renderExclamation(this);
        }
    }

    return EnemyType;
};

shield = { shield: 1 };
sword = { sword: 1, attackCount: 2 };
stick = { stick: 1, attackCount: 3 };
axe = { axe: 1, attackCount: 1 };
armor = { armor: 1 };
superArmor = { superArmor: 1 };

ENEMY_TYPES = [
    // Weapon
    StickEnemy = createEnemyType({ ...stick, }),
    AxeEnemy = createEnemyType({ ...axe, }),
    SwordEnemy = createEnemyType({ ...sword, }),

    // Weapon + armor
    SwordArmorEnemy = createEnemyType({ ...sword, ...armor, }),
    AxeArmorEnemy = createEnemyType({ ...axe, ...armor, }),

    // Weapon + armor + shield
    AxeShieldArmorEnemy = createEnemyType({ ...axe, ...shield, ...armor, }),
    SwordShieldArmorEnemy = createEnemyType({ ...sword, ...shield, ...armor, }),

    // Tank
    SwordShieldTankEnemy = createEnemyType({ ...sword,  ...shield, ...superArmor, }),
    AxeShieldTankEnemy = createEnemyType({ ...axe,  ...shield, ...superArmor, }),
];

WAVE_SETTINGS = [
    ENEMY_TYPES.slice(0, 3),
    ENEMY_TYPES.slice(0, 4),
    ENEMY_TYPES.slice(0, 5),
    ENEMY_TYPES.slice(0, 7),
    ENEMY_TYPES,
];

class DummyEnemy extends Enemy {
    constructor() {
        super();
        this.categories.push('enemy');

        this.health = 9999;
    }

    renderBody() {
        ctx.wrap(() => {
            ctx.fillStyle = ctx.resolveColor('#634');
            ctx.fillRect(-2, 0, 4, -20);
        });
        ctx.renderChest(this, '#634', 22);
        ctx.renderHead(this, '#634');
    }

    dash() {}
}

class KingEnemy extends Enemy {
    constructor() {
        super();

        this.gibs = [
            () => ctx.renderSword(),
            () => ctx.renderShield(),
        ];

        this.health = this.maxHealth = 600;
        this.strength = 40;
        this.baseSpeed = 100;

        this.stateMachine = characterStateMachine({
            entity: this, 
            chargeTime: 0.5,
            staggerTime: 0.2,
        });
    }

    renderBody() {
        ctx.renderAttackIndicator(this);
        ctx.renderLegs(this, '#400');
        ctx.renderArm(this, '#400', () => ctx.renderSword());
        ctx.renderHead(this, '#fec');
        ctx.renderCrown(this);
        ctx.renderChest(this, '#900', 25);
        ctx.renderArmAndShield(this, '#400');
        ctx.renderExhaustion(this, -70);
        ctx.renderExclamation(this);
    }
}

class CharacterOffscreenIndicator extends Entity {
    constructor(character) {
        super();
        this.character = character;
    }

    get z() { 
        return 9994; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (!this.character.health) this.remove();
    }

    doRender(camera) {
        if (
            abs(camera.x - this.character.x) < 1280 / 2 / camera.appliedZoom &&
            abs(camera.y - this.character.y) < 720 / 2 / camera.appliedZoom
        ) return;

        let x = between(
            camera.x - (1280 / 2 - 50) / camera.appliedZoom, 
            this.character.x,
            camera.x + (1280 / 2 - 50) / camera.appliedZoom,
        );
        let y = between(
            camera.y - (720 / 2 - 50) / camera.appliedZoom, 
            this.character.y,
            camera.y + (720 / 2 - 50) / camera.appliedZoom,
        );
        ctx.translate(x, y);

        ctx.beginPath();
        ctx.wrap(() => {
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 5;

            ctx.fillStyle = '#f00';
            ctx.rotate(angleBetween({x, y}, this.character));
            ctx.arc(0, 0, 20, -PI / 4, PI / 4, 1);
            ctx.lineTo(40, 0);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, TWO_PI, 1);
            ctx.fill();
        });
        ctx.clip();

        ctx.resolveColor = () => '#f00';
        ctx.scale(0.4, 0.4);
        ctx.translate(0, 30);
        ctx.scale(this.character.facing, 1);
        this.character.renderBody();
    }
}

class Corpse extends Entity {
    constructor(renderElement, sliceType) {
        super();
        this.renderElement = renderElement;
        this.sliceType = sliceType;
    }

    get z() { 
        return -9990; 
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.age > 5) this.remove();

        if (this.age < 0.5) {
            this.scene.add(new Particle(
                '#900',
                [3, 6],
                [this.x, this.x + rnd(-20, 20)],
                [this.y, this.y + rnd(-20, 20)],
                rnd(0.5, 1),
            ));
        }
    }

    doRender() {
        if (this.age > 3 && this.age % 0.25 < 0.125) return;

        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        this.renderElement();
    }
}

// ZzFX - Zuper Zmall Zound Zynth - Micro Edition
// MIT License - Copyright 2019 Frank Force
// https://github.com/KilledByAPixel/ZzFX

// This is a minified build of zzfx for use in size coding projects.
// You can use zzfxV to set volume.
// Feel free to minify it further for your own needs!

// 'use strict';

///////////////////////////////////////////////////////////////////////////////

// ZzFXMicro - Zuper Zmall Zound Zynth - v1.1.8

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name ZzFXMicro.min.js
// @js_externs zzfx, zzfxG, zzfxP, zzfxV, zzfxX
// @language_out ECMASCRIPT_2019
// ==/ClosureCompiler==

let zzfx = (...z)=> zzfxP(zzfxG(...z)); // generate and play sound
let zzfxV = .3;    // volume
let zzfxR = 44100; // sample rate
let zzfxX = new AudioContext; // audio context
let zzfxP = (...samples)=>  // play samples
{
    // create buffer and source
    let buffer = zzfxX.createBuffer(samples.length, samples[0].length, zzfxR),
        source = zzfxX.createBufferSource();

    // copy samples to buffer and play
    samples.map((d,i)=> buffer.getChannelData(i)./*nomangle*/set/*/nomangle*/(d));
    source.buffer = buffer;
    source.connect(zzfxX.destination);
    return source;
}
let zzfxG = // generate samples
(
    // parameters
    volume = 1, randomness = .05, frequency = 220, attack = 0, sustain = 0,
    release = .1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0,
    pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0,
    bitCrush = 0, delay = 0, sustainVolume = 1, decay = 0, tremolo = 0
)=>
{
    // init parameters
    let PI2 = PI*2,
    sign = v => v>0?1:-1,
    startSlide = slide *= 500 * PI2 / zzfxR / zzfxR,
    startFrequency = frequency *= (1 + randomness*2*random() - randomness)
        * PI2 / zzfxR,
    b=[], t=0, tm=0, i=0, j=1, r=0, c=0, s=0, f, length;

    // scale by sample rate
    attack = attack * zzfxR + 9; // minimum attack to prevent pop
    decay *= zzfxR;
    sustain *= zzfxR;
    release *= zzfxR;
    delay *= zzfxR;
    deltaSlide *= 500 * PI2 / zzfxR**3;
    modulation *= PI2 / zzfxR;
    pitchJump *= PI2 / zzfxR;
    pitchJumpTime *= zzfxR;
    repeatTime = repeatTime * zzfxR | 0;

    // generate waveform
    for(length = attack + decay + sustain + release + delay | 0;
        i < length; b[i++] = s)
    {
        if (!(++c%(bitCrush*100|0)))                      // bit crush
        {
            s = shape? shape>1? shape>2? shape>3?         // wave shape
                sin((t%PI2)**3) :                    // 4 noise
                max(min(tan(t),1),-1):     // 3 tan
                1-(2*t/PI2%2+2)%2:                        // 2 saw
                1-4*abs(round(t/PI2)-t/PI2):    // 1 triangle
                sin(t);                              // 0 sin

            s = (repeatTime ?
                    1 - tremolo + tremolo*sin(PI2*i/repeatTime) // tremolo
                    : 1) *
                sign(s)*(abs(s)**shapeCurve) *       // curve 0=square, 2=pointy
                volume * zzfxV * (                        // envelope
                i < attack ? i/attack :                   // attack
                i < attack + decay ?                      // decay
                1-((i-attack)/decay)*(1-sustainVolume) :  // decay falloff
                i < attack  + decay + sustain ?           // sustain
                sustainVolume :                           // sustain volume
                i < length - delay ?                      // release
                (length - i - delay)/release *            // release falloff
                sustainVolume :                           // release volume
                0);                                       // post release

            s = delay ? s/2 + (delay > i ? 0 :            // delay
                (i<length-delay? 1 : (length-i)/delay) *  // release delay
                b[i-delay|0]/2) : s;                      // sample delay
        }

        f = (frequency += slide += deltaSlide) *          // frequency
            cos(modulation*tm++);                    // modulation
        t += f - f*noise*(1 - (sin(i)+1)*1e9%2);     // noise

        if (j && ++j > pitchJumpTime)       // pitch jump
        {
            frequency += pitchJump;         // apply pitch jump
            startFrequency += pitchJump;    // also apply to start
            j = 0;                          // reset pitch jump time
        }

        if (repeatTime && !(++r % repeatTime)) // repeat
        {
            frequency = startFrequency;     // reset frequency
            slide = startSlide;             // reset slide
            j = j || 1;                     // reset pitch jump time
        }
    }

    return b;
}

sound = (...def) => zzfx(...def)./*nomangle*/start/*/nomangle*/();

//
// Sonant-X
//
// Copyright (c) 2014 Nicolas Vanhoren
//
// Sonant-X is a fork of js-sonant by Marcus Geelnard and Jake Taylor. It is
// still published using the same license (zlib license, see below).
//
// Copyright (c) 2011 Marcus Geelnard
// Copyright (c) 2008-2009 Jake Taylor
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//    claim that you wrote the original software. If you use this software
//    in a product, an acknowledgment in the product documentation would be
//    appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such, and must not be
//    misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source
//    distribution.


let WAVE_SPS = 44100;                    // Samples per second
let WAVE_CHAN = 2;                       // Channels
let MAX_TIME = 33; // maximum time, in millis, that the generator can use consecutively

let audioCtx;

// Oscillators
function osc_sin(value)
{
    return sin(value * 6.283184);
}

function osc_square(value) {
    return osc_sin(value) < 0 ? -1 : 1;
}

function osc_saw(value)
{
    return (value % 1) - 0.5;
}

function osc_tri(value)
{
    let v2 = (value % 1) * 4;
    return v2 < 2 ? v2 - 1 : 3 - v2;
}

// Array of oscillator functions
let oscillators = [
    osc_sin,
    osc_square,
    osc_saw,
    osc_tri
];

function getnotefreq(n)
{
    return 0.00390625 * pow(1.059463094, n - 128);
}

function genBuffer(waveSize, callBack) {
    setTimeout(() => {
        // Create the channel work buffer
        var buf = new Uint8Array(waveSize * WAVE_CHAN * 2);
        var b = buf.length - 2;
        var iterate = () => {
            var begin = new Date();
            var count = 0;
            while(b >= 0)
            {
                buf[b] = 0;
                buf[b + 1] = 128;
                b -= 2;
                count += 1;
                if (count % 1000 === 0 && (new Date() - begin) > MAX_TIME) {
                    setTimeout(iterate, 0);
                    return;
                }
            }
            setTimeout(() => callBack(buf), 0);
        };
        setTimeout(iterate, 0);
    }, 0);
}

function applyDelay(chnBuf, waveSamples, instr, rowLen, callBack) {
    let p1 = (instr.fx_delay_time * rowLen) >> 1;
    let t1 = instr.fx_delay_amt / 255;

    let n1 = 0;
    let iterate = () => {
        let beginning = new Date();
        let count = 0;
        while (n1 < waveSamples - p1) {
            var b1 = 4 * n1;
            var l = 4 * (n1 + p1);

            // Left channel = left + right[-p1] * t1
            var x1 = chnBuf[l] + (chnBuf[l+1] << 8) +
                (chnBuf[b1+2] + (chnBuf[b1+3] << 8) - 32768) * t1;
            chnBuf[l] = x1 & 255;
            chnBuf[l+1] = (x1 >> 8) & 255;

            // Right channel = right + left[-p1] * t1
            x1 = chnBuf[l+2] + (chnBuf[l+3] << 8) +
                (chnBuf[b1] + (chnBuf[b1+1] << 8) - 32768) * t1;
            chnBuf[l+2] = x1 & 255;
            chnBuf[l+3] = (x1 >> 8) & 255;
            ++n1;
            count += 1;
            if (count % 1000 === 0 && (new Date() - beginning) > MAX_TIME) {
                setTimeout(iterate, 0);
                return;
            }
        }
        setTimeout(callBack, 0);
    };
    setTimeout(iterate, 0);
}

class AudioGenerator {

    constructor(mixBuf) {
        this.mixBuf = mixBuf;
        this.waveSize = mixBuf.length / WAVE_CHAN / 2;
    }

    getWave() {
        let mixBuf = this.mixBuf;
        let waveSize = this.waveSize;
        // Local variables
        let b, k, x, wave, l1, l2, y;

        // Turn critical object properties into local variables (performance)
        let waveBytes = waveSize * WAVE_CHAN * 2;

        // Convert to a WAVE file (in a binary string)
        l1 = waveBytes - 8;
        l2 = l1 - 36;
        wave = String.fromCharCode(82,73,70,70,
                                   l1 & 255,(l1 >> 8) & 255,(l1 >> 16) & 255,(l1 >> 24) & 255,
                                   87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,
                                   68,172,0,0,16,177,2,0,4,0,16,0,100,97,116,97,
                                   l2 & 255,(l2 >> 8) & 255,(l2 >> 16) & 255,(l2 >> 24) & 255);
        b = 0;
        while (b < waveBytes) {
            // This is a GC & speed trick: don't add one char at a time - batch up
            // larger partial strings
            x = "";
            for (k = 0; k < 256 && b < waveBytes; ++k, b += 2)
            {
                // Note: We amplify and clamp here
                y = 4 * (mixBuf[b] + (mixBuf[b+1] << 8) - 32768);
                y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
                x += String.fromCharCode(y & 255, (y >> 8) & 255);
            }
            wave += x;
        }
        return wave;
    }

    getAudioBuffer(callBack) {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }

        let mixBuf = this.mixBuf;
        let waveSize = this.waveSize;

        let buffer = audioCtx.createBuffer(WAVE_CHAN, this.waveSize, WAVE_SPS); // Create Mono Source Buffer from Raw Binary
        let lchan = buffer.getChannelData(0);
        let rchan = buffer.getChannelData(1);
        let b = 0;
        let iterate = () => {
            var beginning = new Date();
            var count = 0;
            while (b < waveSize) {
                var y = 4 * (mixBuf[b * 4] + (mixBuf[(b * 4) + 1] << 8) - 32768);
                y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
                lchan[b] = y / 32768;
                y = 4 * (mixBuf[(b * 4) + 2] + (mixBuf[(b * 4) + 3] << 8) - 32768);
                y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
                rchan[b] = y / 32768;
                b += 1;
                count += 1;
                if (count % 1000 === 0 && new Date() - beginning > MAX_TIME) {
                    setTimeout(iterate, 0);
                    return;
                }
            }
            setTimeout(() => callBack(buffer), 0);
        };
        setTimeout(iterate, 0);
    }
}

class SoundGenerator {

    constructor(instr, rowLen) {
        this.instr = instr;
        this.rowLen = rowLen || 5605;

        this.osc_lfo = oscillators[instr.lfo_waveform];
        this.osc1 = oscillators[instr.osc1_waveform];
        this.osc2 = oscillators[instr.osc2_waveform];
        this.attack = instr.env_attack;
        this.sustain = instr.env_sustain;
        this.release = instr.env_release;
        this.panFreq = pow(2, instr.fx_pan_freq - 8) / this.rowLen;
        this.lfoFreq = pow(2, instr.lfo_freq - 8) / this.rowLen;
    }

    genSound(n, chnBuf, currentpos) {
        var c1 = 0;
        var c2 = 0;

        // Precalculate frequencues
        var o1t = getnotefreq(n + (this.instr.osc1_oct - 8) * 12 + this.instr.osc1_det) * (1 + 0.0008 * this.instr.osc1_detune);
        var o2t = getnotefreq(n + (this.instr.osc2_oct - 8) * 12 + this.instr.osc2_det) * (1 + 0.0008 * this.instr.osc2_detune);

        // State variable init
        var q = this.instr.fx_resonance / 255;
        var low = 0;
        var band = 0;
        for (var j = this.attack + this.sustain + this.release - 1; j >= 0; --j)
        {
            let k = j + currentpos;

            // LFO
            let lfor = this.osc_lfo(k * this.lfoFreq) * this.instr.lfo_amt / 512 + 0.5;

            // Envelope
            let e = 1;
            if (j < this.attack)
                e = j / this.attack;
            else if (j >= this.attack + this.sustain)
                e -= (j - this.attack - this.sustain) / this.release;

            // Oscillator 1
            var t = o1t;
            if (this.instr.lfo_osc1_freq) t += lfor;
            if (this.instr.osc1_xenv) t *= e * e;
            c1 += t;
            var rsample = this.osc1(c1) * this.instr.osc1_vol;

            // Oscillator 2
            t = o2t;
            if (this.instr.osc2_xenv) t *= e * e;
            c2 += t;
            rsample += this.osc2(c2) * this.instr.osc2_vol;

            // Noise oscillator
            if(this.instr.noise_fader) rsample += (2*random()-1) * this.instr.noise_fader * e;

            rsample *= e / 255;

            // State variable filter
            var f = this.instr.fx_freq;
            if(this.instr.lfo_fx_freq) f *= lfor;
            f = 1.5 * sin(f * 3.141592 / WAVE_SPS);
            low += f * band;
            var high = q * (rsample - band) - low;
            band += f * high;
            switch(this.instr.fx_filter)
            {
                case 1: // Hipass
                    rsample = high;
                    break;
                case 2: // Lopass
                    rsample = low;
                    break;
                case 3: // Bandpass
                    rsample = band;
                    break;
                case 4: // Notch
                    rsample = low + high;
                    break;
                default:
            }

            // Panning & master volume
            t = osc_sin(k * this.panFreq) * this.instr.fx_pan_amt / 512 + 0.5;
            rsample *= 39 * this.instr.env_master;

            // Add to 16-bit channel buffer
            k = k * 4;
            if (k + 3 < chnBuf.length) {
                var x = chnBuf[k] + (chnBuf[k+1] << 8) + rsample * (1 - t);
                chnBuf[k] = x & 255;
                chnBuf[k+1] = (x >> 8) & 255;
                x = chnBuf[k+2] + (chnBuf[k+3] << 8) + rsample * t;
                chnBuf[k+2] = x & 255;
                chnBuf[k+3] = (x >> 8) & 255;
            }
        }
    }

    createAudioBuffer(n, callBack) {
        this.getAudioGenerator(n, ag => {
            ag.getAudioBuffer(callBack);
        });
    }

    getAudioGenerator(n, callBack) {
        var bufferSize = (this.attack + this.sustain + this.release - 1) + (32 * this.rowLen);
        var self = this;
        genBuffer(bufferSize, buffer => {
            self.genSound(n, buffer, 0);
            applyDelay(buffer, bufferSize, self.instr, self.rowLen, function() {
                callBack(new AudioGenerator(buffer));
            });
        });
    }
}

class MusicGenerator {

    constructor(song) {
        this.song = song;
        // Wave data configuration
        this.waveSize = WAVE_SPS * song.songLen; // Total song size (in samples)
    }

    generateTrack(instr, mixBuf, callBack) {
        genBuffer(this.waveSize, chnBuf => {
            // Preload/precalc some properties/expressions (for improved performance)
            var waveSamples = this.waveSize,
                waveBytes = this.waveSize * WAVE_CHAN * 2,
                rowLen = this.song.rowLen,
                endPattern = this.song.endPattern,
                soundGen = new SoundGenerator(instr, rowLen);

            let currentpos = 0;
            let p = 0;
            let row = 0;
            let recordSounds = () => {
                var beginning = new Date();
                while (1) {
                    if (row === 32) {
                        row = 0;
                        p += 1;
                        continue;
                    }
                    if (p === endPattern - 1) {
                        setTimeout(delay, 0);
                        return;
                    }
                    var cp = instr.p[p];
                    if (cp) {
                        var n = instr.c[cp - 1].n[row];
                        if (n) {
                            soundGen.genSound(n, chnBuf, currentpos);
                        }
                    }
                    currentpos += rowLen;
                    row += 1;
                    if (new Date() - beginning > MAX_TIME) {
                        setTimeout(recordSounds, 0);
                        return;
                    }
                }
            };

            let delay = () => applyDelay(chnBuf, waveSamples, instr, rowLen, finalize);

            var b2 = 0;
            let finalize = () => {
                let beginning = new Date();
                let count = 0;

                // Add to mix buffer
                while(b2 < waveBytes) {
                    var x2 = mixBuf[b2] + (mixBuf[b2+1] << 8) + chnBuf[b2] + (chnBuf[b2+1] << 8) - 32768;
                    mixBuf[b2] = x2 & 255;
                    mixBuf[b2+1] = (x2 >> 8) & 255;
                    b2 += 2;
                    count += 1;
                    if (count % 1000 === 0 && (new Date() - beginning) > MAX_TIME) {
                        setTimeout(finalize, 0);
                        return;
                    }
                }
                setTimeout(callBack, 0);
            };
            setTimeout(recordSounds, 0);
        });
    }

    getAudioGenerator(callBack) {
        genBuffer(this.waveSize, mixBuf => {
            let t = 0;
            let recu = () => {
                if (t < this.song.songData.length) {
                    t += 1;
                    this.generateTrack(this.song.songData[t - 1], mixBuf, recu);
                } else {
                    callBack(new AudioGenerator(mixBuf));
                }
            };
            recu();
        });
    }

    createAudioBuffer(callBack) {
        this.getAudioGenerator(ag => ag.getAudioBuffer(callBack));
    }
}

ZEROES = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

SONG = {
    "rowLen": 5513,
    "endPattern": 10,
    "songData": [
        {
            "osc1_oct": 7,
            "osc1_det": 0,
            "osc1_detune": 0,
            "osc1_xenv": 1,
            "osc1_vol": 255,
            "osc1_waveform": 0,
            "osc2_oct": 7,
            "osc2_det": 0,
            "osc2_detune": 0,
            "osc2_xenv": 1,
            "osc2_vol": 255,
            "osc2_waveform": 0,
            "noise_fader": 0,
            "env_attack": 100,
            "env_sustain": 0,
            "env_release": 3636,
            "env_master": 254,
            "fx_filter": 2,
            "fx_freq": 500,
            "fx_resonance": 254,
            "fx_delay_time": 0,
            "fx_delay_amt": 27,
            "fx_pan_freq": 0,
            "fx_pan_amt": 0,
            "lfo_osc1_freq": 0,
            "lfo_fx_freq": 0,
            "lfo_freq": 0,
            "lfo_amt": 0,
            "lfo_waveform": 0,
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
                    "n": ZEROES
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
            "osc1_oct": 8,
            "osc1_det": 0,
            "osc1_detune": 0,
            "osc1_xenv": 1,
            "osc1_vol": 221,
            "osc1_waveform": 0,
            "osc2_oct": 8,
            "osc2_det": 0,
            "osc2_detune": 0,
            "osc2_xenv": 1,
            "osc2_vol": 210,
            "osc2_waveform": 0,
            "noise_fader": 255,
            "env_attack": 50,
            "env_sustain": 150,
            "env_release": 15454,
            "env_master": 229,
            "fx_filter": 3,
            "fx_freq": 11024,
            "fx_resonance": 240,
            "fx_delay_time": 6,
            "fx_delay_amt": 24,
            "fx_pan_freq": 0,
            "fx_pan_amt": 20,
            "lfo_osc1_freq": 0,
            "lfo_fx_freq": 1,
            "lfo_freq": 7,
            "lfo_amt": 64,
            "lfo_waveform": 0,
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
                    "n": ZEROES,
                },
                {
                    "n": ZEROES
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
            "osc1_oct": 7,
            "osc1_det": 0,
            "osc1_detune": 0,
            "osc1_xenv": 0,
            "osc1_vol": 192,
            "osc1_waveform": 1,
            "osc2_oct": 6,
            "osc2_det": 0,
            "osc2_detune": 9,
            "osc2_xenv": 0,
            "osc2_vol": 192,
            "osc2_waveform": 1,
            "noise_fader": 0,
            "env_attack": 137,
            "env_sustain": 2000,
            "env_release": 4611,
            "env_master": 192,
            "fx_filter": 1,
            "fx_freq": 982,
            "fx_resonance": 89,
            "fx_delay_time": 6,
            "fx_delay_amt": 25,
            "fx_pan_freq": 6,
            "fx_pan_amt": 77,
            "lfo_osc1_freq": 0,
            "lfo_fx_freq": 1,
            "lfo_freq": 3,
            "lfo_amt": 69,
            "lfo_waveform": 0,
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
                    "n": ZEROES
                },
                {
                    "n": ZEROES
                },
                {
                    "n": ZEROES
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
            "osc1_oct": 7,
            "osc1_det": 0,
            "osc1_detune": 0,
            "osc1_xenv": 0,
            "osc1_vol": 255,
            "osc1_waveform": 1,
            "osc2_oct": 7,
            "osc2_det": 0,
            "osc2_detune": 9,
            "osc2_xenv": 0,
            "osc2_vol": 154,
            "osc2_waveform": 1,
            "noise_fader": 0,
            "env_attack": 197,
            "env_sustain": 88,
            "env_release": 10614,
            "env_master": 45,
            "fx_filter": 0,
            "fx_freq": 11025,
            "fx_resonance": 255,
            "fx_delay_time": 2,
            "fx_delay_amt": 146,
            "fx_pan_freq": 3,
            "fx_pan_amt": 47,
            "lfo_osc1_freq": 0,
            "lfo_fx_freq": 0,
            "lfo_freq": 0,
            "lfo_amt": 0,
            "lfo_waveform": 0,
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
                    "n": ZEROES
                },
                {
                    "n": ZEROES
                },
                {
                    "n": ZEROES
                },
                {
                    "n": ZEROES
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
            "osc1_oct": 9,
            "osc1_det": 0,
            "osc1_detune": 0,
            "osc1_xenv": 0,
            "osc1_vol": 255,
            "osc1_waveform": 0,
            "osc2_oct": 9,
            "osc2_det": 0,
            "osc2_detune": 12,
            "osc2_xenv": 0,
            "osc2_vol": 255,
            "osc2_waveform": 0,
            "noise_fader": 0,
            "env_attack": 100,
            "env_sustain": 0,
            "env_release": 14545,
            "env_master": 70,
            "fx_filter": 0,
            "fx_freq": 0,
            "fx_resonance": 240,
            "fx_delay_time": 2,
            "fx_delay_amt": 157,
            "fx_pan_freq": 3,
            "fx_pan_amt": 47,
            "lfo_osc1_freq": 0,
            "lfo_fx_freq": 0,
            "lfo_freq": 0,
            "lfo_amt": 0,
            "lfo_waveform": 0,
            "p": [
                0,
                0,
                0,
                6,
                6
            ],
            "c": [
                {
                    "n": ZEROES
                },
                {
                    "n": ZEROES
                },
                {
                    "n": ZEROES
                },
                {
                    "n": ZEROES
                },
                {
                    "n": ZEROES
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
    "songLen": 31
}

playSong = () => new MusicGenerator(SONG).createAudioBuffer(buffer => {
    let source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = 1;

    let gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;
    gainNode.connect(audioCtx.destination);
    source.connect(gainNode);
    source./*nomangle*/start/*/nomangle*/();

    playSong = () => 0;
    setSongVolume = (x) => gainNode.gain.value = x;
});

setSongVolume = () => 0;

class Level {
    constructor() {
        this.scene = new Scene();

        this.scene.add(new Camera());

        DOWN = {};
        MOUSE_DOWN = MOUSE_RIGHT_DOWN = 0;

        this.scene.add(new AggressivityTracker());

        let player = this.scene.add(new Player());
        this.scene.add(new Cursor(player));

        this.scene.add(new Rain());
        this.scene.add(new PauseOverlay());

        for (let i = 2 ; i-- ; ) this.scene.add(new Bird());

        for (let i = 0 ; i < 400 ; i++) {
            let grass = new Grass();
            grass.x = rnd(-2, 2) * 1280;
            grass.y = rnd(-2, 2) * 720;
            this.scene.add(grass);
        }

        for (let i = 0 ; i < 20 ; i++) {
            let bush = new Bush();
            bush.x = random() * 10000;
            this.scene.add(bush);
        }
    }

    cycle(elapsed) {
        this.scene.cycle(elapsed);
    }

    async respawn(x, y) {
        let fade = this.scene.add(new Fade());
        await this.scene.add(new Interpolator(fade, 'alpha', 0, 1, 1)).await();
        let player = firstItem(this.scene.category('player'));
        let camera = firstItem(this.scene.category('camera'));
        player.x = x;
        player.y = y;
        camera.cycle(999);
        await this.scene.add(new Interpolator(fade, 'alpha', 1, 0, 1)).await();
        fade.remove();
    }
}

class IntroLevel extends Level {
    constructor() {
        super();

        let { scene } = this;

        for (let r = 0 ; r < 1 ; r += 1 / 15) {
            let tree = scene.add(new Tree());
            tree.noRegen = 1;
            tree.x = cos(r * TWO_PI) * 600 + rnd(-20, 20);
            tree.y = sin(r * TWO_PI) * 600 + rnd(-20, 20);
        }

        let camera = firstItem(scene.category('camera'));
        camera.zoom = 3;
        camera.cycle(99);

        let player = firstItem(scene.category('player'));
        player.health = 9999;
        player.setController(new CharacterController());

        // Respawn when leaving the area
        (async () => {
            while (1) {
                await scene.waitFor(() => distP(player.x, player.y, 0, 0) > 650);
                await this.respawn(0, 0);
            }
        })();

        (async () => {
            let logo = scene.add(new Logo());
            let fade = scene.add(new Fade());
            await scene.add(new Interpolator(fade, 'alpha', 1, 0, 2)).await();

            let msg = scene.add(new Instruction());
            msg.text = /*nomangle*/'[CLICK] to follow the path'/*/nomangle*/;
            await new Promise(r => onclick = r);
            msg.text = '';

            playSong();

            can.style[/*nomangle*/'cursor'/*/nomangle*/] = 'none';

            player.setController(new PlayerController());
            await scene.add(new Interpolator(logo, 'alpha', 1, 0, 2)).await();
            await camera.zoomTo(1);

            scene.add(new Announcement(/*nomangle*/'Prologue'/*/nomangle*/))

            // Movement tutorial
            msg.text = /*nomangle*/'Use [ARROW KEYS] or [WASD] to move'/*/nomangle*/;
            await scene.waitFor(() => distP(player.x, player.y, 0, 0) > 200);
            logo.remove();

            msg.text = '';

            await scene.delay(1);

            // Roll tutorial
            await this.repeat(
                msg,
                /*nomangle*/'Press [SPACE] or [CTRL] to roll'/*/nomangle*/,
                async () => {
                    await scene.waitFor(() => player.stateMachine.state.dashAngle !== undefined);
                    await scene.waitFor(() => player.stateMachine.state.dashAngle === undefined);
                },
                3,
            );

            // Attack tutorial
            let totalAttackCount = () => Array
                .from(scene.category('enemy'))
                .reduce((acc, enemy) => enemy.damageCount + acc, 0);

            for (let r = 0 ; r < 1 ; r += 1 / 5) {
                let enemy = scene.add(new DummyEnemy());
                enemy.x = cos(r * TWO_PI) * 200;
                enemy.y = sin(r * TWO_PI) * 200;
                enemy.poof();
            }

            await this.repeat(
                msg,
                /*nomangle*/'[LEFT CLICK] to strike a dummy'/*/nomangle*/,
                async () => {
                    let initial = totalAttackCount();
                    await scene.waitFor(() => totalAttackCount() > initial);
                },
                10,
            );

            // Charge tutorial
            await this.repeat(
                msg,
                /*nomangle*/'Hold [LEFT CLICK] to charge a heavy attack'/*/nomangle*/,
                async () => {
                    await scene.waitFor(() => player.stateMachine.state.attackPreparationRatio >= 1);

                    let initial = totalAttackCount();
                    await scene.waitFor(() => totalAttackCount() > initial);
                },
                3,
            );

            // Shield tutorial 
            let SwordArmorEnemy = createEnemyType({ sword: 1, armor: 1, attackCount: 1, });
            let enemy = scene.add(new SwordArmorEnemy());
            enemy.health = 9999;
            enemy.x = camera.x + 1280 / 2 / camera.zoom + 20;
            enemy.y = -99;
            scene.add(new CharacterOffscreenIndicator(enemy));

            await this.repeat(
                msg,
                /*nomangle*/'Hold [RIGHT CLICK] or [SHIFT] to block attacks'/*/nomangle*/,
                async () => {
                    let initial = player.parryCount;
                    await scene.waitFor(() => player.parryCount > initial);
                },
                3,
            );

            scene.add(new CharacterHUD(enemy));

            enemy.health = enemy.maxHealth = 100;
            msg.text = /*nomangle*/'Now slay them!'/*/nomangle*/;
            await scene.waitFor(() => enemy.health <= 0);

            msg.text = '';
            await scene.delay(1);

            await scene.add(new Interpolator(fade, 'alpha', 0, 1, 2)).await();

            let expo = scene.add(new Exposition([
                /*nomangle*/'1254 AD'/*/nomangle*/,
                /*nomangle*/'The Kingdom of Syldavia is being invaded by the Northern Empire.'/*/nomangle*/,
                /*nomangle*/'The Syldavian army is outnumbered and outmatched.'/*/nomangle*/,
                /*nomangle*/'One lone soldier decides to take on the emperor himself.'/*/nomangle*/,
            ]));

            await scene.delay(15);

            await scene.add(new Interpolator(expo, 'alpha', 1, 0, 2)).await();

            level = new GameplayLevel();
        })();

        (async () => {
            let enemy = scene.add(new DummyEnemy());
            enemy.y = -550;
            enemy.poof();

            let label = scene.add(new Label(/*nomangle*/'Skip'/*/nomangle*/));
            label.y = enemy.y - 30;
            label.infinite = 1;

            while (1) {
                let { damageCount } = enemy;
                await scene.waitFor(() => enemy.damageCount > damageCount);

                if (confirm(/*nomangle*/'Skip intro?'/*/nomangle*/)) {
                    level = new GameplayLevel();
                }
            }
        })();
    }

    async repeat(msg, instruction, script, count) {
        for (let i = 0 ; i < count ; i++) {
            msg.text = instruction + ' (' + i + '/' + count + ')';
            await script();
        }
        
        msg.text = instruction + ' (' + count + '/' + count + ')';

        await this.scene.delay(1);
        msg.text = '';
        await this.scene.delay(1);
    }
}

class GameplayLevel extends Level {
    constructor(waveIndex = 0, score = 0) {
        super();

        let { scene } = this;

        let waveStartScore = score;

        let player = firstItem(scene.category('player'));
        player.x = waveIndex * 1280;
        player.y = scene.pathCurve(player.x);
        player.score = score;

        let camera = firstItem(scene.category('camera'));
        camera.cycle(99);

        let playerHUD = scene.add(new PlayerHUD(player));
        scene.add(new Path());

        for (let i = 0 ; i < 15 ; i++) {
            let tree = scene.add(new Tree());
            tree.x = rnd(-1, 1) * 1280 / 2;
            tree.y = rnd(-1, 1) * 720 / 2;
        }

        for (let i = 0 ; i < 20 ; i++) {
            let water = scene.add(new Water());
            water.width = rnd(100, 200);
            water.height = rnd(200, 400);
            water.rotation = random() * TWO_PI;
            water.x = random() * 1280 * 5;
            water.y = random() * 720 * 5;
        }

        // Respawn when far from the path
        (async () => {
            while (1) {
                await scene.waitFor(() => abs(player.y - scene.pathCurve(player.x)) > 1000 || player.x < camera.minX - 1280 / 2);

                let x = max(camera.minX + 1280, player.x);
                await this.respawn(x, scene.pathCurve(x));
            }
        })();

        async function slowMo() {
            player.affectedBySpeedRatio = 1;
            scene.speedRatio = 0.2;
            await camera.zoomTo(3);
            await scene.delay(1.5 * scene.speedRatio);
            await camera.zoomTo(1);
            scene.speedRatio = 1;
            player.affectedBySpeedRatio = 0;
        }

        function spawnWave(enemyCount, enemyTypes) {
            return Array.apply(0, Array(enemyCount)).map(() => {
                let enemy = scene.add(new (pick(enemyTypes))());
                enemy.x = player.x + rnd(-1280 / 2, 1280 / 2);
                enemy.y = player.y + pick([-1, 1]) * (360 + rnd(50, 100));
                scene.add(new CharacterHUD(enemy));
                scene.add(new CharacterOffscreenIndicator(enemy));
                return enemy
            });
        }

        // Scenario
        (async () => {
            let fade = scene.add(new Fade());
            await scene.add(new Interpolator(fade, 'alpha', 1, 0, 2)).await();

            scene.add(new Announcement(/*nomangle*/'The Path'/*/nomangle*/));
            await scene.delay(2);

            playerHUD.progress = playerHUD.progressGauge.displayedValue = waveIndex / 8;

            let nextWaveX = player.x + 1280;
            for ( ; waveIndex < 8 ; waveIndex++) {
                // Show progress
                (async () => {
                    await scene.delay(1);
                    await scene.add(new Interpolator(playerHUD, 'progressAlpha', 0, 1, 1)).await();
                    playerHUD.progress = waveIndex / 8;

                    // Regen a bit of health
                    player.heal(player.maxHealth * 0.5);

                    await scene.delay(3);
                    await scene.add(new Interpolator(playerHUD, 'progressAlpha', 1, 0, 1)).await();
                })();

                let instruction = scene.add(new Instruction());
                (async () => {
                    await scene.delay(10),
                    instruction.text = /*nomangle*/'Follow the path to the right'/*/nomangle*/;
                })();

                await scene.waitFor(() => player.x >= nextWaveX);

                instruction.remove();
                waveStartScore = player.score;

                this.scene.add(new Announcement(/*nomangle*/'Wave '/*/nomangle*/ + (waveIndex + 1)));

                let waveEnemies = spawnWave(
                    3 + waveIndex,
                    WAVE_SETTINGS[min(WAVE_SETTINGS.length - 1, waveIndex)],
                );

                // Wait until all enemies are defeated
                await Promise.all(waveEnemies.map(enemy => scene.waitFor(() => enemy.health <= 0)));
                slowMo();

                this.scene.add(new Announcement(/*nomangle*/'Wave Cleared'/*/nomangle*/));

                nextWaveX = player.x + 2560;
                camera.minX = player.x - 1280;
            }

            // Last wave, reach the king
            await scene.waitFor(() => player.x >= nextWaveX);
            let king = scene.add(new KingEnemy());
            king.x = camera.x + 1280 + 50;
            king.y = scene.pathCurve(king.x);
            scene.add(new CharacterHUD(king));

            await scene.waitFor(() => king.x - player.x < 400);
            await scene.add(new Interpolator(fade, 'alpha', 0, 1, 2 * scene.speedRatio)).await();

            // Make sure the player is near the king
            player.x = king.x - 400;
            player.y = scene.pathCurve(player.x);

            let expo = scene.add(new Exposition([
                /*nomangle*/'At last, he faced the emperor.'/*/nomangle*/,
            ]));

            await scene.delay(3);
            await scene.add(new Interpolator(expo, 'alpha', 1, 0, 2)).await();
            await scene.add(new Interpolator(fade, 'alpha', 1, 0, 2)).await();

            // Give the king an AI so they can start fighting
            let aiType = createEnemyAI({
                shield: 1, 
                attackCount: 3,
            });
            king.setController(new aiType());
            scene.add(new CharacterOffscreenIndicator(king));

            // Spawn some mobs
            spawnWave(5, WAVE_SETTINGS[WAVE_SETTINGS.length - 1]);

            await scene.waitFor(() => king.health <= 0);

            player.health = player.maxHealth = 999;
            BEATEN = 1;

            // Final slomo
            await slowMo();
            await scene.add(new Interpolator(fade, 'alpha', 0, 1, 2 * scene.speedRatio)).await();

            // Congrats screen
            let finalExpo = scene.add(new Exposition([
                /*nomangle*/'After an epic fight, the emperor was defeated.'/*/nomangle*/,
                /*nomangle*/'Our hero\'s quest was complete.'/*/nomangle*/,
                /*nomangle*/'Historians estimate his final score was '/*/nomangle*/ + player.score.toLocaleString() + '.',
            ]));
            await scene.add(new Interpolator(finalExpo, 'alpha', 0, 1, 2 * scene.speedRatio)).await();
            await scene.delay(9 * scene.speedRatio);
            await scene.add(new Interpolator(finalExpo, 'alpha', 1, 0, 2 * scene.speedRatio)).await();

            // Back to intro
            level = new IntroLevel();
        })();

        // Game over
        (async () => {
            await scene.waitFor(() => player.health <= 0);

            slowMo();

            let fade = scene.add(new Fade());
            await scene.add(new Interpolator(fade, 'alpha', 0, 1, 2 * scene.speedRatio)).await();
            scene.speedRatio = 2;

            let expo = scene.add(new Exposition([
                // Story
                pick([
                    /*nomangle*/'Failing never affected his will, only his score.'/*/nomangle*/,
                    /*nomangle*/'Giving up was never an option.'/*/nomangle*/,
                    /*nomangle*/'His first attempts weren\'t successful.'/*/nomangle*/,
                    /*nomangle*/'After licking his wounds, he resumed his quest.'/*/nomangle*/,
                ]), 

                // Tip
                pick([
                    /*nomangle*/'His shield would not fail him again ([SHIFT] / [RIGHT CLICK])'/*/nomangle*/,
                    /*nomangle*/'Rolling would help him dodge attacks ([SPACE] / [CTRL])'/*/nomangle*/,
                    /*nomangle*/'Heavy attacks would be key to his success'/*/nomangle*/,
                ]),
            ]));

            await scene.delay(6);
            await scene.add(new Interpolator(expo, 'alpha', 1, 0, 2)).await();

            // Start a level where we left off
            level = new GameplayLevel(waveIndex, max(0, waveStartScore - 5000)); // TODO figure out a value
        })();
    }
}

class TestLevel extends Level {
    constructor() {
        super();

        let player = firstItem(this.scene.category('player'));
        player.health = player.maxHealth = 9999;
        
        this.scene.add(new PlayerHUD(player));

        let camera = firstItem(this.scene.category('camera'));
        // camera.zoom = 3;

        // player.health = player.maxHealth = Number.MAX_SAFE_INTEGER;

        this.scene.add(new Path())

        for (let r = 0 ; r < 1 ; r += 1 / 5) {
            let enemy = this.scene.add(new StickEnemy());
            enemy.x = cos(r * TWO_PI) * 100;
            enemy.y = -400 + sin(r * TWO_PI) * 100;
            enemy.setController(new AI());
            enemy.health = enemy.maxHealth = 9999;
            enemy.poof();

            this.scene.add(new CharacterHUD(enemy));
            this.scene.add(new CharacterOffscreenIndicator(enemy));
        }

        // let king = this.scene.add(new KingEnemy());
        // king.x = 400;
        // this.scene.add(new CharacterHUD(king));

        // for (let r = 0 ; r < 1 ; r += 1 / 10) {
        //     let type = pick(ENEMY_TYPES);
        //     let enemy = this.scene.add(new type());
        //     enemy.x = cos(r * TWO_PI) * 400;
        //     enemy.y = sin(r * TWO_PI) * 400;
        //     enemy.poof();

        //     this.scene.add(new CharacterHUD(enemy));
        // }

        for (let i = 0 ; i < 20 ; i++) {
            let tree = new Tree();
            tree.x = random() * 10000;
            // this.scene.add(tree);
        }

        // (async () => {
        //     let y = 0;
        //     for (let type of ENEMY_TYPES) {
        //         let enemy = this.scene.add(new type());
        //         enemy.x = player.x + 200;
        //         enemy.y = player.y;
        //         enemy.poof();

        //         this.scene.add(new CharacterHUD(enemy));

        //         await this.scene.waitFor(() => enemy.health <= 0);
        //         await this.scene.delay(1);
        //     }
        // })();
    }
}

class ScreenshotLevel extends Level {
    constructor() {
        super();

        oncontextmenu = () => {};

        let player = firstItem(this.scene.category('player'));
        player.age = 0.4;

        MOUSE_POSITION.x = Number.MAX_SAFE_INTEGER;
        MOUSE_POSITION.y = 720 / 2;
        DOWN[39] = 1;

        let camera = firstItem(this.scene.category('camera'));
        camera.zoom = 2;
        camera.cycle(99);

        this.scene.add(new Path());

        for (let entity of Array.from(this.scene.entities)) {
            if (entity instanceof Bush) entity.remove();
            if (entity instanceof Bird) entity.remove();
            if (entity instanceof Cursor) entity.remove();
        }

        let announcement = this.scene.add(new Announcement(/*nomangle*/'Path to Glory'/*/nomangle*/));
        announcement.age = 1;

        let bird1 = this.scene.add(new Bird());
        bird1.x = player.x + 100;
        bird1.y = player.y - 200;

        let bird2 = this.scene.add(new Bird());
        bird2.x = player.x + 150;
        bird2.y = player.y - 150;

        let bird3 = this.scene.add(new Bird());
        bird3.x = player.x - 250;
        bird3.y = player.y + 50;

        let tree1 = this.scene.add(new Tree());
        tree1.x = player.x - 200;
        tree1.y = player.y - 50;

        let tree2 = this.scene.add(new Tree());
        tree2.x = player.x + 200;
        tree2.y = player.y - 150;

        let tree3 = this.scene.add(new Tree());
        tree3.x = player.x + 300;
        tree3.y = player.y + 150;

        let bush1 = this.scene.add(new Bush());
        bush1.x = player.x + 100;
        bush1.y = player.y - 50;

        let bush2 = this.scene.add(new Bush());
        bush2.x = player.x - 200;
        bush2.y = player.y + 50;

        let bush3 = this.scene.add(new Bush());
        bush3.x = player.x + 50;
        bush3.y = player.y - 200;

        let water1 = this.scene.add(new Water());
        water1.x = player.x - 100;
        water1.y = player.y - 350;
        water1.rotation = PI / 8;
        water1.width = 200;
        water1.height = 200;

        let water2 = this.scene.add(new Water());
        water2.x = player.x + 350;
        water2.y = player.y - 150;
        water2.rotation = PI / 8;
        water2.width = 200;
        water2.height = 200;

        let enemy1 = this.scene.add(new KingEnemy());
        enemy1.x = player.x + 180;
        enemy1.y = player.y - 30;
        enemy1.setController(new AI());
        enemy1.controls.aim.x = player.x;
        enemy1.controls.aim.y = player.y;
        enemy1.controls.attack = 1;
        enemy1.cycle(0);
        enemy1.cycle(0.1);

        let enemy2 = this.scene.add(new AxeShieldTankEnemy());
        enemy2.x = player.x - 100;
        enemy2.y = player.y - 100;
        enemy2.setController(new AI());
        enemy2.controls.aim.x = player.x;
        enemy2.controls.aim.y = player.y;
        enemy2.controls.force = 1;
        enemy2.age = 0.6;
        enemy2.controls.angle = angleBetween(enemy2, player)

        this.cycle(0); // helps regen grass
    }
}

onresize = () => {
    let windowWidth = innerWidth,
        windowHeight = innerHeight,

        availableRatio = windowWidth / windowHeight, // available ratio
        canvasRatio = 1280 / 720, // base ratio
        appliedWidth,
        appliedHeight,
        containerStyle = /*nomangle*/t/*/nomangle*/.style;

    if (availableRatio <= canvasRatio) {
        appliedWidth = windowWidth;
        appliedHeight = appliedWidth / canvasRatio;
    } else {
        appliedHeight = windowHeight;
        appliedWidth = appliedHeight * canvasRatio;
    }

    containerStyle.width = appliedWidth + 'px';
    containerStyle.height = appliedHeight + 'px';
};

firstItem = (iterable) => {
    for (let item of iterable) {
        return item;
    }
}

class RNG {
    constructor() {
        this.index = 0;
        this.elements = Array.apply(0, Array(50)).map(() => random());
    }

    next(min = 0, max = 1) {
        return this.elements[this.index++ % this.elements.length] * (max - min) + min;
    }

    reset() {
        this.index = 0;
    }
}

regenEntity = (entity, radiusX, radiusY, pathMinDist = 50) => {
    let camera = firstItem(entity.scene.category('camera'));
    let regen = 0;
    while (entity.x < camera.x - radiusX) {
        entity.x += radiusX * 2;
        regen = 1;
    } 
    
    while (entity.x > camera.x + radiusX) {
        entity.x -= radiusX * 2;
        regen = 1;
    }

    while (entity.y < camera.y - radiusY) {
        entity.y += radiusX * 2;
    } 
    
    while (entity.y > camera.y + radiusY) {
        entity.y -= radiusX * 2;
    }

    while (regen) {
        entity.y = entity.scene.pathCurve(entity.x) + rnd(pathMinDist, 500) * pick([-1, 1]);
        let distToPath = abs(entity.y - entity.scene.pathCurve(entity.x));
        regen = distToPath < pathMinDist || entity.inWater;
    }
};


class Scene {
    constructor() {
        this.entities = new Set();
        this.categories = new Map();
        this.sortedEntities = [];

        this.speedRatio = 1;
        this.onCycle = new Set();
    }

    add(entity) {
        if (this.entities.has(entity)) return;
        this.entities.add(entity);
        entity.scene = this;

        this.sortedEntities.push(entity);

        for (let category of entity.categories) {
            if (!this.categories.has(category)) {
                this.categories.set(category, new Set([entity]));
            } else {
                this.categories.get(category).add(entity);
            }
        }

        return entity;
    }

    category(category) {
        return this.categories.get(category) || [];
    }

    remove(entity) {
        this.entities.delete(entity);

        for (let category of entity.categories) {
            if (this.categories.has(category)) {
                this.categories.get(category).delete(entity);
            }
        }

        let index = this.sortedEntities.indexOf(entity);
        if (index >= 0) this.sortedEntities.splice(index, 1);
    }

    cycle(elapsed) {
        if (true && DOWN[70]) elapsed *= 3;
        if (true && DOWN[71]) elapsed *= 0.1;
        if (GAME_PAUSED) return;

        for (let entity of this.entities) {
            entity.cycle(elapsed * (entity.affectedBySpeedRatio ? this.speedRatio : 1));
        }

        for (let onCycle of this.onCycle) {
            onCycle();
        }
    }

    pathCurve(x) {
        let main = sin(x * TWO_PI / 2000) * 200;
        let wiggle = sin(x * TWO_PI / 1000) * 100;
        return main + wiggle;
    }

    render() {
        let camera = firstItem(this.category('camera'));

        // Background
        ctx.fillStyle = '#996';
        ctx.fillRect(0, 0, 1280, 720);

        // Thunder
        if (camera.age % 10 < 0.3 && camera.age % 0.2 < 0.1) {
            ctx.wrap(() => {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, 1280, 720);
            });
        }
        
        ctx.wrap(() => {
            ctx.scale(camera.appliedZoom, camera.appliedZoom);
            ctx.translate(
                1280 / 2 / camera.appliedZoom - camera.x, 
                720 / 2 / camera.appliedZoom - camera.y,
            );

            this.sortedEntities.sort((a, b) => a.z - b.z);

            for (let entity of this.sortedEntities) {
                ctx.wrap(() => entity.render());
            }
        });
    }

    async waitFor(condition) {
        return new Promise((resolve) => {
            let checker = () => {
                if (condition()) {
                    this.onCycle.delete(checker);
                    resolve();
                }
            };
            this.onCycle.add(checker);
        })
    }

    async delay(timeout) {
        let entity = this.add(new Entity());
        await this.waitFor(() => entity.age > timeout);
        entity.remove();
    }
}

onload = () => {
    can = document.querySelector(/*nomangle*/'canvas'/*/nomangle*/);
    can.width = 1280;
    can.height = 720;

    ctx = can.getContext('2d');

    // if (inputMode == 1) {
    //     can.width *= 0.5;
    //     can.height *= 0.5;
    //     ctx.scale(0.5, 0.5);
    // }

    onresize();

    if (false) {
        oncontextmenu = () => {};
        ctx.wrap(() => {
            can.width *= 10;
            can.height *= 10;
            ctx.scale(10, 10);

            ctx.translate(1280 / 2, 720 / 2)
            ctx.scale(5, 5);
            ctx.translate(0, 30);
            new Player().renderBody();
        });
        return;
    }

    frame();
};

let lastFrame = performance.now();

let level = new IntroLevel();
if (false) level = new ScreenshotLevel();

frame = () => {
    let current = performance.now();
    let elapsed = (current - lastFrame) / 1000;
    lastFrame = current;

    // Game update
    if (!false) level.cycle(elapsed);

    // Rendering
    ctx.wrap(() => level.scene.render());

    if (true && !false) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.textAlign = /*nomangle*/'left'/*/nomangle*/;
        ctx.textBaseline = /*nomangle*/'bottom'/*/nomangle*/;
        ctx.font = /*nomangle*/'14pt Courier'/*/nomangle*/;
        ctx.lineWidth = 3;

        let y = 720 - 10;
        for (let line of [
            /*nomangle*/'FPS: '/*/nomangle*/ + ~~(1 / elapsed),
            /*nomangle*/'Entities: '/*/nomangle*/ + level.scene.entities.size,
        ].reverse()) {
            ctx.strokeText(line, 10, y);
            ctx.fillText(line, 10, y);
            y -= 20;
        }
    }

    requestAnimationFrame(frame);
}
