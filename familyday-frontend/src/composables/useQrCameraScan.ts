import { nextTick, onBeforeUnmount, ref, watch, type Ref } from "vue";
import jsQR from "jsqr";

/** 將影片縮繪並用 jsQR 偵測；回傳條碼字串（trim 過）。 */
const MAX_DECODE_WIDTH = 640;

function decodeFrame(video: HTMLVideoElement, scratch: HTMLCanvasElement): string | null {
	if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

	const vw = video.videoWidth;
	const vh = video.videoHeight;
	if (!vw || !vh) return null;

	let cw = vw;
	let ch = vh;
	if (cw > MAX_DECODE_WIDTH) {
		ch = Math.round((vh * MAX_DECODE_WIDTH) / vw);
		cw = MAX_DECODE_WIDTH;
	}

	scratch.width = cw;
	scratch.height = ch;

	const ctx = scratch.getContext("2d", { willReadFrequently: true });
	if (!ctx) return null;

	ctx.drawImage(video, 0, 0, cw, ch);

	let imageData: ImageData;
	try {
		imageData = ctx.getImageData(0, 0, cw, ch);
	} catch {
		return null;
	}

	const hit = jsQR(imageData.data, imageData.width, imageData.height, {
		inversionAttempts: "attemptBoth",
	});

	const raw = hit?.data?.trim();
	return raw && raw.length > 0 ? raw : null;
}

export function useQrCameraScan(options: {
	videoRef: Ref<HTMLVideoElement | null>;
	active: Ref<boolean>;
	paused: Ref<boolean>;
	onDecode: (payload: string) => void | Promise<void>;
	onStreamError?: (message: string) => void;
}): Ref<string> {
	const setupError = ref("");
	const decodeCanvas =
		typeof document !== "undefined"
			? document.createElement("canvas")
			: null;

	let stream: MediaStream | null = null;
	let rafId = 0;
	let lastEmitted = "";
	let emittedAtMs = -90000;

	function stopLoop(): void {
		if (!rafId) return;
		cancelAnimationFrame(rafId);
		rafId = 0;
	}

	function resetDecodeGuard(): void {
		lastEmitted = "";
		emittedAtMs = -90000;
	}

	function releaseTracks(): void {
		stopLoop();
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
		const el = options.videoRef.value;
		if (el) el.srcObject = null;
		setupError.value = "";
		resetDecodeGuard();
	}

	function tick(nowMs: DOMHighResTimeStamp): void {
		if (!options.active.value || !decodeCanvas) return;

		rafId = requestAnimationFrame(tick);

		if (options.paused.value) return;

		const v = options.videoRef.value;
		if (!v?.srcObject) return;

		const payload = decodeFrame(v, decodeCanvas);
		if (!payload) return;

		if (payload === lastEmitted && nowMs - emittedAtMs < 560) return;
		lastEmitted = payload;
		emittedAtMs = nowMs;

		void Promise.resolve(options.onDecode(payload)).catch(() => {
			resetDecodeGuard();
		});
	}

	async function start(): Promise<void> {
		setupError.value = "";

		if (!navigator.mediaDevices?.getUserMedia) {
			setupError.value =
				"此環境無法開啟相機，請在行動版 Chrome/Safari 與 HTTPS（或 localhost）下使用。";
			options.onStreamError?.(setupError.value);
			return;
		}

		releaseTracks();

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: "environment" },
					width: { ideal: 1280 },
					height: { ideal: 720 },
				},
				audio: false,
			});
		} catch (e: unknown) {
			const denied =
				e instanceof DOMException &&
				(e.name === "NotAllowedError" ||
					e.name === "PermissionDeniedError");
			setupError.value = denied
				? "已拒絕相機權限，請在瀏覽器設定允許取用相機後重試。"
				: "無法開啟相機，請檢查裝置是否在通話或被其他程式佔用。";
			options.onStreamError?.(setupError.value);
			return;
		}

		const el = options.videoRef.value;
		if (!el || !stream) return;

		el.setAttribute("playsinline", "");
		el.playsInline = true;
		el.muted = true;
		el.autoplay = true;
		el.srcObject = stream;

		await el.play().catch(() => {
			setupError.value = "相機畫面無法預覽，請重整頁面或重新開啟掃描。";
			options.onStreamError?.(setupError.value);
			releaseTracks();
			return;
		});

		if (!options.active.value) {
			releaseTracks();
			return;
		}

		stopLoop();
		rafId = requestAnimationFrame(tick);
	}

	watch(
		() => options.active.value,
		async (live) => {
			releaseTracks();
			if (!live) return;
			await nextTick();
			await start();
		},
	);

	onBeforeUnmount(() => releaseTracks());

	return setupError;
}
