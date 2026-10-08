/* Dependency-free Standard MIDI File reader/writer. Times are seconds. */
(function (global) {
  'use strict';
  function parse(buffer) {
    const d = new DataView(buffer); let p = 0, end = d.byteLength;
    const need = n => { if (p + n > end) throw Error('Truncated MIDI file.'); };
    const byte = () => { need(1); return d.getUint8(p++); };
    const u16 = () => (byte() << 8) | byte();
    const u32 = () => (byte() * 16777216 + (byte() << 16) + (byte() << 8) + byte());
    const tag = () => String.fromCharCode(byte(), byte(), byte(), byte());
    const vlq = () => { let n = 0; for (let i = 0; i < 4; i++) { const b = byte(); n = n * 128 + (b & 127); if (!(b & 128)) return n; } throw Error('Invalid MIDI variable-length value.'); };
    if (tag() !== 'MThd') throw Error('This is not a Standard MIDI File.');
    const len = u32(); if (len < 6) throw Error('Invalid MIDI header.'); need(len);
    const headerEnd = p + len, format = u16(), tracks = u16(), division = u16(); p = headerEnd;
    if (format > 1) throw Error('Format 2 (independent songs) is not supported. Use format 0 or 1.');
    if (!division || division & 32768) throw Error('SMPTE timing is not supported. Use a MIDI file with beat-based timing.');
    if (!tracks || tracks > 256) throw Error('Unsupported track count.');
    const tempos = [{ tick: 0, tempo: 500000 }], raw = [], info = []; let order = 0, maxTick = 0;
    for (let track = 0; track < tracks; track++) {
      end = d.byteLength; if (tag() !== 'MTrk') throw Error('Missing MIDI track.'); const size = u32(); need(size); end = p + size;
      let tick = 0, running = 0, name = '', programs = new Set(); const active = new Map();
      while (p < end) {
        tick += vlq(); maxTick = Math.max(maxTick, tick); let status = byte(), first;
        if (status < 128) { first = status; status = running; if (!status) throw Error('Invalid MIDI running status.'); }
        if (status === 255) {
          running = 0; const type = byte(), n = vlq(); need(n);
          if (type === 81 && n === 3) tempos.push({tick, tempo:(d.getUint8(p)<<16)|(d.getUint8(p+1)<<8)|d.getUint8(p+2), order:order++});
          if (type === 3) name = new TextDecoder().decode(new Uint8Array(buffer, p, n));
          p += n; if (type === 47) { p = end; break; } continue;
        }
        if (status === 240 || status === 247) { running = 0; const n = vlq(); need(n); p += n; continue; }
        if (status < 128 || status >= 240) throw Error('Unsupported MIDI event.');
        running = status; const kind = status >> 4, channel = status & 15, a = first === undefined ? byte() : first, b = (kind === 12 || kind === 13) ? 0 : byte();
        if (a > 127 || b > 127) throw Error('Invalid MIDI data byte.');
        if (kind === 12) programs.add(a);
        const key = channel + ':' + a;
        if (kind === 9 && b) { if (!active.has(key)) active.set(key, []); active.get(key).push({midi:a, tick, velocity:b, track:track+1, channel:channel+1}); }
        if (kind === 8 || (kind === 9 && !b)) { const queue = active.get(key); if (queue?.length) raw.push({...queue.shift(), endTick:tick}); }
      }
      for (const queue of active.values()) for (const n of queue) raw.push({...n,endTick:Math.max(tick,n.tick+division/4)});
      info.push({name, programs:[...programs]});
    }
    tempos.sort((a,b)=>a.tick-b.tick || (a.order ?? -1)-(b.order ?? -1));
    let prev = 0, seconds = 0, tempo = 500000; const segments = [];
    for (const t of tempos) { if (!t.tempo) throw Error('Invalid MIDI tempo.'); seconds += (t.tick-prev)*tempo/division/1000000; segments.push({tick:t.tick,seconds,tempo:t.tempo}); prev=t.tick;tempo=t.tempo; }
    const time = tick => { let lo=0,hi=segments.length-1; while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(segments[mid].tick<=tick)lo=mid;else hi=mid-1;}const s=segments[lo];return s.seconds+(tick-s.tick)*s.tempo/division/1000000; };
    const notes = raw.map(n=>({midi:n.midi,start:time(n.tick),duration:Math.max(.01,time(n.endTick)-time(n.tick)),velocity:n.velocity,track:n.track,channel:n.channel})).sort((a,b)=>a.start-b.start);
    if (notes.length > 100000) throw Error('Too many notes for this lab.');
    return {notes, format, tracks, info, tempos:tempos.length-1, duration:time(maxTick)};
  }
  function encode(notes, bpm = 120) {
    if (!Number.isFinite(bpm) || bpm < 30 || bpm > 240) throw Error('Tempo must be 30–240 BPM.');
    const vlq = n => { const a=[n&127];while((n=Math.floor(n/128)))a.unshift((n&127)|128);return a; };
    const tempo=Math.round(60000000/bpm), rate=480*bpm/60, events=[];
    for(const n of notes){const start=Math.round(n.start*rate),finish=Math.max(start+1,Math.round((n.start+n.duration)*rate));const ch=(n.channel||1)-1;events.push({tick:start,data:[144|ch,n.midi,n.velocity||80],off:false},{tick:finish,data:[128|ch,n.midi,0],off:true});}
    events.sort((a,b)=>a.tick-b.tick || Number(b.off)-Number(a.off));
    const track=[0,255,81,3,(tempo>>16)&255,(tempo>>8)&255,tempo&255];let last=0;
    for(const e of events){track.push(...vlq(e.tick-last),...e.data);last=e.tick;}track.push(0,255,47,0);
    const size=track.length;
    const result=new Uint8Array(22+size);result.set([77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,(size>>>24)&255,(size>>>16)&255,(size>>>8)&255,size&255]);result.set(track,22);return result;
  }
  global.MusicMIDI = {parse,encode};
})(typeof window === 'undefined' ? globalThis : window);
