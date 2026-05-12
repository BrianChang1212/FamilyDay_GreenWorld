#!/usr/bin/env python3
"""Crop welcome backgrounds to 9:16 with top-weighted framing (more headroom, less bottom)."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

# Portrait 9:16, tall enough for Retina full-bleed
OUT_W, OUT_H = 1440, 2560


def cover_crop_top_center(
	im: Image.Image,
	tw: int,
	th: int,
	*,
	zoom: float = 1.0,
	top_frac: float = 0.0,
) -> Image.Image:
	"""
	Scale to cover (tw, th), optionally extra *zoom* (>1 = tighter FOV, less bottom).
	Crop from horizontal center; vertical offset top_frac * (nh - th), 0 = align top.
	"""
	sw, sh = im.size
	scale = max(tw / sw, th / sh) * zoom
	nw = int(round(sw * scale))
	nh = int(round(sh * scale))
	resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
	left = max(0, (nw - tw) // 2)
	max_top = max(0, nh - th)
	top = int(round(max_top * min(1.0, max(0.0, top_frac))))
	right = left + tw
	bottom = top + th
	return resized.crop((left, top, right, bottom))


def main() -> int:
	front = Path(__file__).resolve().parent.parent
	public = front / "public" / "images"
	pairs = [
		(
			Path(
				front.parent
				/ "ref_no_push"
				/ "Export_Material"
				/ "Export_Material"
				/ "enroll"
				/ "01_welcomeBG.jpg",
			),
			public / "checkin-welcome-bg-9x16.jpg",
		),
		(
			Path(
				front.parent
				/ "ref_no_push"
				/ "Export_Material"
				/ "Export_Material"
				/ "game"
				/ "01_welcomeBG.jpg",
			),
			public / "game-welcome-bg-9x16.jpg",
		),
	]
	for src, dst in pairs:
		if not src.is_file():
			print(f"missing source: {src}", file=sys.stderr)
			return 1
		im = Image.open(src).convert("RGB")
		out = cover_crop_top_center(im, OUT_W, OUT_H)
		dst.parent.mkdir(parents=True, exist_ok=True)
		out.save(dst, format="JPEG", quality=92, optimize=True, progressive=True)
		print(f"Wrote {dst} from {src.name} {im.size} -> {out.size}")

	# Enroll-only variant: stronger top-weighted 9:16 (more headroom / less stream) for screenshot-style framing.
	enroll_src = pairs[0][0]
	if enroll_src.is_file():
		im = Image.open(enroll_src).convert("RGB")
		alt = public / "checkin-welcome-bg-9x16-screenshot2.jpg"
		# zoom>1 trims bottom/sides; top_frac=0 keeps canopy-anchored crop
		out = cover_crop_top_center(im, OUT_W, OUT_H, zoom=1.09, top_frac=0.0)
		out.save(alt, format="JPEG", quality=92, optimize=True, progressive=True)
		print(f"Wrote {alt} from {enroll_src.name} {im.size} -> {out.size} (screenshot2)")

	return 0


if __name__ == "__main__":
	raise SystemExit(main())
