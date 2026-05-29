import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../api/endpoints";
import "../styles/QuizTake.css";
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

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!quiz) return <div className="error">Quiz not found</div>;

  return (
    <div className="quiz-take-container">
      <div className="quiz-take-header">
        <div className="quiz-title">
          <h2>{quiz.title}</h2>
          <p>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>
        <div className="quiz-timer">
          <span className={`time ${(timeLeft || 0) <= 60 ? "warning" : ""}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="quiz-progress">
        <div
          className="progress-bar"
          style={{
            width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>

      {currentQuestion && (
        <div className="question-container">
          <div className="question-box">
            <h3 className="question-text">{currentQuestion.text}</h3>
            {currentQuestion.image && (
              <img
                src={currentQuestion.image}
                alt="Question"
                className="question-image"
              />
            )}
          </div>

          <div className="choices-container">
            {currentQuestion.choices.map((choice) => {
              const isSelected = answers
                .get(currentQuestion.id)
                ?.includes(choice.id);
              return (
                <label
                  key={choice.id}
                  className={`choice-label ${isSelected ? "selected" : ""}`}
                >
                  <input
                    type={
                      currentQuestion.type === "multi" ? "checkbox" : "radio"
                    }
                    name={`question-${currentQuestion.id}`}
                    checked={isSelected || false}
                    onChange={() => handleChoiceSelect(choice.id)}
                    className="choice-input"
                  />
                  <span className="choice-text">{choice.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="quiz-navigation">
        <button
          onClick={() =>
            setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
          }
          disabled={currentQuestionIndex === 0}
          className="nav-btn"
        >
          ← Previous
        </button>

        <div className="question-indicators">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`indicator ${
                index === currentQuestionIndex
                  ? "current"
                  : answers.has(quiz.questions[index].id)
                    ? "answered"
                    : ""
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
            className="submit-btn"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="nav-btn"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};
