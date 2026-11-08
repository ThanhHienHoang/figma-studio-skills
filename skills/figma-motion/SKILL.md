---
name: figma-motion
description: Make short motion films (animated explainers, product promos, logo stings, social clips) directly in Figma with Figma Motion through the figma-console MCP - scene frames animated with presets or keyframes, exported to MP4, GIF or WebM, with voice or music added afterwards with ffmpeg. Use when the user asks for an animation, motion graphic, animated video or GIF made in Figma, or names figma-motion. Not for prototype interactions between screens (figma-canvas), and not for live-action editing.
---

# Figma motion

The deliverable is animated frames in Figma and, when asked, a video file exported from them.
Before the first Figma call read `../_shared/figma-workflow.md` and install
`../_shared/figma-snippets.js`. Extra tools for the same ToolSearch call:
`figma_apply_animation`, `figma_manage_animation_styles`, `figma_get_animations`,
`figma_remove_animation`, `figma_export_animation`, `figma_setup_design_tokens`.

Facts checked in a real file:
- Every top-level frame owns one timeline, 2 s long by default. Set the scene length in
  `figma_execute`: `frame.setTimelineDuration(frame.id, 5)` (the first argument is the frame id
  string; the `timelines` property is read-only). Keyframes past the end are cut.
- Animation is per node: presets (Position, Scale, Rotation, Size, Opacity, Path, TextStagger) or
  keyframe tracks. Several presets stack on one node (Opacity + Position for a fade-and-rise), and
  keyframe tracks add up per property. TextStagger with `textDelayGrouping: 'WORD'` and
  `opacityEnabled: true` reveals a title word by word, Vietnamese included.
- Main components cannot be animated: use instances or frames. Motion does not show in
  screenshots. `figma_export_animation` takes the top-level frame and writes MP4, GIF or WebM.
- Figma has no audio track: sound is added after export.

## 1. Three questions, then the film

Unless the request already settles them or the user says "just make it": ask in ONE
AskUserQuestion Style (for example clean kinetic type, playful shapes, product UI walkthrough,
editorial), Colors (the file's system, the brand's, or a suggested palette) and Length (6 s,
15 s, 30 s). A narrated film: also Voice, and hand the script work to `figma-motion-director`.
Never ask about the story; decide it and say it in one line.

## 2. Plan

- Scenes: id, name, duration, one line of what happens. 2 to 6 s each; text on screen stays at
  least as long as reading it takes (about 0.3 s per word plus 1 s).
- Format: 1920 x 1080 landscape, 1080 x 1920 vertical, 1080 x 1080 square. Another aspect ratio is
  a second Section built for it, never a resized copy.
- Before the first animation: `figma_manage_animation_styles` action `list_presets` once for the
  props of each preset. After animating a scene, `figma_get_animations` on it to read back what
  was applied.
- Motion tokens: TIMING (`duration/fast` 0.2, `duration/base` 0.5, `duration/slow` 0.9) and
  EASING (`ease/enter` EASE_OUT, `ease/exit` EASE_IN, `ease/move` EASE_IN_AND_OUT) via
  `figma_setup_design_tokens`; bind them (`durationVariableId`, `easing.variableId`).

## 3. Build

- Section `Film - <title>`. One top-level frame per scene (`S01 Hook`, `S02 Problem`...), each its
  own timeline, laid out in a row. A very short film (under about 8 s) may be one frame.
- Draw each scene's resting state first (layout, type, color with the shared rules), lint it,
  screenshot at 0.5. Then set its timeline length and animate.
- Animation craft:
  - Every element: enter, hold, exit. One motion idea per element; nothing moves without a reason.
  - Stagger related elements by 0.05 to 0.12 s (`timelineOffset`), text by word or line with
    TextStagger rather than letter salad.
  - Enter with ease-out, exit with ease-in, moves with ease-in-out; spring (BOUNCY) only for
    playful briefs.
  - Distances small (24 to 120 px); scale from 0.9 to 1, not from 0. Keep the eye in one place:
    the next element appears where the viewer is looking.
  - Leave 0.3 to 0.5 s of hold at the end of each scene for the cut.
- Images and UI: the user's files only. Recreating their product UI: from their screenshots or
  Figma components, then animate instances.

## 4. Check the motion (screenshots alone cannot)

Export a draft per scene: `figma_export_animation` with `format: 'MP4'`, `fps: 24`, `scale: 0.5`,
`outputPath` inside a work folder (for example `<working dir>/<film-slug>/draft/`). Pull frames
as one contact sheet, `ffmpeg -i S01.mp4 -vf "fps=4,scale=270:-1,tile=4x2" S01-sheet.png`, and
look at it with the Read tool (one image instead of many): check readability, overlaps
mid-animation, pacing. A single moment: `ffmpeg -ss 4.7 -i S01.mp4 -frames:v 1 S01-end.png`.
At most three rounds.

## 5. Final export and sound

- Final per scene: MP4, fps 30, quality HIGH, scale 1, into `<film-slug>/exports/`.
- Join scenes: a list file and `ffmpeg -f concat -safe 0 -i list.txt -c copy film.mp4` (re-encode
  with `-c:v libx264 -pix_fmt yuv420p` if the clips differ).
- Sound: music or voice files the user gives, or narration made with a TTS they have set up. Mix
  with `ffmpeg -i film.mp4 -i audio.wav -c:v copy -c:a aac -shortest film-final.mp4`. Never
  download music the user did not provide.
- GIF: export straight from Figma (`format: 'GIF'`, fps 15, `loopCount: 0`) for short loops.

## 6. Hand back

One short line: "Here is your animation", the Section in Figma, the file path of the export, and
in one more sentence anything you could not do as asked or invented (a logo, a screenshot) and
what of theirs would replace it. No scene-by-scene summary unless asked.

## Revising

Read the scene's animations (`figma_get_animations`) before changing them; replace a track rather
than stacking a second one; re-export only the scenes that changed and re-join.
