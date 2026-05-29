from django.utils import timezone
from rest_framework import serializers
from .models import Category, Quiz, Question, Choice, UserAttempt, UserAnswer


class CategorySerializer(serializers.ModelSerializer):
    quiz_count = serializers.IntegerField(source='quizzes.count', read_only=True)

    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'icon', 'quiz_count']


class ChoiceSerializer(serializers.ModelSerializer):
    """Serializer for quiz-taking — does NOT expose is_correct."""
    class Meta:
        model  = Choice
        fields = ['id', 'text']


class ChoiceWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer for results — exposes is_correct."""
    class Meta:
        model  = Choice
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    """Used when fetching a quiz to take — hides correct answers."""
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model  = Question
        fields = ['id', 'text', 'type', 'points', 'order', 'image', 'choices']


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Used in results — reveals correct answers and explanations."""
    choices = ChoiceWithAnswerSerializer(many=True, read_only=True)

    class Meta:
        model  = Question
        fields = ['id', 'text', 'type', 'points', 'order',
                  'choices', 'explanation']


class QuizListSerializer(serializers.ModelSerializer):
    """Lightweight — used in list endpoints."""
    category       = CategorySerializer(read_only=True)
    question_count = serializers.ReadOnlyField()

    class Meta:
        model  = Quiz
        fields = ['id', 'title', 'description', 'category', 'difficulty',
                  'time_limit', 'max_score', 'question_count', 'created_at']


class QuizDetailSerializer(serializers.ModelSerializer):
    """Full quiz with all questions (no answers)."""
    category  = CategorySerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.ReadOnlyField()

    class Meta:
        model  = Quiz
        fields = ['id', 'title', 'description', 'category', 'difficulty',
                  'time_limit', 'max_score', 'question_count', 'questions', 'created_at']


# ─── Submission serializers ───────────────────────────────────────────────────

class AnswerInputSerializer(serializers.Serializer):
    """One answer record submitted by the user."""
    question_id = serializers.IntegerField()
    choice_ids  = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text='List of chosen choice IDs'
    )


class QuizSubmitSerializer(serializers.Serializer):
    started_at = serializers.DateTimeField(help_text='ISO timestamp when the quiz was started')
    answers    = AnswerInputSerializer(many=True)

    def validate_started_at(self, value):
        if value > timezone.now():
            raise serializers.ValidationError('started_at cannot be in the future.')
        return value


# ─── Result serializers ───────────────────────────────────────────────────────

class UserAnswerResultSerializer(serializers.ModelSerializer):
    question       = QuestionWithAnswerSerializer(read_only=True)
    chosen_choices = serializers.SerializerMethodField()

    class Meta:
        model  = UserAnswer
        fields = ['question', 'chosen_choices', 'is_correct']

    def get_chosen_choices(self, obj):
        return ChoiceWithAnswerSerializer(obj.choices.all(), many=True).data


class AttemptResultSerializer(serializers.ModelSerializer):
    """Full attempt result returned after submission."""
    answers    = UserAnswerResultSerializer(many=True, read_only=True)
    percentage = serializers.ReadOnlyField()
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model  = UserAttempt
        fields = ['id', 'quiz_title', 'score', 'max_score', 'percentage',
                  'time_taken', 'completed_at', 'answers']


class AttemptHistorySerializer(serializers.ModelSerializer):
    """Lightweight — used in profile history lists."""
    quiz_title  = serializers.CharField(source='quiz.title', read_only=True)
    category    = serializers.CharField(source='quiz.category.name', read_only=True)
    percentage  = serializers.ReadOnlyField()

    class Meta:
        model  = UserAttempt
        fields = ['id', 'quiz_title', 'category', 'score', 'max_score',
                  'percentage', 'time_taken', 'completed_at']
