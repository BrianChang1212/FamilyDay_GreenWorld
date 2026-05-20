import { describe, expect, it } from "vitest";
import { extractQrStageId } from "@/lib/qrPayload";

/**
 * 1.2 JWT 範例：staging-qr-payloads.local.txt 第一行 → payload {"stageId":1,...}
 *     用此實 token 確保 base64url 解碼路徑與正式 QR 一致。
 */
const STAGING_JWT_STAGE_1 =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFnZUlkIjoxLCJpc3MiOiJmYW1pbHlkYXktMjAyNiIsImlhdCI6MTc3OTE4MjM1Mn0.loe2Fj739Vdfp_LnZFFeJVevUN0wzqKUB8Qm9GJN7Us";

describe("extractQrStageId", () => {
	it("decodes mock token", () => {
		expect(extractQrStageId("stage-1-token")).toBe(1);
		expect(extractQrStageId("  stage-6-token  ")).toBe(6);
	});

	it("rejects mock token out of stage range", () => {
		expect(extractQrStageId("stage-0-token")).toBeNull();
		expect(extractQrStageId("stage-7-token")).toBeNull();
	});

	it("decodes bare JWT", () => {
		expect(extractQrStageId(STAGING_JWT_STAGE_1)).toBe(1);
	});

	it("decodes URL with ?t=<JWT> (外部相機正式 QR)", () => {
		const url = `https://rare-lattice-495009-i9.web.app/scan?t=${STAGING_JWT_STAGE_1}`;
		expect(extractQrStageId(url)).toBe(1);
	});

	it("decodes URL with ?t=<mock-token>", () => {
		expect(
			extractQrStageId("https://example.com/scan?t=stage-3-token"),
		).toBe(3);
	});

	it("decodes URL with ?stage=<N>", () => {
		expect(
			extractQrStageId("https://example.com/scan?stage=4"),
		).toBe(4);
	});

	it("URL with out-of-range stage 回 null", () => {
		expect(
			extractQrStageId("https://example.com/scan?stage=99"),
		).toBeNull();
	});

	it("URL 缺 t 與 stage 回 null", () => {
		expect(extractQrStageId("https://example.com/scan")).toBeNull();
	});

	it("無法解析的字串回 null", () => {
		expect(extractQrStageId("")).toBeNull();
		expect(extractQrStageId("   ")).toBeNull();
		expect(extractQrStageId("not-a-token")).toBeNull();
		expect(extractQrStageId("aa.bb")).toBeNull();
	});

	it("非 http(s) URL 不視為 URL，回退到 bare token 解析", () => {
		// 設計上：只接受 http(s) 進 URL 解析路徑
		expect(extractQrStageId("ftp://example.com/?stage=1")).toBeNull();
	});
});
