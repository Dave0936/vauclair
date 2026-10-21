# Vauclair Perihelion: image and video plan

## Already made (10 images, 2.5 credits, saved in img/)
| File | Where it's used |
|---|---|
| hero.jpg / heroV.jpg | Full-screen interlude (desktop / phone), and the backup image if 3D can't load |
| hands.jpg, tourbillon.jpg, dial.jpg, metals.jpg, caseback.jpg, wrist.jpg | Atelier gallery that scrolls sideways |
| atelier.jpg | Background for the film section |
| moon.jpg | Background for the allocation section |

## Videos to make later (Seedance 2.5, about 35 credits per 5 s)
1. **Tourbillon loop** (9:16, 6 s, muted). Replaces the striped card 03 in the Atelier gallery.
   Prompt: "Extreme macro of a flying tourbillon cage rotating slowly, gold balance wheel oscillating, blued hairspring, ruby jewels, black background, single warm spotlight, shallow depth of field, seamless loop."
2. **Film: "Nine Winters"** (16:9, 2–3 min, edited from several clips). Goes in the Play dialog.
   Clips: the workshop at dawn with snow outside; hands polishing a bridge; enamel glowing in a kiln; the watch being cased; the moon over a frozen lake.
3. **Hero light-sweep** (16:9 + 9:16, 5 s loop). Optional replacement for the interlude still: a slow band of light moving across the platinum case in darkness.
4. **Moonrise** (16:9, 8 s loop). Optional background for the allocation section: the full moon rising over the misty Jura valley, with a slow push-in.

About 140 credits for 1, 3 and 4, plus the film edit.

## How to swap
- For a video card, replace the striped `<div>` with `<video src="video/tourbillon.mp4" autoplay muted loop playsinline style="height:…;aspect-ratio:9/16;object-fit:cover">`.
- For the film, put a `<video controls>` inside the box in `#film-modal`.
