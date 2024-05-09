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

	const command = `${options.binaryPath} ${args.join(" ")}`
	return execAsync(command)
}

/**
 * Parses the filename from the output of yt-dlp
 * - The filename is the line that contains "Destination:"
 */
export function parseFilenameFromOutput(output: string) {
	if (output.includes("has already been downloaded")) {
		const path = output
			.split("\n")
			.find(line => line.includes("has already been downloaded"))
			?.split(" ")[1]
		if (!path)
			throw new Error(
				`Failed to parse already downloaded filename from output: ${output}`
			)
		return path
	}

	const path = output
		.split("\n")
		.find(line => line.includes("Destination:"))
		?.split(":")[1]
		.trim()
	if (!path) throw new Error(`Failed to parse filename from output: ${output}`)
	return path
}

/**
 * Extracts text from subtitle data.
 * @param subtitleData - The subtitle data containing events with text segments.
 * @returns The concatenated text from all subtitles.
 */
export function extractTextFromSubtitles(subtitleData: SubtitleData): string {
	return subtitleData.events
		.flatMap(event => event.segs.map(segment => segment.utf8))
		.join(" ")
}
