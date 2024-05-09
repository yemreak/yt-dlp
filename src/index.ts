import fs from "fs"
import os from "os"

import {
	downloadLatestRelease,
	execYtDlp,
	extractTextFromSubtitles,
	parseFilenameFromOutput,
} from "./helpers.js"
import type {
	Language,
	MediaInfo,
	MediaSource,
	SubtitleData,
	Subtitles,
	YtDlpOptionals,
} from "./types.js"
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

	async retrieveMediaInfo(url: string): Promise<MediaInfo> {
		const { stdout } = await this.exec({ dumpJson: true, url })
		return JSON.parse(stdout) as MediaInfo
	}

	async exec(optionals: YtDlpOptionals & { url: string }) {
		return await execYtDlp({
			binaryPath: this.binaryPath,
			cookies: this.config.cookies,
			...optionals,
		})
	}

	async downloadAudio(params: { source: MediaSource }) {
		return await this.download({ ...params, format: "ba" })
	}

	async download(params: { source: MediaSource } & YtDlpOptionals) {
		const { source, ...optionals } = params

		const info = await this.retrieveMediaInfoFromSource(source)
		if (info.playlist_index) throw new Error("This is a playlist, not a video")

		const pattern = "%(title)s.%(ext)s"
		const symPath = `${this.config.workdir}/${pattern}`

		const { stdout, stderr } = await this.exec({
			url: info.original_url,
			outputPath: symPath,
			...optionals,
		})
		if (stderr && stderr.includes("ERROR")) throw new Error(stderr)

		const mediaPath = parseFilenameFromOutput(stdout)
		return { mediaPath, info }
	}

	async retrieveMediaInfoFromSource(source: MediaSource): Promise<MediaInfo> {
		if (typeof source === "string") return await this.retrieveMediaInfo(source)
		return source as any
	}

	/**
	 * Downloads the subtitle file of a video
	 * - If `source` is a string, it's a video URL
	 * - If `source` is a VideoInfo object, it's the {@link MediaInfo} that was retrieved before
	 */
	async downloadSubtitle(params: { source: MediaSource; lang?: Language }) {
		const { source, lang } = params

		const info = await this.retrieveMediaInfoFromSource(source)
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
	 * Extracts the text from a `json3` subtitle file
	 */
	extractTextFromSubtitles(subtitlePath: string) {
		const subtitleFile = fs.readFileSync(subtitlePath, "utf-8")
		const subtitleData: SubtitleData = JSON.parse(subtitleFile)
		return extractTextFromSubtitles(subtitleData)
	}

	/**
	 * Downloads and extracts the text from a subtitle file
	 * - If `source` is a string, it's a video URL
	 * - If `source` is a VideoInfo object, it's the {@link MediaInfo} that was retrieved before
	 */
	async downloadSubtitleText(params: { source: MediaSource; lang?: Language }) {
		const { subtitlePath, info } = await this.downloadSubtitle(params)
		const subtitleText = this.extractTextFromSubtitles(subtitlePath)
		return { subtitleText, info }
	}
}
