import django_filters
from .models import Quiz


class QuizFilter(django_filters.FilterSet):
    category   = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')
    difficulty = django_filters.CharFilter(lookup_expr='iexact')
    min_score  = django_filters.NumberFilter(field_name='max_score', lookup_expr='gte')
    max_time   = django_filters.NumberFilter(field_name='time_limit', lookup_expr='lte')

    class Meta:
        model  = Quiz
        fields = ['category', 'difficulty']
