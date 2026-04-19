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
		question: "請問天鵝湖裡有幾種品種的天鵝？",
		options: ["5種", "10種", "30種", "42種"],
		correct: "10種",
		successTip: "天鵝湖裡有多種天鵝，常見的包含黑天鵝與大天鵝，是很好的觀察主題。",
	},
	2: {
		question: "開闊草原最能支持下列哪一種生態角色？",
		options: ["深海魚類", "草食動物與昆蟲棲地", "珊瑚蟲", "企鵝繁殖"],
		correct: "草食動物與昆蟲棲地",
		successTip: "草原提供草本植物與開闊視野，適合多種昆蟲與小型草食動物活動。",
	},
	3: {
		question: "在森林步道行走時，較恰當的作法是？",
		options: ["離開步道抄近路", "依告示與動線前進", "大聲播放音樂驅蟲", "隨意摘取植物帶回"],
		correct: "依告示與動線前進",
		successTip: "留在步道上可降低迷路風險，也減少對林下生物的干擾。",
	},
	4: {
		question: "松鼠常把食物藏起來，主要是為了？",
		options: ["當作玩具", "度過食物較少的時段", "吸引遊客拍照", "築巢防水"],
		correct: "度過食物較少的時段",
		successTip: "許多松鼠會儲藏種子與堅果，在資源稀少時再取回食用。",
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
