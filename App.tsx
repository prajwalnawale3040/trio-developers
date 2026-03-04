import React, { useState, useCallback } from 'react';
import { SetupForm } from './components/SetupForm';
import { LoadingScreen } from './components/LoadingScreen';
import { QuizRunner } from './components/QuizRunner';
import { ResultsView } from './components/ResultsView';
import { generateQuestions } from './services/geminiService';
import { AppState, Question, QuizSettings, QuizResult } from './types';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartQuiz = useCallback(async (settings: QuizSettings) => {
    setQuizSettings(settings);
    setAppState(AppState.LOADING);
    setErrorMsg(null);

    try {
      const generatedQuestions = await generateQuestions(
        settings.topic,
        settings.difficulty,
        settings.questionCount
      );
      setQuestions(generatedQuestions);
      setAppState(AppState.QUIZ);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to generate the quiz. Please try again later or verify your internet connection.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleFinishQuiz = useCallback((userAnswers: number[]) => {
    if (!questions.length) return;

    let score = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswerIndex) {
        score++;
      }
    });

    setQuizResult({
      totalQuestions: questions.length,
      score,
      userAnswers,
      questions
    });
    setAppState(AppState.RESULTS);
  }, [questions]);

  const handleRetry = useCallback(() => {
    setAppState(AppState.SETUP);
    setQuestions([]);
    setQuizResult(null);
    setQuizSettings(null);
    setErrorMsg(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-100">
      
      {/* Header/Nav - Simple */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={handleRetry}>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                AceMock
              </span>
            </div>
            {appState === AppState.QUIZ && (
               <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                 {quizSettings?.topic} • {quizSettings?.difficulty}
               </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {appState === AppState.SETUP && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <div className="text-center mb-10">
               <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                 Master Any Subject
               </h1>
               <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                 Generate custom AI-powered mock tests instantly. Practice, learn from mistakes, and improve your scores.
               </p>
             </div>
             <SetupForm onStart={handleStartQuiz} />
          </div>
        )}

        {appState === AppState.LOADING && quizSettings && (
          <LoadingScreen topic={quizSettings.topic} />
        )}

        {appState === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
               <AlertTriangle className="w-8 h-8 text-red-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
             <p className="text-slate-500 mb-8 max-w-md">{errorMsg || "An unexpected error occurred."}</p>
             <button 
               onClick={handleRetry}
               className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
             >
               Try Again
             </button>
           </div>
        )}

        {appState === AppState.QUIZ && (
          <QuizRunner questions={questions} onFinish={handleFinishQuiz} />
        )}

        {appState === AppState.RESULTS && quizResult && (
          <ResultsView result={quizResult} onRetry={handleRetry} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} AceMock. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;