/**
 * 各關示範題庫（原型用，之後改由 API／後台維護）。
 * 答錯不顯示解答；答對後可顯示 successTip「小知識時間」（不影響下一題）。
 */
import { GAME_CONFIG } from "@/constants";

export type StageQuiz = {
	question: string;
	options: [string, string, string, string];
	correct: string;
	successTip: string;
};

export const STAGE_QUIZZES: Record<number, StageQuiz> = {
	1: {
		question: "世界著名的《天鵝湖》芭蕾舞劇是由下面哪位作曲家創作的呢？",
		options: ["柴犬夫斯基", "貝多芬", "柴可夫斯基", "莫札特"],
		correct: "柴可夫斯基",
		successTip: "《天鵝湖》是俄國作曲家柴可夫斯基的經典芭蕾舞作，於 1875–76 年創作。",
	},
	2: {
		question: "請問「水豚君」最喜歡做什麼事情來放鬆心情呢？",
		options: ["跳街舞", "泡在水裡或洗溫泉", "跟路人比賽賽跑", "練習爬樹"],
		correct: "泡在水裡或洗溫泉",
		successTip: "水豚是半水生動物，喜歡泡在水裡或溫泉裡放鬆，也能藉此調節體溫、躲避天敵。",
	},
	3: {
		question: "在森林步道行走時，較恰當的作法是？",
		options: ["離開步道抄近路", "依告示與動線前進", "大聲播放音樂驅蟲", "隨意摘取植物帶回"],
		correct: "依告示與動線前進",
		successTip: "留在步道上可降低迷路風險，也減少對林下生物的干擾。",
	},
	4: {
		question: "請問當羊駝心情不爽或生氣時，最常做的動作是什麼？",
		options: ["找你握手", "對你吐口水", "幫你按摩", "跳一段芭蕾舞"],
		correct: "對你吐口水",
		successTip: "羊駝在不爽或受威脅時會吐口水表達情緒、劃清界線，是牠們常見的溝通方式。",
	},
	5: {
		question: "「昆蟲飯店」這類設施主要目的接近？",
		options: ["飼養寵物昆蟲販售", "提供授粉與益蟲棲息空間", "防治所有蚊蟲", "收集垃圾"],
		correct: "提供授粉與益蟲棲息空間",
		successTip: "昆蟲飯店利用木材、竹管等縫隙，讓獨居蜂、甲蟲等有益昆蟲暫住或過冬。",
	},
	6: {
		question: "完成所有站點後，關於園區體驗下列何者最合適？",
		options: ["隨意丟棄垃圾", "將野生動物帶回家", "回顧所學並支持保育", "破壞告示設施"],
		correct: "回顧所學並支持保育",
		successTip: "生態園區重在體驗與教育，把所學帶回生活，就是最棒的終點禮物。",
	},
};

export function getStageQuiz(stage: number): StageQuiz {
	const n = Number.isFinite(stage) &&
		stage >= GAME_CONFIG.MIN_STAGE &&
		stage <= GAME_CONFIG.TOTAL_STAGES
		? stage
		: GAME_CONFIG.MIN_STAGE;
	return STAGE_QUIZZES[n] ?? STAGE_QUIZZES[1];
}
