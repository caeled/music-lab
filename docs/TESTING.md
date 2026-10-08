# Browser verification checklist

Before a release, open index.html in current desktop Chrome/Edge, Firefox, Safari, and mobile Safari/Chrome on real devices where available.

- Press/release mouse, simultaneous touches, computer keys, and Space/Enter on a focused piano key. Notes end on release, blur, tab switch, and Quiet everything.
- Confirm A4 is 440 Hz; C4 to G4 is a perfect fifth; C4 to C5 is an octave.
- Select C major/minor and C major/minor triads; confirm highlights and audible patterns. Stop an in-progress pattern and confirm it does not restart.
- Record several notes including a chord. Finish, play, stop, export, reload the export, and compare timings and velocities.
- Load format-0/1 files with tempo changes, running status, track names, and overlaps. Try invalid, truncated, format-2, and SMPTE files; expect clear error text.
- Play twice quickly and stop mid-song; verify no lingering voices or duplicate animation loops.
- Test Tone Lab waveforms, 220/440/880 Hz, zero amplitude, invalid input, start/stop, and loss of focus.
- At mobile widths verify readable controls, horizontal piano scrolling, file selection, and MIDI export/download behavior.
- Navigate with Tab, use visible focus indicators, check labels/status with a screen reader, and zoom to 200%.
- On an HTTPS host, connect/disconnect a physical MIDI input. Also check permission denial and a browser without Web MIDI.

Automated parser tests run in Node. Full compatibility and hardware checks require the actual devices; do not infer those results from a desktop test.
