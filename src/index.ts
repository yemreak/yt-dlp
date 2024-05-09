import fs from "fs"
import os from "os"

import {
	downloadLatestRelease,
	execYtDlp,
	extractTextFromSubtitles,
	parseFilenameFromOutput,
} from "./helpers.js"
import type { Language, SubtitleData, Subtitles, VideoInfo } from "./types.js"
import { downloadFile } from "./utils.js"

export type YtDlpConfig = { workdir: string; cookies?: string }

export class YtDlp {
	readonly filename = os.platform() === "win32" ? "yt-dlp.exe" : "yt-dlp"
	readonly binaryPath: string

	constructor(readonly config: YtDlpConfig) {
		this.binaryPath = `${config.workdir}/${this.filename}`

		fs.mkdirSync(config.workdir, { recursive: true })
	}

	/**
	 * Downloads the latest release of yt-dlp from GitHub
	 */
	async downloadLatestReleaseIfNotExists() {
		if (fs.existsSync(this.binaryPath)) return
		await downloadLatestRelease(this.config.workdir)
	}

	async retrieveVideoInfo(url: string): Promise<VideoInfo> {
		const { stdout } = await this.exec({ dumpJson: true, url })
		return JSON.parse(stdout) as VideoInfo
	}

	async exec(options: { url: string; outputPath?: string; dumpJson?: boolean }) {
		return await execYtDlp({
			binaryPath: this.binaryPath,
			cookies: this.config.cookies,
			...options,
		})
	}

	async downloadVideo(url: string) {
		const info = await this.retrieveVideoInfo(url)
		if (info.playlist_index) throw new Error("This is a playlist, not a video")

		const pattern = "%(channel)s.%(ext)s"
		const symPath = `${this.config.workdir}/${pattern}`

		const { stdout, stderr } = await this.exec({ url, outputPath: symPath })
		if (stderr && stderr.includes("ERROR")) throw new Error(stderr)

		const videoPath = parseFilenameFromOutput(stdout)
		return { videoPath, info }
	}

	/**
	 * Downloads the subtitle file of a video
	 * - If `source` is a string, it's a video URL
	 * - If `source` is a VideoInfo object, it's the {@link VideoInfo} that was retrieved before
	 */
	async downloadSubtitle(params: { source: string | VideoInfo; lang?: Language }) {
		const { source, lang } = params

		let info: VideoInfo
		if (typeof source === "string") {
			info = await this.retrieveVideoInfo(source)
		} else info = source
		if (!info.subtitles) throw new Error("No subtitles found")

		let key: keyof Subtitles
		if (lang) {
			key = Object.keys(info.subtitles).find(key =>
				key.includes(lang)
			) as keyof Subtitles
			if (!key) throw new Error(`No subtitles found for ${lang}`)
		} else key = info.language ?? (Object.keys(info.subtitles)[0] as keyof Subtitles)

		const subtitle = info.subtitles[key]?.find(sub => sub.ext === "json3")
		if (!subtitle) throw new Error(`No JSON3 subtitles found for ${lang}`)

		const subtitlePath = `${this.config.workdir}/${info.id}.${subtitle.ext}`
		if (fs.existsSync(subtitlePath)) return { subtitlePath, info }

		await downloadFile(subtitle.url, subtitlePath)
		return { subtitlePath, info }
	}

	/**
	 * Downloads and extracts the text from a subtitle file
	 * - If `source` is a string, it's a video URL
	 * - If `source` is a VideoInfo object, it's the {@link VideoInfo} that was retrieved before
	 */
	async downloadSubtitleText(params: {
		source: string | VideoInfo
		lang?: Language
	}) {
		const { subtitlePath, info } = await this.downloadSubtitle(params)
		const subtitleFile = fs.readFileSync(subtitlePath, "utf-8")
		const subtitleData: SubtitleData = JSON.parse(subtitleFile)
		const subtitleText = extractTextFromSubtitles(subtitleData)
		return { subtitleText, info }
	}
}
