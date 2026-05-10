/**
 * Parses `{ "code": "...", ... }` from fetch wrappers that throw messages like
 * `path ${status}: {...}` (JSON tail).
 */
export function parseApiErrorCode(message: string): string | null {
	const i = message.indexOf("{");
	if (i === -1) {
		return null;
	}
	try {
		const parsed = JSON.parse(message.slice(i)) as { code?: unknown };
		return typeof parsed.code === "string" ? parsed.code : null;
	} catch {
		return null;
	}
}
