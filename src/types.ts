export type YtDlpOptionals = {
	outputPath?: string
	cookies?: string
	dumpJson?: boolean
	format?: MediaFormat
	subtitle?: { lang: Language; auto?: boolean }
}
export type YtDlpOptions = { binaryPath: string; url: string } & YtDlpOptionals

export type MediaSource = string | MediaInfo
export type MediaFormat = "b" | "ba"

export type MediaInfo = {
	id: string
	title: string
	formats: Format[]
	thumbnails: Thumbnail[]
	thumbnail: string
	description: string
	channel_id: string
	channel_url: string
	duration: number
	view_count: number
	average_rating: null
	age_limit: number
	webpage_url: string
	categories: string[]
	tags: any[]
	playable_in_embed: boolean
	live_status: string
	release_timestamp: null
	_format_sort_fields: string[]
	automatic_captions: { [key: string]: Subtitle[] }
	subtitles: Subtitles
	comment_count: number
	chapters: Chapter[]
	heatmap: Heatmap[]
	like_count: number
	channel: string
	channel_follower_count: number
	channel_is_verified: boolean
	uploader: string
	uploader_id: string
	uploader_url: string
	upload_date: string
	availability: string
	original_url: string
	webpage_url_basename: string
	webpage_url_domain: string
	extractor: string
	extractor_key: string
	playlist: null
	playlist_index: null
	display_id: string
	fulltitle: string
	duration_string: string
	release_year: null
	is_live: boolean
	was_live: boolean
	requested_subtitles: null
	_has_drm: null
	epoch: number
	requested_formats: Format[]
	format: string
	format_id: string
	ext: AudioEXTEnum
	protocol: string
	language: Language | null
	format_note: string
	filesize_approx: number
	tbr: number
	width: number
	height: number
	resolution: string
	fps: number
	dynamic_range: DynamicRange
	vcodec: string
	vbr: number
	stretched_ratio: null
	aspect_ratio: number
	acodec: Acodec
	abr: number
	asr: number
	audio_channels: number
	_filename: string
	filename: string
	_type: string
	_version: Version
}

export type Version = {
	version: string
	current_git_head: null
	release_git_head: string
	repository: string
}

export enum Acodec {
	Mp4A402 = "mp4a.40.2",
	Mp4A405 = "mp4a.40.5",
	None = "none",
	Opus = "opus",
}

export type Subtitle = {
	ext: SubtitleExt
	url: string
	name?: string
	protocol?: Protocol
}

export enum SubtitleExt {
	Json3 = "json3",
	Srv1 = "srv1",
	Srv2 = "srv2",
	Srv3 = "srv3",
	Ttml = "ttml",
	Vtt = "vtt",
}

export enum Protocol {
	HTTPS = "https",
	M3U8Native = "m3u8_native",
	Mhtml = "mhtml",
}

export type Chapter = {
	start_time: number
	title: string
	end_time: number
}

export enum DynamicRange {
	SDR = "SDR",
}

export enum AudioEXTEnum {
	M4A = "m4a",
	Mhtml = "mhtml",
	Mp4 = "mp4",
	None = "none",
	Webm = "webm",
}

export type Format = {
	format_id: string
	format_note?: string
	ext: AudioEXTEnum
	protocol: Protocol
	acodec?: Acodec
	vcodec: string
	url: string
	width?: number | null
	height?: number | null
	fps?: number | null
	rows?: number
	columns?: number
	fragments?: Fragment[]
	resolution: string
	aspect_ratio: number | null
	filesize_approx?: number | null
	http_headers: HTTPHeaders
	audio_ext: AudioEXTEnum
	video_ext: AudioEXTEnum
	vbr: number | null
	abr: number | null
	tbr: number | null
	format: string
	format_index?: null
	manifest_url?: string
	language?: Language | null
	preference?: null
	quality?: number
	has_drm?: boolean
	source_preference?: number
	asr?: number | null
	filesize?: number | null
	audio_channels?: number | null
	language_preference?: number
	dynamic_range?: DynamicRange | null
	container?: Container
	downloader_options?: DownloaderOptions
}

export enum Container {
	M4ADash = "m4a_dash",
	Mp4Dash = "mp4_dash",
	WebmDash = "webm_dash",
}

export type DownloaderOptions = {
	http_chunk_size: number
}

export type Fragment = {
	url: string
	duration: number
}

export type HTTPHeaders = {
	"User-Agent": string
	Accept: Accept
	"Accept-Language": AcceptLanguage
	"Sec-Fetch-Mode": SECFetchMode
}

export enum Accept {
	TextHTMLApplicationXHTMLXMLApplicationXMLQ09Q08 = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

export enum AcceptLanguage {
	EnUsEnQ05 = "en-us,en;q=0.5",
}

export enum SECFetchMode {
	Navigate = "navigate",
}

export type Heatmap = {
	start_time: number
	end_time: number
	value: number
}

export type Subtitles = {
	bg: Subtitle[]
	zh: Subtitle[]
	en: Subtitle[]
	fr: Subtitle[]
	id: Subtitle[]
	it: Subtitle[]
	ja: Subtitle[]
	ko: Subtitle[]
	ro: Subtitle[]
	th: Subtitle[]
	tr: Subtitle[]
	vi: Subtitle[]
}
export type Language = keyof Subtitles

export type Thumbnail = {
	url: string
	preference: number
	id: string
	height?: number
	width?: number
	resolution?: string
}

export type SubtitleSegment = { utf8: string }
export type SubtitleEvent = { segs: SubtitleSegment[] }
export type SubtitleData = { events: SubtitleEvent[] }
