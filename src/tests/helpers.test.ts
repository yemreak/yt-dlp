import { extractTextFromSrtSubtitle } from "../helpers.js"

describe("extractTextFromSrtSubtitle", () => {
	it("should extract text from SRT subtitle data", () => {
		const subtitleData = `1
                          00:00:00,000 --> 00:00:02,000
                          Example subtitle text.`

		const expected = "Example subtitle text."
		const result = extractTextFromSrtSubtitle(subtitleData)

		expect(result).toEqual(expected)
	})

	// it("from srt file", () => {
	// 	const subtitleData = fs.readFileSync("temp.srt", "utf-8")

	// 	const result = extractTextFromSrtSubtitle(subtitleData)
	// 	expect(result).toBeTruthy()
	// })
})
