from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Quiz, Question, Choice, UserAttempt, UserAnswer
from .serializers import (
    CategorySerializer,
    QuizListSerializer,
    QuizDetailSerializer,
    QuizSubmitSerializer,
    AttemptResultSerializer,
    AttemptHistorySerializer,
)
from .filters import QuizFilter


class CategoryListView(generics.ListAPIView):
    """GET /api/categories/ — public"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Disable pagination


class QuizListView(generics.ListAPIView):
    """
    GET /api/quizzes/
    Supports filtering:  ?category=science&difficulty=easy
    Supports searching:  ?search=python
    Supports ordering:   ?ordering=-created_at
    """
    serializer_class = QuizListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend,
                       filters.SearchFilter, filters.OrderingFilter]
    filterset_class = QuizFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'difficulty', 'title']
    ordering = ['-created_at']
    pagination_class = None  # Disable pagination for this view

    def get_queryset(self):
        return Quiz.objects.filter(is_published=True).select_related('category')


class QuizDetailView(generics.RetrieveAPIView):
    """
    GET /api/quizzes/<id>/
    Returns full quiz with questions — choices do NOT include is_correct.
    """
    serializer_class = QuizDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Quiz.objects.filter(is_published=True).prefetch_related(
            'questions', 'questions__choices', 'category'
        )


class QuizSubmitView(APIView):
    """
    POST /api/quizzes/<id>/submit/
    Accepts the user's answers, grades them, saves the attempt,
    updates the user's total_score, and returns full results.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk, is_published=True)

        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        started_at = data['started_at']
        time_taken = int((timezone.now() - started_at).total_seconds())

        # ── Time limit enforcement ─────────────────────────────────────────
        if time_taken > quiz.time_limit + 10:   # 10s grace for network latency
            return Response(
                {'error': 'Quiz time limit exceeded.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        questions = {
            q.id: q for q in quiz.questions.prefetch_related('choices').all()}
        submitted_map = {a['question_id']: a['choice_ids']
                         for a in data['answers']}

        total_score = 0
        max_score = sum(q.points for q in questions.values())

        # ── Create attempt record ──────────────────────────────────────────
        attempt = UserAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=0,           # updated below
            max_score=max_score,
            time_taken=time_taken,
            started_at=started_at,
        )

        # ── Grade each question ────────────────────────────────────────────
        for question in questions.values():
            chosen_ids = set(submitted_map.get(question.id, []))
            correct_ids = set(
                question.choices.filter(
                    is_correct=True).values_list('id', flat=True)
            )

            # A question is correct only if the submitted choices exactly
            # match the correct choices (handles multi-select fairly)
            is_correct = (chosen_ids == correct_ids) and len(chosen_ids) > 0

            user_answer = UserAnswer.objects.create(
                attempt=attempt,
                question=question,
                is_correct=is_correct,
            )
            # Attach the chosen Choice objects
            valid_choices = question.choices.filter(id__in=chosen_ids)
            user_answer.choices.set(valid_choices)

            if is_correct:
                total_score += question.points

        # ── Persist score ──────────────────────────────────────────────────
        attempt.score = total_score
        attempt.save(update_fields=['score'])

        # Update user's lifetime total score
        request.user.add_score(total_score)

        result = AttemptResultSerializer(attempt, context={'request': request})
        return Response(result.data, status=status.HTTP_201_CREATED)


class UserAttemptHistoryView(generics.ListAPIView):
    """GET /api/attempts/ — returns the current user's quiz history."""
    serializer_class = AttemptHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        return UserAttempt.objects.filter(user=self.request.user).select_related('quiz', 'quiz__category')


class AttemptDetailView(generics.RetrieveAPIView):
    """GET /api/attempts/<id>/ — full result with per-question breakdown."""
    serializer_class = AttemptResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only view their own attempt details
        return UserAttempt.objects.filter(user=self.request.user).prefetch_related(
            'answers', 'answers__question', 'answers__question__choices', 'answers__choices'
        )
