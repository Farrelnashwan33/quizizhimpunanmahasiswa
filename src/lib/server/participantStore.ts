export interface ParticipantAttempt {
	id: string;
	quizId: string;
	studentId: string;
	status: 'completed' | 'in_progress' | 'timed_out';
	score: number | null;
	correctCount: number;
	wrongCount: number;
	totalQuestions: number;
	startedAt: Date;
	submittedAt: Date | null;
	student: {
		id: string;
		fullName: string;
		nim: string;
		email: string;
		programStudi: string;
		whatsapp: string | null;
		role: 'mahasiswa' | 'admin';
		createdAt: Date;
	};
	quiz: {
		id: string;
		title: string;
	};
	answers?: any[];
	tabSwitchCount?: number;
}

export interface LiveViolation {
	id: string;
	studentName: string;
	nim: string;
	programStudi: string;
	violationCount: number;
	timestamp: string;
	message: string;
}

// In-memory store during node server lifetime
export const inMemoryAttempts: ParticipantAttempt[] = [];
export const inMemoryViolations: LiveViolation[] = [];

export function recordAttempt(attempt: ParticipantAttempt) {
	const existingIndex = inMemoryAttempts.findIndex((a) => a.id === attempt.id);
	if (existingIndex >= 0) {
		inMemoryAttempts[existingIndex] = attempt;
	} else {
		inMemoryAttempts.unshift(attempt);
	}
}

export function getAllAttempts(): ParticipantAttempt[] {
	return inMemoryAttempts;
}

export function recordViolation(violation: LiveViolation) {
	inMemoryViolations.unshift(violation);
	if (inMemoryViolations.length > 100) {
		inMemoryViolations.pop();
	}

	// Update existing attempt if any
	const att = inMemoryAttempts.find((a) => a.student.nim === violation.nim);
	if (att) {
		att.tabSwitchCount = violation.violationCount;
	}
}

export function getLiveViolations(): LiveViolation[] {
	return inMemoryViolations;
}
