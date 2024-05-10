import type { Language } from "./types.js"

export type InstagramURL = `${string}instagram.com/${string}`
export type YoutubeURL = `${string}youtube.com/${string}` &
	`https://youtu.be/${string}`
export type TwitterURL = `${string}x.com/${string}`
export type TedUrl = `${string}ted.com/talks/${string}`

export function isInstagramURL(url: string): url is InstagramURL {
	return url.toLowerCase().includes("instagram.com/")
}

export function isYoutubeURL(url: string): url is YoutubeURL {
	const lowerUrl = url.toLowerCase()
	return lowerUrl.includes("youtube.com/") || lowerUrl.includes("youtu.be/")
}

export function isTwitterURL(url: string): url is TwitterURL {
	return url.toLowerCase().includes("x.com/")
}

export function isTedURL(url: string): url is TedUrl {
	return url.toLowerCase().includes("ted.com/talks/")
}

export function parseLangFromTedUrl(url: TedUrl): Language | undefined {
	return url.match(/(?<=language=)(\w+)/)?.[0] as Language | undefined
}
