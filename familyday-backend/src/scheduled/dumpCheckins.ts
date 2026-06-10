/**
 * Daily scheduled dump of the `checkins` collection (Firestore `(default)` DB)
 * emailed as a UTF-8-BOM CSV attachment.
 *
 * Runs fully server-side via Firebase Functions v2 scheduler — deploying this
 * auto-provisions a Cloud Scheduler job + Pub/Sub topic; no local machine /
 * Task Scheduler is involved.
 *
 * Email transport: Gmail SMTP using an App Password stored in Secret Manager
 * (secret name `GMAIL_APP_PASSWORD`). The password never lives in code or git.
 * Set it once with:  firebase functions:secrets:set GMAIL_APP_PASSWORD
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import nodemailer from "nodemailer";
import { FieldPath } from "firebase-admin/firestore";
import { getDb } from "../utils/store";
import { getFunctionsRegion, getEventId } from "../config/fdgwProject";
import { type CheckinDoc } from "./checkinCsv";
import { buildDailyDumpReport, type ProgressDocInput } from "./dumpReport";

/** 批次刪除集合所有文件，回傳刪除總筆數 */
async function deleteAllDocs(
	db: FirebaseFirestore.Firestore,
	collectionId: string,
): Promise<number> {
	const ref = db.collection(collectionId);
	const batchSize = 400;
	let total = 0;
	for (;;) {
		const snap = await ref.orderBy(FieldPath.documentId()).limit(batchSize).get();
		if (snap.empty) break;
		const batch = db.batch();
		for (const doc of snap.docs) batch.delete(doc.ref);
		await batch.commit();
		total += snap.size;
	}
	return total;
}

/** CSV 字串 → 附件（前置 UTF-8 BOM，讓 Excel 直接開中文不亂碼） */
function csvAttachment(filename: string, csv: string) {
	return {
		filename,
		content: Buffer.concat([Buffer.from("﻿", "utf8"), Buffer.from(csv, "utf8")]),
	};
}

/** 讀 roster（現行 eventId）建「員編 → 姓名」對照表 */
async function buildRosterNameMap(): Promise<Map<string, string>> {
	const db = getDb();
	const snap = await db
		.collection("roster")
		.where("eventId", "==", getEventId())
		.get();
	const map = new Map<string, string>();
	for (const doc of snap.docs) {
		const d = doc.data() as { employeeId?: unknown; name?: unknown };
		if (typeof d.employeeId === "string" && d.employeeId) {
			map.set(d.employeeId, typeof d.name === "string" ? d.name : "");
		}
	}
	return map;
}

const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

/** 寄件者（Gmail 帳號，App 密碼對應此帳號）與收件者 */
const SENDER = "familyday.amtran@gmail.com";
const RECIPIENT = "familyday.amtran@amtran.com.tw";

/** 以台北時區產生 YYYY-MM-DD（用於檔名／主旨；不依賴執行環境時區） */
function taipeiDateStr(): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Taipei",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
	return parts; // en-CA → YYYY-MM-DD
}

export const dumpCheckinsDaily = onSchedule(
	{
		schedule: "every day 08:00",
		timeZone: "Asia/Taipei",
		region: getFunctionsRegion(),
		secrets: [GMAIL_APP_PASSWORD],
		retryCount: 2,
	},
	async () => {
		const db = getDb(); // FDGW_FIRESTORE_DATABASE_ID 未設 → (default)
		const dateStr = taipeiDateStr();

		const [checkinSnap, progressSnap, rosterNameMap] = await Promise.all([
			db.collection("checkins").get(),
			db.collection("player_progress").get(),
			buildRosterNameMap(),
		]);

		const report = buildDailyDumpReport({
			dateStr,
			checkins: checkinSnap.docs.map((d) => d.data() as CheckinDoc),
			progressDocs: progressSnap.docs.map(
				(d): ProgressDocInput => ({ employeeId: d.id, ...d.data() }),
			),
			rosterNameMap,
		});

		const transport = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: { user: SENDER, pass: GMAIL_APP_PASSWORD.value() },
		});

		await transport.sendMail({
			from: `FamilyDay GreenWorld <${SENDER}>`,
			to: RECIPIENT,
			subject: report.subject,
			text: report.text,
			attachments: report.attachments.map((a) =>
				csvAttachment(a.filename, a.csv),
			),
		});

		logger.info("dumpCheckinsDaily sent", {
			date: dateStr,
			checkinCount: report.checkinCount,
			progressCount: report.progressCount,
			ruixuCheckinCount: report.ruixuCheckinCount,
			ruixuProgressCount: report.ruixuProgressCount,
			attachments: report.attachments.length,
			recipient: RECIPIENT,
		});

		// Email confirmed sent — purge app collections (pre-activity-day only)
		// On 2026-06-27 (activity day) and after, retain data for reconciliation
		const PURGE_CUTOFF = "2026-06-27";
		if (dateStr < PURGE_CUTOFF) {
			try {
				const [purgedCheckins, purgedProgress] = await Promise.all([
					deleteAllDocs(db, "checkins"),
					deleteAllDocs(db, "player_progress"),
				]);
				logger.info("dumpCheckinsDaily purged", {
					date: dateStr,
					checkins: purgedCheckins,
					playerProgress: purgedProgress,
				});
			} catch (err) {
				// Purge failure must not re-throw: a retry would re-send the email
				logger.warn("dumpCheckinsDaily purge failed (email already sent)", {
					error: err instanceof Error ? err.message : String(err),
				});
			}
		} else {
			logger.info("dumpCheckinsDaily purge skipped (activity day or later)", {
				date: dateStr,
				cutoff: PURGE_CUTOFF,
			});
		}
	},
);
