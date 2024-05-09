import fs from "fs"
import { YtDlp, YtDlpConfig } from "../index.js"

describe("YtDlp", () => {
	let config: YtDlpConfig
	let ytDlp: YtDlp

	beforeEach(() => {
		config = { workdir: "./test" }
		ytDlp = new YtDlp(config)
	})

	it("binaryPath", () => {
		process.platform === "win32"
			? expect(ytDlp.binaryPath).toBe(`${config.workdir}/yt-dlp.exe`)
			: expect(ytDlp.binaryPath).toBe(`${config.workdir}/yt-dlp`)
	})

	it("download release", async () => {
		await ytDlp.downloadLatestReleaseIfNotExists()
		expect(fs.existsSync(ytDlp.binaryPath)).toBe(true)
	})

	it("retrieve video info", async () => {
		const url = "https://youtu.be/6n3pFFPSlW4"
		const info = await ytDlp.retrieveMediaInfo(url)
		expect(info.id).toBe("6n3pFFPSlW4")
	})

	it(
		"download video",
		async () => {
			const url = "https://youtu.be/6n3pFFPSlW4"
			const { mediaPath, info } = await ytDlp.download({ source: url })
			expect(fs.existsSync(mediaPath)).toBe(true)
			expect(info.id).toBe("6n3pFFPSlW4")
			expect(mediaPath).toMatch(/test\/.*\.(mp4|webm)/)
		},
		100 * 1000
	)

	it(
		"download subtitle and text",
		async () => {
			const source = "https://youtube.com/watch?v=hNQk4325W9w&si=5QUlL3WWYaLdVRhK"
			const { subtitlePath } = await ytDlp.downloadSubtitle({ source })
			expect(subtitlePath).toMatch(/test\/.*\.json3/)
			expect(fs.existsSync(subtitlePath!)).toBe(true)

			const { subtitleText } = await ytDlp.downloadSubtitleText({ source })
			expect(subtitleText).toMatch(/.*\n/)
		},
		100 * 1000
	)

	it(
		"download tr subtitle and text",
		async () => {
			const url = "https://youtu.be/hNQk4325W9w"
			const lang = "tr"
			await expect(ytDlp.downloadSubtitle({ source: url, lang })).rejects.toThrow(
				"No subtitles found for tr"
			)
		},
		10 * 1000
	)
})
