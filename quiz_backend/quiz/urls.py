from django.urls import path
from .views import (
    CategoryListView,
    QuizListView,
    QuizDetailView,
    QuizSubmitView,
    UserAttemptHistoryView,
    AttemptDetailView,
)

urlpatterns = [
    path('categories/',              CategoryListView.as_view(),      name='category_list'),
    path('quizzes/',                 QuizListView.as_view(),           name='quiz_list'),
    path('quizzes/<int:pk>/',        QuizDetailView.as_view(),         name='quiz_detail'),
    path('quizzes/<int:pk>/submit/', QuizSubmitView.as_view(),         name='quiz_submit'),
    path('attempts/',                UserAttemptHistoryView.as_view(), name='attempt_list'),
    path('attempts/<int:pk>/',       AttemptDetailView.as_view(),      name='attempt_detail'),
]
