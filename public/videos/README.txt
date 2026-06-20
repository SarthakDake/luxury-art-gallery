Reference videos from `src/data/artworks.json` using any of the supported source types below.

## Local file (MP4 / WebM / MOV)

Place files in this folder and reference them with a public path:

```json
{
  "type": "file",
  "url": "/videos/horizon-line-no-7-studio.mp4",
  "title": "Studio Walkthrough",
  "poster": "/artworks/brown_1.heic"
}
```

## YouTube

Paste any standard YouTube link. The player loads on play, starts muted, and supports the on-page mute toggle.

```json
{
  "type": "youtube",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "Artist Process"
}
```

Supported formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

## Instagram

Paste a public reel, post, or IGTV link. The embed loads on play.

```json
{
  "type": "instagram",
  "url": "https://www.instagram.com/reel/SHORTCODE/",
  "title": "Studio Reel",
  "poster": "/artworks/brown_3.heic"
}
```

Supported formats:
- `https://www.instagram.com/reel/SHORTCODE/`
- `https://www.instagram.com/p/SHORTCODE/`
- `https://www.instagram.com/tv/SHORTCODE/`

## Fields

- `type` — optional: `file`, `youtube`, or `instagram` (auto-detected from the URL if omitted)
- `url` — required video link or local path
- `title` — optional label shown under the video
- `poster` — optional still image before playback (recommended for local and Instagram clips)

Local and YouTube videos support the mute / unmute control. Instagram playback uses Instagram’s own in-embed controls after the circular play button is pressed.
