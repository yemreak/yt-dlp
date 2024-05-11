import { chmodSync } from "fs"
import fetch from "node-fetch"
import { platform } from "os"

import type { SubtitleData, YtDlpOptions } from "./types.js"
import { downloadFile, execAsync } from "./utils.js"
/**
 * Downloads the latest release of yt-dlp from GitHub
 * - chmod +x the file if it's not on Windows
 */
export async function downloadLatestRelease(outdir: string = ".") {
	const url = `https://api.github.com/repos/yt-dlp/yt-dlp/releases`
	const response = await fetch(url)
	const data = (await response.json()) as {
		assets: { name: string; browser_download_url: string }[]
	}[]

	const os = platform()
	const fileName = os === "win32" ? "yt-dlp.exe" : "yt-dlp"
	const latestRelease = data[0].assets.find(({ name }) => name === fileName)

	const filepath = `${outdir}/${fileName}`
	if (!latestRelease) throw new Error("Failed to find the latest release")
	await downloadFile(latestRelease.browser_download_url, filepath)
	if (os !== "win32") chmodSync(filepath, "755")
	return filepath
}

export function execYtDlp(options: YtDlpOptions) {
	const args = [`"${options.url}"`]
	if (options.outputPath) args.push("--output", `"${options.outputPath}"`)
	if (options.cookies) args.push("--cookies", `"${options.cookies}"`)
	if (options.dumpJson) args.push("--dump-json")

	if (options.format) args.push("--format", options.format)
	else args.push("--format", "b")

	if (options.subtitle)
		args.push(
			options.subtitle.auto ? "--write-auto-sub" : "--write-sub",
			"--sub-lang",
			options.subtitle.lang,
			"--skip-download",
			"--convert-subs",
			"srt"
		)

	const command = `${options.binaryPath} ${args.join(" ")}`
	return execAsync(command)
}

/**
 * Parses the filenames from the output of yt-dlp
 */
export function parseFilenamesFromOutput(stdout: string): string[] {
	const paths: string[] = []

	const alreadyDownloadedRegex = /\[download\] (.+) has already been downloaded/g
	for (const match of stdout.matchAll(alreadyDownloadedRegex)) {
		paths.push(match[1])
	}

	const destinationRegex = /Destination: (.+)/g
	for (const match of stdout.matchAll(destinationRegex)) {
		paths.push(match[1])
	}
	if (paths.length === 0)
		throw new Error(`Failed to parse filename from output: ${stdout}`)
	return paths
}

/**
 * Extracts text from subtitle data.
 * @param subtitleData - The subtitle data containing events with text segments.
 * @returns The concatenated text from all subtitles.
 */
export function extractTextFromJson3Subtitle(subtitleData: SubtitleData): string {
	return subtitleData.events
		.flatMap(event => event.segs.map(segment => segment.utf8))
		.join(" ")
		.replace(/[\r\n]+/g, " ")
}

/**
 * Extracts text from VTT subtitle data.
 * @param subtitleData - The subtitle data in VTT format.
 * @returns The concatenated text from all subtitles.
 */
export function extractTextFromVttSubtitle(subtitleData: string): string {
	return subtitleData
		.split("\n")
		.filter(line => !line.startsWith("WEBVTT") && !line.startsWith("NOTE"))
		.join(" ")
		.replace(/[\r\n]+/g, " ")
}

/**
 * Cleans and extracts text from SRT subtitle data.
 * - Omits line numbers and timestamps.
 * - Consolidates multiple spaces into one.
 * - Converts dashes to spaces.
 * - Removes duplicate consecutive lines.
 * @param subtitleData Raw SRT subtitle content.
 * @returns A clean, continuous string of subtitle text.
 */
export function extractTextFromSrtSubtitle(subtitleData: string): string {
	const lines = subtitleData.split("\n")
	let previousLine = ""
	const processedText = lines.reduce((acc, line) => {
		line = line
			.trim()
			.replace(/^\d.*/g, "")
			.replace(/-/g, " ")
			.replace(/\s+/g, " ")
			.trim()

		if (line && line !== previousLine) {
			acc.push(line)
			previousLine = line
		}
		return acc
	}, [] as string[])

	return processedText.join(" ").trim()
}

export function isConflictError(error: any) {
	return error?.code === "conflict_error"
}
