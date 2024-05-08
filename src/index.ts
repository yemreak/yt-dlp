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

		const path = parseFilenameFromOutput(stdout)
		return { path, info }
	}

	async downloadSubtitle(url: string, lang?: Language) {
		const info = await this.retrieveVideoInfo(url)
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
		if (fs.existsSync(subtitlePath)) return subtitlePath

		await downloadFile(subtitle.url, subtitlePath)
		return subtitlePath
	}

	/**
	 * Downloads and extracts the text from a subtitle file
	 */
	async downloadSubtitleText(url: string, lang?: keyof Subtitles) {
		const subtitlePath = await this.downloadSubtitle(url, lang)
		const subtitleFile = fs.readFileSync(subtitlePath, "utf-8")
		const subtitleData: SubtitleData = JSON.parse(subtitleFile)
		return extractTextFromSubtitles(subtitleData)
	}
}
