"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listChallenges = listChallenges;
exports.getChallenge = getChallenge;
exports.stageIdToChallengeId = stageIdToChallengeId;
exports.getOrInitProgress = getOrInitProgress;
exports.applyAttemptResult = applyAttemptResult;
exports.restartPlaythrough = restartPlaythrough;
const store_1 = require("../utils/store");
const CHALLENGES = [
    {
        id: "c1",
        title: "請問天鵝湖裡有幾種品種的天鵝？",
        options: ["A", "B", "C", "D"],
        correctChoiceId: "B",
    },
    {
        id: "c2",
        title: "開闊草原最能支持下列哪一種生態角色？",
        options: ["A", "B", "C", "D"],
        correctChoiceId: "B",
    },
    {
        id: "c3",
        title: "在森林步道行走時，較恰當的作法是？",
        options: ["A", "B", "C", "D"],
        correctChoiceId: "B",
    },
    {
        id: "c4",
        title: "松鼠常把食物藏起來，主要是為了？",
        options: ["A", "B", "C", "D"],
        correctChoiceId: "B",
    },
    {
        id: "c5",
        title: "昆蟲飯店這類設施主要目的是？",
        options: ["A", "B", "C", "D"],
        correctChoiceId: "B",
    },
    {
        id: "c6",
        title: "完成所有站點後，下列何者最合適？",
        options: ["A", "B", "C", "D"],
        correctChoiceId: "C",
    },
];
const playerProgress = new Map();
function defaultProgress() {
    return {
        currentStageId: 1,
        completedStageIds: [],
        fullClearCount: 0,
        rewardRedeemCount: 0,
        maxRounds: 3,
    };
}
function listChallenges() {
    return CHALLENGES;
}
function getChallenge(challengeId) {
    return CHALLENGES.find((v) => v.id === challengeId) ?? null;
}
function stageIdToChallengeId(stageId) {
    if (stageId < 1 || stageId > CHALLENGES.length) {
        return CHALLENGES[0].id;
    }
    return CHALLENGES[stageId - 1].id;
}
async function getOrInitProgress(employeeId) {
    if ((0, store_1.useFirestoreStore)()) {
        const db = (0, store_1.getDb)();
        const ref = db.collection("player_progress").doc(employeeId);
        const snap = await ref.get();
        if (snap.exists) {
            return snap.data();
        }
        const init = defaultProgress();
        await ref.set(init, { merge: true });
        return init;
    }
    const found = playerProgress.get(employeeId);
    if (found) {
        return found;
    }
    const init = defaultProgress();
    playerProgress.set(employeeId, init);
    return init;
}
async function applyAttemptResult(employeeId, challengeId, choiceId) {
    const challenge = getChallenge(challengeId);
    if (!challenge) {
        return { correct: false, nextStageId: null };
    }
    const progress = await getOrInitProgress(employeeId);
    const correct = challenge.correctChoiceId === choiceId;
    if (!correct) {
        return {
            correct: false,
            nextStageId: progress.currentStageId,
        };
    }
    const stageId = CHALLENGES.findIndex((v) => v.id === challengeId) + 1;
    if (stageId > 0 && !progress.completedStageIds.includes(stageId)) {
        progress.completedStageIds.push(stageId);
        progress.completedStageIds.sort((a, b) => a - b);
    }
    if (progress.completedStageIds.length >= CHALLENGES.length) {
        progress.currentStageId = CHALLENGES.length;
        if ((0, store_1.useFirestoreStore)()) {
            const db = (0, store_1.getDb)();
            await db.collection("player_progress").doc(employeeId).set(progress, { merge: true });
        }
        return { correct: true, nextStageId: null };
    }
    progress.currentStageId = Math.min(stageId + 1, CHALLENGES.length);
    if ((0, store_1.useFirestoreStore)()) {
        const db = (0, store_1.getDb)();
        await db.collection("player_progress").doc(employeeId).set(progress, { merge: true });
    }
    return { correct: true, nextStageId: progress.currentStageId };
}
async function restartPlaythrough(employeeId) {
    const progress = await getOrInitProgress(employeeId);
    if (progress.completedStageIds.length < CHALLENGES.length) {
        return null;
    }
    if (progress.fullClearCount >= progress.maxRounds) {
        return null;
    }
    progress.fullClearCount += 1;
    progress.completedStageIds = [];
    progress.currentStageId = 1;
    if ((0, store_1.useFirestoreStore)()) {
        const db = (0, store_1.getDb)();
        await db.collection("player_progress").doc(employeeId).set(progress, { merge: true });
    }
    return {
        ok: true,
        fullClearCount: progress.fullClearCount,
        remainingRounds: Math.max(progress.maxRounds - progress.fullClearCount, 0),
    };
}
