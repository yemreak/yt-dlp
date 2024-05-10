import fs from "fs"
import os from "os"

import {
	downloadLatestRelease,
	execYtDlp,
	extractTextFromJson3Subtitle,
	extractTextFromSrtSubtitle,
	extractTextFromVttSubtitle,
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
	 * - If `source` is a video URL, retrieves the {@link MediaInfo} from the video URL
	 */
	async downloadSubtitle(params: {
		source: MediaSource
		lang?: Language
	}): Promise<{ subtitlePath?: string; info: MediaInfo }> {
		const { source, lang = "en" } = params

		const info = await this.retrieveMediaInfoFromSource(source)
		const keys = Object.keys(info.subtitles)
		if (keys.length === 0) {
			const { stdout } = await this.exec({
				url: info.original_url,
				subtitle: { lang, auto: true },
				outputPath: `${this.config.workdir}/${info.id}`,
			})
			const subtitlePath = parseFilenameFromOutput(stdout).replace(".vtt", ".srt")
			return { subtitlePath, info }
		}

		const key = keys.find(key => key.includes(lang)) as keyof Subtitles
		if (!key) throw new Error(`No subtitles found for ${lang}`)

		const subtitle = info.subtitles[key]?.find(sub => sub.ext === "json3")
		if (subtitle) {
			const subtitlePath = `${this.config.workdir}/${info.id}.${subtitle.ext}`
			if (fs.existsSync(subtitlePath)) return { subtitlePath, info }

			await downloadFile(subtitle.url, subtitlePath)
			return { subtitlePath, info }
		}

		const { stdout } = await this.exec({
			url: info.original_url,
			subtitle: { lang },
			outputPath: `${this.config.workdir}/${info.id}`,
		})
		const subtitlePath = parseFilenameFromOutput(stdout).replace(".vtt", ".srt")
		return { subtitlePath, info }
	}

	/**
	 * Extracts the text from a `json3`, `vtt` or `srt` subtitle file
	 */
	extractTextFromSubtitles(subtitlePath: string): string {
		const subtitleFile = fs.readFileSync(subtitlePath, "utf-8")

		if (subtitlePath.endsWith(".json3")) {
			const subtitleData: SubtitleData = JSON.parse(subtitleFile)
			return extractTextFromJson3Subtitle(subtitleData)
		} else if (subtitlePath.endsWith(".vtt")) {
			return extractTextFromVttSubtitle(subtitleFile)
		} else if (subtitlePath.endsWith(".srt")) {
			return extractTextFromSrtSubtitle(subtitleFile)
		}

		throw new Error(`Unsupported subtitle format: ${subtitlePath}`)
	}

	/**
	 * Downloads and extracts the text from a subtitle file
	 * - If `source` is a video URL, retrieves the {@link MediaInfo} from the video URL
	 */
	async downloadSubtitleText(params: {
		source: MediaSource
		lang?: Language
	}): Promise<{ subtitleText?: string; info: MediaInfo }> {
		const { subtitlePath, info } = await this.downloadSubtitle(params)
		if (!subtitlePath) return { info }

		const subtitleText = this.extractTextFromSubtitles(subtitlePath)
		return { subtitleText, info }
	}
}
