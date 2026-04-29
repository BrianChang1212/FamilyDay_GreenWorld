import { describe, expect, it, vi } from "vitest";
import { useI18n } from "@/composables/useI18n";
import { APP_CONFIG } from "@/constants";

describe("useI18n", () => {
	it("returns translated string with APP_CONFIG alias replacement", () => {
		const { t } = useI18n();
		expect(t("welcome.title")).toBe(`歡迎來到${APP_CONFIG.YEAR}`);
	});

	it("applies runtime params over defaults", () => {
		const { t } = useI18n();
		expect(t("welcome.title", { year: 2099 })).toBe("歡迎來到2099");
	});

	it("supports uppercase APP_CONFIG keys in template", () => {
		const { t } = useI18n();
		expect(t("checkinComplete.subtitle")).toBe(
			`感謝參加瑞軒科技${APP_CONFIG.YEAR}家庭日`,
		);
	});

	it("returns key and warns when key does not exist", () => {
		const { t } = useI18n();
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const badKey = "welcome.notExists";

		expect(t(badKey as never)).toBe(badKey);
		expect(warnSpy).toHaveBeenCalledWith(`I18n key not found: ${badKey}`);

		warnSpy.mockRestore();
	});
});
