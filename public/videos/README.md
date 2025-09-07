# Video Assets for Interactive Art Installation

This directory contains video files that will be displayed when the script encounters "[Show video]" messages.

## Current Placeholder Files
- `video1.mp4` - Route demonstration video placeholder
- `video2.mp4` - Landmarks progress video placeholder  
- `video3.mp4` - Wisdom sharing video placeholder
- `video4.mp4` - Journey map video placeholder
- `video5.mp4` - Lost guidance video placeholder

## How Video Selection Works

Each "[Show video]" message in your script can now specify exactly which video file to play by including a `videoFile` property:

```json
{
  "id": "12",
  "speaker": "bot", 
  "text": "[Show video]",
  "videoFile": "video1.mp4"
}
```

If no `videoFile` is specified, it defaults to `video1.mp4`.

## How to Add Real Videos

1. Replace the empty `.mp4` files with your actual video content
2. Recommended specifications:
   - Format: MP4 (H.264 codec)
   - Resolution: 480p to 1080p (will be scaled to fit container)
   - Duration: 3-15 seconds for optimal user experience
   - Aspect ratio: 16:9 preferred
   - File size: Under 10MB for web performance

## Video Display Behavior

- Videos automatically start playing when they appear
- They loop continuously
- Videos are muted by default (required for autoplay)
- Displayed in a centered floating container (400x225px on mobile, 480x270px on desktop)
- Each "[Show video]" message displays the specific video file defined in the script

## Adding More Videos

To add more videos:
1. Add new `.mp4` files to this directory
2. Reference them in your script with the `videoFile` property

Example:
```json
{
  "text": "[Show video]",
  "videoFile": "my-custom-video.mp4"
}
```
