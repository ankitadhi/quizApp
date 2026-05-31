import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../api/endpoints";
import type { FC } from "react";
import type { QuizDetail, UserAnswer } from "../api/endpoints";

export const QuizTake: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizAPI.getQuizDetail(Number(id));
        setQuiz(response.data);
        setTimeLeft(response.data.time_limit);
        setError(null);
      } catch (err) {
        setError("Failed to load quiz");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (!quiz || timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, timeLeft]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleChoiceSelect = (choiceId: number) => {
    if (!currentQuestion) return;

    const newAnswers = new Map(answers);
    const currentAnswers = newAnswers.get(currentQuestion.id) || [];

    if (
      currentQuestion.type === "mcq" ||
      currentQuestion.type === "true_false"
    ) {
      newAnswers.set(currentQuestion.id, [choiceId]);
    } else if (currentQuestion.type === "multi") {
      if (currentAnswers.includes(choiceId)) {
        newAnswers.set(
          currentQuestion.id,
          currentAnswers.filter((id) => id !== choiceId),
        );
      } else {
        newAnswers.set(currentQuestion.id, [...currentAnswers, choiceId]);
      }
    }

    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const submissionAnswers: UserAnswer[] = Array.from(answers.entries()).map(
        ([questionId, choiceIds]) => ({
          question_id: questionId,
          choice_ids: choiceIds,
        }),
      );

      const response = await quizAPI.submitQuiz(quiz.id, {
        started_at: startTime.toISOString(),
        answers: submissionAnswers,
      });

      navigate(`/results/${response.data.id}`, { state: response.data });
    } catch (err) {
      setError("Failed to submit quiz");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isLastQuestion =
    currentQuestionIndex === (quiz?.questions.length || 0) - 1;

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-8 text-center text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-8 text-center text-red-600 text-lg">
          Quiz not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{quiz.title}</h2>
          <p className="text-slate-600 mt-2">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>
        <div className="text-center">
          <div
            className={`text-4xl font-bold ${(timeLeft || 0) <= 60 ? "text-red-600" : "text-blue-600"}`}
          >
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-slate-600">Time Left</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Container */}
      {currentQuestion && (
        <div className="card p-8 mb-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {currentQuestion.text}
            </h3>
            {currentQuestion.image && (
              <img
                src={currentQuestion.image}
                alt="Question"
                className="rounded-lg max-h-96 object-cover"
              />
            )}
          </div>

          {/* Choices */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice) => {
              const isSelected = answers
                .get(currentQuestion.id)
                ?.includes(choice.id);
              return (
                <label
                  key={choice.id}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-400"
                  }`}
                >
                  <input
                    type={
                      currentQuestion.type === "multi" ? "checkbox" : "radio"
                    }
                    name={`question-${currentQuestion.id}`}
                    checked={isSelected || false}
                    onChange={() => handleChoiceSelect(choice.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="ml-3 text-lg text-slate-900 font-medium">
                    {choice.text}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <button
          onClick={() =>
            setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
          }
          disabled={currentQuestionIndex === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Question Indicators */}
        <div className="flex gap-2 flex-wrap justify-center">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-full font-bold transition ${
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : answers.has(quiz.questions[index].id)
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
              title={`Question ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "⏳ Submitting..." : "✅ Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="btn-primary"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};
