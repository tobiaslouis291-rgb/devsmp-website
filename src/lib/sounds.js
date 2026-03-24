let ctx = null;
function ac() { if (!ctx)
    ctx = new AudioContext(); if (ctx.state === 'suspended')
    ctx.resume(); return ctx; }
function tone(f, t, d, v = 0.2, f0) {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = t;
    f0 ? (o.frequency.setValueAtTime(f0, c.currentTime), o.frequency.exponentialRampToValueAtTime(f, c.currentTime + d * .8)) : o.frequency.setValueAtTime(f, c.currentTime);
    g.gain.setValueAtTime(v, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
    o.start();
    o.stop(c.currentTime + d);
}
export const sounds = {
    click() { tone(900, 'sine', .06, .1); },
    coin() { [0, .05, .1].forEach(d => setTimeout(() => tone(1100 + Math.random() * 500, 'sine', .15, .15), d * 1000)); },
    bigWin() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 'sine', .4, .25), i * 100)); },
    jackpot() { [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => setTimeout(() => tone(f, 'sine', .5, .3), i * 80)); },
    lose() { tone(180, 'sawtooth', .6, .18, 350); },
    spin() { for (let i = 0; i < 20; i++)
        setTimeout(() => tone(80 + Math.random() * 180, 'square', .04, .025), i * 50); },
    cardDeal() { const c = ac(), b = c.createBuffer(1, c.sampleRate * .07, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * .28; const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(); },
    roulette() { for (let i = 0; i < 30; i++) {
        const t = i * .08 + Math.random() * .02;
        const c = ac(), o = c.createOscillator(), g = c.createGain();
        o.connect(g);
        g.connect(c.destination);
        o.frequency.setValueAtTime(500 + Math.random() * 400, c.currentTime + t);
        g.gain.setValueAtTime(.06 * (1 - i / 30), c.currentTime + t);
        g.gain.exponentialRampToValueAtTime(.001, c.currentTime + t + .06);
        o.start(c.currentTime + t);
        o.stop(c.currentTime + t + .07);
    } },
    crash() { tone(70, 'sawtooth', .9, .3, 320); },
    cashout() { [523, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 'sine', .2, .22), i * 80)); },
    tick() { tone(440, 'sine', .05, .06); },
    dice() { for (let i = 0; i < 6; i++)
        setTimeout(() => tone(180 + Math.random() * 300, 'square', .06, .04), i * 35); },
    versus() { [330, 440, 550, 660].forEach((f, i) => setTimeout(() => tone(f, 'triangle', .15, .18), i * 55)); },
    notification() { tone(880, 'sine', .15, .15); },
};
