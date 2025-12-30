
export type Grade = '9' | '10' | '11' | '12';

export interface ScoreEntry {
  date: string;
  score: number;
  total: number;
}

export interface Chapter {
  id: string;
  name: string;
  subject: string;
}

export interface MonthData {
  month: number;
  subjects: {
    [subject: string]: string[];
  };
}

export interface SyllabusData {
  [grade: string]: MonthData[];
}

export interface UserProgress {
  completedTopics: {
    [topicId: string]: {
      completionDate: string; // ISO string
      history: string[]; // List of revision dates
      scores: ScoreEntry[];
    };
  };
}

export interface RevisionTask {
  topicId: string;
  topicName: string;
  subject: string;
  revisionStep: number; // 1, 3, 7, 30, 60
  dueDate: string;
  lastScore?: number;
}

export interface MCQ {
  question: string;
  options: string[];
  answer: number; // index of correct option
}
