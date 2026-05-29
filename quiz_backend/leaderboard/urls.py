from django.urls import path
from .views import GlobalLeaderboardView, QuizLeaderboardView, UserStatsView

urlpatterns = [
    path('leaderboard/',                   GlobalLeaderboardView.as_view(), name='global_leaderboard'),
    path('leaderboard/quiz/<int:quiz_id>/', QuizLeaderboardView.as_view(),  name='quiz_leaderboard'),
    path('stats/',                         UserStatsView.as_view(),         name='user_stats'),
]
