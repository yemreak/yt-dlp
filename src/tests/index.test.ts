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
		const info = await ytDlp.retrieveVideoInfo(url)
		expect(info.id).toBe("6n3pFFPSlW4")
	})

	it(
		"download video",
		async () => {
			const url = "https://youtu.be/6n3pFFPSlW4"
			const { path, info } = await ytDlp.downloadVideo(url)
			expect(fs.existsSync(path)).toBe(true)
			expect(info.id).toBe("6n3pFFPSlW4")
			expect(path).toMatch(/test\/.*\.(mp4|webm)/)
		},
		100 * 1000
	)

	it(
		"download subtitle and text",
		async () => {
			const url = "https://youtu.be/hNQk4325W9w"
			const subtitlePath = await ytDlp.downloadSubtitle(url)
			expect(fs.existsSync(subtitlePath)).toBe(true)
			expect(subtitlePath).toMatch(/test\/.*\.json3/)

			const subtitle = await ytDlp.downloadSubtitleText(url)
			expect(subtitle).toMatch(/.*\n/)
		},
		10 * 1000
	)

	it(
		"download tr subtitle and text",
		async () => {
			const url = "https://youtu.be/hNQk4325W9w"
			const lang = "tr"
			const subtitlePath = await ytDlp.downloadSubtitle(url, lang)
			expect(fs.existsSync(subtitlePath)).toBe(true)
			expect(subtitlePath).toMatch(/test\/.*\.json3/)

			const subtitle = await ytDlp.downloadSubtitleText(url, lang)
			expect(subtitle).toMatch(/.*\n/)
		},
		10 * 1000
	)
})
