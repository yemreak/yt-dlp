# @yemreak/yt-dlp

A Node.js library leveraging yt-dlp for downloading videos and subtitles, with added functionality for extracting text from subtitles. It supports a variety of video formats and manages video downloads efficiently.

> The project that I wanted to learn out of boredom and cost me 4 hours 😅

## Installation

To install `@yemreak/yt-dlp`, use npm:

```bash
npm install @yemreak/yt-dlp
```

Ensure that you have Node.js installed on your system to use this package.

## Features

- Download videos using yt-dlp
- Download subtitles in various languages
- Extract text from subtitle files

## Usage

### Initializing

First, import and configure `yt-dlp` in your project:

```javascript
import { YtDlp, YtDlpConfig } from '@yemreak/yt-dlp';

const config = { workdir: './downloads' };
const ytDlp = new YtDlp(config);
```

### Downloading a Video

To download a video:

```javascript
async function downloadVideo() {
    const url = 'https://www.youtube.com/watch?v=example';
    try {
        const { path, info } = await ytDlp.downloadVideo(url);
        console.log(`Downloaded video at ${path}`);
    } catch (error) {
        console.error(error);
    }
}

downloadVideo();
```

### Downloading Subtitles

To download subtitles:

```javascript
async function downloadSubtitles() {
    const url = 'https://www.youtube.com/watch?v=example';
    const lang = 'en';  // Specify language code
    try {
        const subtitlePath = await ytDlp.downloadSubtitle(url, lang);
        console.log(`Downloaded subtitles at ${subtitlePath}`);
    } catch (error) {
        console.error(error);
    }
}

downloadSubtitles();
```

### Extracting Text from Subtitles

To extract text from downloaded subtitles:

```javascript
async function extractSubtitleText() {
    const url = 'https://www.youtube.com/watch?v=example';
    const lang = 'en';  // Specify language code
    try {
        const text = await ytDlp.downloadSubtitleText(url, lang);
        console.log(`Extracted text: ${text}`);
    } catch (error) {
        console.error(error);
    }
}

extractSubtitleText();
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes or improvements. Make sure to follow the existing code style and add unit tests for any new or changed functionality.

## Issues

If you encounter any issues or have suggestions for improvements, please submit them as issues on the GitHub repository.
