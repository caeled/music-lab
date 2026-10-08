# Music Lab

A small, framework-free music learning studio. Play a two-octave piano, see the patterns behind scales and chords, inspect MIDI, and explore the shape of sound.

## Open it

Open `index.html` in a modern browser. No build, package install, account, server, or network connection is needed for core features. For hosting, upload `index.html`, `css/`, and `js/` to any static host. On GitHub Pages, choose **Deploy from a branch → main → / (root)** in the repository's Pages settings. Hosting is not automatically enabled by this commit.

## Explore

- **Piano:** C4 through C6 (two octaves plus the final C), simultaneous mouse/touch notes, computer-key mappings printed on each key, note names, frequencies, and the interval from the previous note. Focus a piano key and use Space/Enter for accessible playback.
- **Theory:** choose a root and major/natural minor scale, major/minor triad, or chromatic scale. See highlighted notes and hear the pattern. Labels use sharp pitch names; explanatory text covers enharmonic flat names. This is pitch-class exploration, not a full notation or key-signature engine.
- **MIDI desk:** load `.mid`/`.midi`, see a pitch/time roll and first 100 notes, play through the built-in synth, record the piano, and export a format-0 MIDI file. Try the included original melody without downloading anything. Recording replaces the current song. Finish recording before loading another song. Export tempo changes the MIDI beat grid, while preserving note timing in seconds.
- **Tone Lab:** 20–20,000 Hz, amplitude, four waveforms, nearest equal-tempered note and cents, gentle start/stop, and a two-cycle illustrative waveform. The illustration is an ideal signal shape, not a live oscilloscope or speaker measurement.
- **Hardware input:** optional Web MIDI keyboard connection, requested only when you click Connect. No SysEx permission is requested.

## Compatibility

Core features target modern browsers on **Windows, macOS, Linux, iPadOS, Android, and Chromebook**. Web Audio starts after user interaction; audio may pause when the app goes into the background. Touch replaces computer-keyboard input on mobile. The piano can scroll horizontally on narrow screens.

MIDI **files** use our JavaScript parser, independently of hardware Web MIDI. Hardware MIDI support depends on browser and device, generally requires HTTPS or localhost, and requires user permission. See [MDN's Web MIDI compatibility reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API). Unsupported hardware does not prevent using the rest of the app.

No files are uploaded, and there are no analytics, external fonts, or runtime dependencies. Recordings live in memory and disappear on reload; export to keep them. Start with a comfortable device volume.

## MIDI scope and limitations

Reads Standard MIDI File formats 0 and 1 with PPQN timing, running status, tempo maps, track names, program numbers, velocity, and overlapping notes. Rejects format 2 and SMPTE timing with an explanation. Files are limited to 10 MB, 256 tracks, and 100,000 notes. Unclosed notes end at their track's end (or a short fallback duration).

Playback uses a simple triangle-wave synth for all channels, including percussion. Instrument programs are inspected but not synthesized; sustain pedals, pitch bends, expression, and other controllers are not rendered. Out-of-range notes still sound and appear in the roll, but only C4–C6 can light the piano. Export retains notes, velocities, channels, and timing; it creates one track at the selected tempo and does not preserve imported metadata/controllers.

## Structure and verification

```text
index.html          accessible page and controls
css/style.css       responsive visual design
js/app.js           audio, piano, theory, MIDI UI, and Tone Lab
js/midi.js          standalone MIDI reader/writer
tests/midi.test.cjs binary fixtures and round-trip tests
docs/TESTING.md     manual browser/device checklist
```

Run `node --test tests/midi.test.cjs` to check MIDI parsing/export. No development dependencies are needed. Device/platform claims describe the browser APIs targeted, not a certification that every device has been tested. See the test checklist for device verification.
