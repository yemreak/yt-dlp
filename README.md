# @yemreak/yt-dlp

> Yes, the readme was created with ChatGPT 😅, but that's okay, no worries! 🙃

## Overview

This package provides tools to interact with the yt-dlp utility for downloading media from YouTube and other video platforms. It includes functionality for downloading videos, extracting audio, managing subtitles, and retrieving media information.

### Features

- **Download videos and audios**: Supports various formats and configurations.
- **Subtitle management**: Download and extract text from subtitles in different formats.
- **Media information retrieval**: Fetch detailed information about media content.

## Installation

```bash
npm install @yemreak/yt-dlp
```

## Usage

### Initialize

```typescript
import { YtDlp, YtDlpConfig } from "@yemreak/yt-dlp"

const config: YtDlpConfig = { workdir: "./downloads" }
const ytDlp = new YtDlp(config)
```

### Download Latest yt-dlp Release

Ensure the latest version of yt-dlp is downloaded:

```typescript
await ytDlp.downloadLatestReleaseIfNotExists()
```

### Download Video

Download a video with custom format settings:

```typescript
const videoUrls = await ytDlp.download({
	url: "https://youtube.com/watch?v=example",
	format: "ba", // best audio
})
```

### Extract Media Information

Retrieve detailed information from a video URL:

```typescript
const mediaInfo = await ytDlp.retrieveMediaInfoList(
	"https://youtube.com/watch?v=example"
)
```

### Download and Extract Subtitles

Download subtitles and extract text:

```typescript
const subtitleText = await ytDlp.downloadSubtitleText({
	info: mediaInfo[0],
	lang: "en",
})
```

## Practical Examples

### Batch Download

Download multiple videos by passing a list of URLs:

```typescript
for (const url of [
	"https://youtube.com/watch?v=example1",
	"https://youtube.com/watch?v=example2",
]) {
	await ytDlp.download({ url })
}
```

### Advanced Subtitle Handling

Download subtitles in different languages and formats, then extract and save the text:

```typescript
const langs: Language[] = ["en", "es", "de"]
for (const lang of langs) {
	const subtitlePath = await ytDlp.downloadSubtitle({ info: mediaInfo[0], lang })
	const extractedText = ytDlp.extractTextFromSubtitles(subtitlePath)
	console.log(`Extracted Text in ${lang}:`, extractedText)
}
```

### Error Handling

Implement robust error handling to manage potential download and extraction failures:

```typescript
try {
	const videoUrls = await ytDlp.download({
		url: "https://youtube.com/watch?v=example",
	})
} catch (error) {
	console.error("Failed to download video:", error)
}
```
