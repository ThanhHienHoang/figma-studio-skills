---
name: figma-motion-director
description: Direct a narrated motion film from the point it must make to the finished cut - find the one idea, write the narration for the ear, get it voiced, time every scene to the words, then have figma-motion build it in Figma and review the frames as a viewer would. Use when the user wants an explainer, a narrated video, a voice-over animation or a "video that explains X" made in Figma, or names figma-motion-director. Needs the figma-motion skill beside it. Not for silent loops, logo stings or UI micro-interactions (figma-motion alone).
---

# Figma motion director

You direct; `figma-motion` (the skill folder next to this one) builds. Read its SKILL.md before the
first scene. Its rules hold except where this page overrides them (narration timing decides scene
lengths here).

## 1. Brief: the point before the pictures

- Who watches, where (social feed muted, a talk, a landing page), and what they should think or do
  after. Then ONE sentence: the point of the film. If you cannot write it, ask one question.
- Length follows the point: 30 to 60 s for most explainers; ask before going past 90 s.
- Ask Voice once (the voice and language; a TTS the user already has set up, or their own
  recording) together with figma-motion's Style / Colors questions, in one AskUserQuestion.

## 2. Script for the ear

- Short spoken sentences, one idea per scene, the point stated in the first 5 seconds and again at
  the end. Concrete over abstract: an example, a number, a before / after.
- Numbers as people say them. No lists read aloud; no "In today's fast-paced world".
- Only facts from the user or their sources; anything else is a bracketed placeholder and the
  scene says it is a sample.
- Show the script (scene id, the lines, what the picture shows) in the reply as a table and get a
  yes before voicing it, unless the user said to go straight through.

## 3. Voice, then timing

1. Generate one audio file per scene (or record), in `<film-slug>/voice/S01.wav` ...
2. Measure each: `ffprobe -v error -show_entries format=duration -of csv=p=0 S01.wav`.
3. Scene duration = voice length + 0.4 to 0.8 s of air. Write the durations into the plan; the
   picture fits the words, never the other way round.
4. Key moments: note where in each line the key word falls (listen, or split the line into
   phrases and voice them separately) so the picture can hit it.

## 4. Picture

- Each scene shows what its line says, at the moment it says it: the key word lands with its
  visual. Decoration that says nothing is cut.
- On-screen text supports, never repeats the whole line: a key number, a term, a label.
  Burned-in captions only when the film will play muted; then they are the line, in short chunks.
- One visual system for the film: the same type, colors, motion tokens and transition grammar
  throughout; the last scene echoes the first.
- Build with figma-motion (Section, one frame per scene, its animation craft and checks).

## 5. Review as a viewer

1. Export drafts (figma-motion step 4), join them, lay the voice under the draft cut with ffmpeg.
2. Pull frames at each scene's key word time (`ffmpeg -ss <t> -i draft.mp4 -frames:v 1 k-S01.png`)
   and at mid-transition; read them with the Read tool.
3. Ask of each: does the picture say the same thing as the voice at that moment, can a first-time
   viewer read it in time, does anything distract from the point. Fix and repeat, at most three
   rounds.

## 6. Hand over

The final file path (`<film-slug>/exports/film-final.mp4`), the Figma Section, the script as it was
voiced, and in one sentence what is placeholder or what you could not do as asked.
