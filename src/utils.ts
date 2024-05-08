import { exec } from "child_process"
import { writeFileSync } from "fs"
import fetch from "node-fetch"
import { promisify } from "util"

export const execAsync = promisify(exec)

export async function downloadFile(url: string, outputPath: string): Promise<void> {
	const response = await fetch(url)
	if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`)

	const buffer = await response.arrayBuffer()
	writeFileSync(outputPath, Buffer.from(buffer))
}
