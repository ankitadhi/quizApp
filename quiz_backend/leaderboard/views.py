from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Avg, Max
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers

from quiz.models import UserAttempt, Quiz

User = get_user_model()


class LeaderboardEntrySerializer(serializers.Serializer):
    rank         = serializers.IntegerField()
    user_id      = serializers.IntegerField()
    username     = serializers.CharField()
    total_score  = serializers.IntegerField()
    quizzes_taken = serializers.IntegerField()
    avg_score    = serializers.FloatField()


class GlobalLeaderboardView(APIView):
    """
    GET /api/leaderboard/
    Returns top 50 users ranked by total_score.
    Also highlights where the current user sits (if authenticated).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top_users = (
            User.objects
            .filter(is_active=True, is_staff=False)
            .order_by('-total_score')[:50]
            .values('id', 'username', 'total_score')
        )

        # Enrich with quiz stats
        stats = (
            UserAttempt.objects
            .values('user_id')
            .annotate(
                quizzes_taken=Count('id'),
                avg_score=Avg('score'),
            )
        )
        stats_map = {s['user_id']: s for s in stats}

        leaderboard = []
        for rank, user in enumerate(top_users, start=1):
            user_stats = stats_map.get(user['id'], {})
            leaderboard.append({
                'rank':          rank,
                'user_id':       user['id'],
                'username':      user['username'],
                'total_score':   user['total_score'],
                'quizzes_taken': user_stats.get('quizzes_taken', 0),
                'avg_score':     round(user_stats.get('avg_score') or 0, 1),
            })

        # Current user's rank (if authenticated and not in top 50)
        my_rank = None
        if request.user.is_authenticated:
            higher_count = User.objects.filter(
                total_score__gt=request.user.total_score,
                is_active=True,
                is_staff=False,
            ).count()
            my_rank = higher_count + 1

        return Response({
            'leaderboard': leaderboard,
            'my_rank':     my_rank,
        })


class QuizLeaderboardView(APIView):
    """
    GET /api/leaderboard/quiz/<quiz_id>/
    Best score per user for a specific quiz.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, quiz_id):
        entries = (
            UserAttempt.objects
            .filter(quiz_id=quiz_id)
            .values('user__id', 'user__username')
            .annotate(
                best_score=Max('score'),
                attempts=Count('id'),
            )
            .order_by('-best_score')[:50]
        )

        leaderboard = [
            {
                'rank':       i + 1,
                'user_id':    e['user__id'],
                'username':   e['user__username'],
                'best_score': e['best_score'],
                'attempts':   e['attempts'],
            }
            for i, e in enumerate(entries)
        ]

        return Response({'leaderboard': leaderboard})


class UserStatsView(APIView):
    """
    GET /api/stats/
    Detailed stats for the currently logged-in user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        attempts = UserAttempt.objects.filter(user=user)

        agg = attempts.aggregate(
            total_quizzes=Count('id'),
            total_score=Sum('score'),
            avg_score=Avg('score'),
            best_score=Max('score'),
        )

        # Category breakdown
        by_category = (
            attempts
            .values('quiz__category__name')
            .annotate(count=Count('id'), avg=Avg('score'))
            .order_by('-count')
        )

        # Global rank
        my_rank = User.objects.filter(
            total_score__gt=user.total_score, is_active=True
        ).count() + 1

        return Response({
            'total_quizzes': agg['total_quizzes'] or 0,
            'total_score':   agg['total_score']   or 0,
            'avg_score':     round(agg['avg_score'] or 0, 1),
            'best_score':    agg['best_score']     or 0,
            'global_rank':   my_rank,
            'by_category':   list(by_category),
        })
