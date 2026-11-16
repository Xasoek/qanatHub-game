"""Deterministic sound design for the One Sol intro: ambience, suit breathing, robot chirps,
two-tone alarm, radio click, visor dust hiss, launch rumble, signal-loss blips. 48 kHz mono WAV."""
import numpy as np, scipy.signal as ss, scipy.io.wavfile as wf, os, sys

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/audio'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(1234)

def t(sec): return np.arange(int(sec * SR)) / SR
def lp(x, f, o=4): return ss.sosfilt(ss.butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=4): return ss.sosfilt(ss.butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=3): return ss.sosfilt(ss.butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def norm(x, peak=.9): return x / (np.max(np.abs(x)) + 1e-9) * peak
def fade(x, a=.02, b=.05):
    n = len(x); ia, ib = int(a * SR), int(b * SR)
    e = np.ones(n); e[:ia] = np.linspace(0, 1, ia) if ia else 1; e[n - ib:] = np.linspace(1, 0, ib) if ib else 1
    return x * e
def save(name, x, peak=.9):
    x = norm(x, peak); wf.write(os.path.join(OUT, name), SR, (x * 32767).astype(np.int16)); print(name, round(len(x) / SR, 2), 's')
def brown(n):
    w = rng.standard_normal(n); b = np.cumsum(w); b = hp(b, 8, 2); return b / np.max(np.abs(b))
def pink(n):
    w = rng.standard_normal(n); f = np.fft.rfft(w); k = np.arange(len(f)); k[0] = 1; return np.fft.irfft(f / np.sqrt(k), n)

# 1. soft base ambience: low hum + muffled thin-air wash (loopable 12 s)
T = t(12)
hum = .35 * np.sin(2 * np.pi * 55 * T) + .18 * np.sin(2 * np.pi * 110 * T + .3) + .06 * np.sin(2 * np.pi * 165 * T)
hum *= .8 + .2 * np.sin(2 * np.pi * .13 * T)
wash = lp(brown(len(T)), 260) * .9
amb = hum * .5 + wash
amb = fade(amb, 1.0, 1.0)
save('amb_day.wav', amb, .5)

# 2. quiet suit breathing (inhale/exhale, ~4.2 s cycle), 12 s
T = t(12.6); n = len(T)
noise = bp(rng.standard_normal(n), 300, 2600)
env = np.zeros(n)
for c0 in np.arange(0, 12.6, 4.2):
    for (a, d, amp) in [(c0 + .2, 1.3, 1.0), (c0 + 1.9, 1.7, .75)]:
        m = (T >= a) & (T < a + d); x = (T[m] - a) / d
        env[m] += amp * np.sin(np.pi * x) ** 1.6
breath = lp(noise * env, 1800) + .2 * lp(noise * env, 500)
save('breath.wav', breath, .45)

# 3. robot chirps (soft sine glides with a tiny warble; friendly, not arcade)
def chirp(segments, dur_tail=.05):
    out = []
    for f0, f1, d, amp in segments:
        T = t(d); f = f0 * (f1 / f0) ** (T / d)
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = np.sin(ph) + .25 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
        s *= (1 + .04 * np.sin(2 * np.pi * 28 * T))
        e = np.minimum(1, T / .012) * np.exp(-T / (d * .8))
        out.append(s * e * amp)
        out.append(np.zeros(int(.03 * SR)))
    x = np.concatenate(out + [np.zeros(int(dur_tail * SR))])
    return lp(x, 5000)
save('chirp_happy.wav', chirp([(900, 1500, .09, 1), (1100, 1800, .11, .9), (1500, 2300, .16, .8)]), .55)
save('chirp_worried.wav', chirp([(1400, 900, .16, .9), (1000, 760, .2, .7)]), .5)
save('chirp_alert.wav', chirp([(1200, 2100, .07, 1), (1200, 2100, .07, 1)]), .5)
save('chirp_relieved.wav', chirp([(700, 1100, .14, .8), (950, 1500, .22, .9), (1300, 1250, .3, .6)]), .5)

# 4. two-tone alarm heard through the suit radio (band-limited), 6 s
T = t(6); f = np.where((T % 1.0) < .5, 660, 880)
ph = 2 * np.pi * np.cumsum(f) / SR
al = np.sign(np.sin(ph)) * .35 + np.sin(ph) * .65
al = bp(al, 350, 3200) * (.75 + .25 * np.minimum(1, T / .3))
gate = np.ones_like(T)
for k in range(12):  # tiny gap between tones
    m = (T % .5) > .47; gate[m] = .25
al *= lp(gate, 200)
save('alarm.wav', fade(al, .05, .3), .5)

# 5. radio static click
T = t(.35)
st = bp(rng.standard_normal(len(T)), 900, 5000) * np.exp(-T / .07)
click = np.zeros(len(T)); click[:120] = np.hanning(240)[:120][::-1]
save('radio_click.wav', st * .7 + click, .6)

# 6. dust hiss on the visor: builds over 7 s, then cuts dead (silence comes from the cut)
T = t(7.5)
pk = pink(len(T)); hs = hp(pk, 1500) * .7 + bp(pk, 300, 1500) * .5
grain = (rng.random(len(T)) < .004) * rng.standard_normal(len(T)) * 3
hs = hs + hp(grain, 2500)
env = (T / 7.5) ** 1.6 * (1 + .15 * np.sin(2 * np.pi * .7 * T))
save('dust_hiss.wav', hs * env, .7)

# 7. launch rumble: deep, muffled, swell then fade to silence (8 s)
T = t(4.4)
rb = lp(brown(len(T)), 120, 4) + .5 * lp(rng.standard_normal(len(T)), 60, 4) * 4
sub = np.sin(2 * np.pi * 34 * T + 2 * np.sin(2 * np.pi * .7 * T)) * .5
rum = rb + sub
env = np.minimum(1, T / .6) ** 2 * np.exp(-np.maximum(0, T - 1.6) / .9) * np.minimum(1, (4.4 - T) / .5)
save('rumble.wav', rum * env, .85)

# 8. signal-loss blips on the helmet display: three descending blips + a low "lost" tone
def blip(f, d=.09, amp=1):
    T = t(d); return np.sin(2 * np.pi * f * T) * np.exp(-T / (d * .5)) * np.minimum(1, T / .004) * amp
seq = np.zeros(int(2.4 * SR))
for i, (f, at) in enumerate([(1320, .0), (1100, .4), (920, .8)]):
    b = blip(f); s = int(at * SR); seq[s:s + len(b)] += b * (1 - i * .15)
lost = blip(520, .5, .6); s = int(1.2 * SR); seq[s:s + len(lost)] += lost
save('signal_loss.wav', lp(seq, 4000), .4)

# 9. engine ignition hiss (soft, under the rumble)
T = t(2.5)
ig = bp(rng.standard_normal(len(T)), 200, 2400) * np.minimum(1, T / .25) * np.exp(-T / 1.2)
save('ignition.wav', ig, .6)
