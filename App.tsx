
import React, { useState, useEffect, useMemo } from 'react';
import { Grade, UserProgress, RevisionTask, MCQ, ScoreEntry } from './types';
import { SYLLABUS, REVISION_INTERVALS } from './constants';
import { getStudyTips, generateMCQs } from './services/geminiService';
import { 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  GraduationCap, 
  BrainCircuit,
  Zap,
  X,
  AlertTriangle,
  Trophy,
  Target,
  BookOpen,
  ClipboardList,
  GitBranch,
  CircleDot,
  ArrowRight,
  Cpu,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'revision' | 'dashboard'>('plan');
  const [progress, setProgress] = useState<UserProgress>({ completedTopics: {} });
  const [loadingTips, setLoadingTips] = useState<string | null>(null);
  const [activeTips, setActiveTips] = useState<{ topic: string, content: string } | null>(null);

  // MCQ State
  const [quizTopic, setQuizTopic] = useState<{ id: string, name: string, subject: string, month: number } | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<MCQ[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizStep, setQuizStep] = useState<'questions' | 'result'>('questions');
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizRecommendation, setQuizRecommendation] = useState<string>('');

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('study_progress');
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('study_progress', JSON.stringify(progress));
  }, [progress]);

  const startQuiz = async (grade: Grade, subject: string, month: number, topic: string) => {
    const topicId = `${grade}-${subject}-${month}-${topic}`;
    setQuizTopic({ id: topicId, name: topic, subject, month });
    setQuizLoading(true);
    const mcqs = await generateMCQs(topic, subject, grade);
    if (mcqs) {
      setCurrentQuiz(mcqs);
      setQuizStep('questions');
      setUserAnswers([]);
    } else {
      setQuizStep('result');
    }
    setQuizLoading(false);
  };

  const handleQuizSubmit = (score: number, total: number) => {
    if (!quizTopic) return;
    const now = new Date().toISOString();
    const percent = (score / total) * 100;
    
    let recommendation = percent >= 80 
      ? "Cognitive mastery achieved. Neural pathway successfully reinforced." 
      : percent >= 60 
        ? "Knowledge sync complete. Minor gaps identified for next review." 
        : "Low retention detected. A refresh session is scheduled.";
    
    setQuizRecommendation(recommendation);

    setProgress(prev => {
      const newProgress = { ...prev };
      const tid = quizTopic.id;
      const scoreEntry: ScoreEntry = { date: now, score, total };
      
      if (newProgress.completedTopics[tid]) {
        newProgress.completedTopics[tid].scores = [...(newProgress.completedTopics[tid].scores || []), scoreEntry];
      } else {
        newProgress.completedTopics[tid] = { completionDate: now, history: [], scores: [scoreEntry] };
      }
      return newProgress;
    });
    setQuizStep('result');
  };

  const toggleTopic = (grade: Grade, subject: string, month: number, topic: string) => {
    const topicId = `${grade}-${subject}-${month}-${topic}`;
    if (progress.completedTopics[topicId]) {
       setProgress(prev => {
         const newProgress = { ...prev };
         delete newProgress.completedTopics[topicId];
         return newProgress;
       });
    } else {
       startQuiz(grade, subject, month, topic);
    }
  };

  const showTips = async (grade: Grade, subject: string, topic: string) => {
    setLoadingTips(topic);
    const tips = await getStudyTips(topic, subject, grade);
    setActiveTips({ topic, content: tips || 'Utilize neural associations to strengthen long-term memory.' });
    setLoadingTips(null);
  };

  const revisionTasks = useMemo(() => {
    const tasks: RevisionTask[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Object.entries(progress.completedTopics).forEach(([topicId, untypedData]) => {
      const data = untypedData as any;
      const completionDate = new Date(data.completionDate);
      const [grade, subject, month, topicName] = topicId.split('-');
      const latestScore = data.scores?.[data.scores.length - 1];
      const isWeak = latestScore ? (latestScore.score / latestScore.total < 0.8) : false;

      if (isWeak) {
        const lastActivity