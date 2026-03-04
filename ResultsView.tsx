import React, { useMemo } from 'react';
import { QuizResult } from '../types';
import { CheckCircle2, XCircle, RefreshCw, Trophy, AlertCircle } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Note: react-use is a common hook lib, but since I can't add external deps easily, I will mock the dimension hook or just use fixed for confetti

interface ResultsViewProps {
  result: QuizResult;
  onRetry: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onRetry }) => {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  
  // A simple way to get window dimensions for confetti without extra libs
  const { innerWidth: width, innerHeight: height } = window;

  const grade = useMemo(() => {
    if (percentage >= 90) return { label: 'Excellent!', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 70) return { label: 'Good Job!', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 50) return { label: 'Keep Practicing', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  }, [percentage]);

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      {percentage >= 70 && <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      {/* Score Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mb-8 text-center relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-indigo-500"></div>
        <div className="p-8 md:p-12">
          <div className={`inline-flex items-center justify-center p-4 rounded-full ${grade.bg} mb-6`}>
            <Trophy className={`w-12 h-12 ${grade.color}`} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{percentage}%</h1>
          <h2 className={`text-2xl font-semibold ${grade.color} mb-6`}>{grade.label}</h2>
          <p className="text-slate-500 text-lg">
            You answered <span className="font-bold text-slate-800">{result.score}</span> out of <span className="font-bold text-slate-800">{result.totalQuestions}</span> questions correctly.
          </p>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100">
           <button 
             onClick={onRetry}
             className="text-primary-600 font-semibold hover:text-primary-700 flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors"
           >
             <RefreshCw className="w-4 h-4" /> Start New Test
           </button>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 px-2">Detailed Analysis</h3>
        
        {result.questions.map((q, idx) => {
          const userAnswer = result.userAnswers[idx];
          const isCorrect = userAnswer === q.correctAnswerIndex;
          
          return (
            <div key={q.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 pt-1">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">
                      <span className="text-slate-400 mr-2 text-sm font-normal">#{idx + 1}</span>
                      {q.text}
                    </h4>

                    <div className="space-y-2 mb-4">
                      {q.options.map((option, optIdx) => {
                        let optionStyle = "border-slate-100 bg-white text-slate-500";
                        // Logic for styling options based on correctness
                        if (optIdx === q.correctAnswerIndex) {
                          optionStyle = "border-green-200 bg-green-50 text-green-800 font-medium ring-1 ring-green-500/20";
                        } else if (optIdx === userAnswer && !isCorrect) {
                          optionStyle = "border-red-200 bg-red-50 text-red-800 font-medium ring-1 ring-red-500/20";
                        }

                        return (
                          <div key={optIdx} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${optionStyle}`}>
                             <span>{option}</span>
                             {optIdx === q.correctAnswerIndex && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                             {optIdx === userAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 flex gap-3 items-start border border-slate-100">
                      <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-primary-700 block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};