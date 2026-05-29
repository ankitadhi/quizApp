from django.contrib import admin
from .models import Category, Quiz, Question, Choice, UserAttempt, UserAnswer


class ChoiceInline(admin.TabularInline):
    model  = Choice
    extra  = 4
    fields = ['text', 'is_correct']


class QuestionInline(admin.StackedInline):
    model       = Question
    extra       = 1
    fields      = ['text', 'type', 'points', 'order', 'explanation']
    show_change_link = True


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display   = ['title', 'category', 'difficulty', 'is_published',
                      'question_count', 'time_limit', 'created_at']
    list_filter    = ['category', 'difficulty', 'is_published']
    search_fields  = ['title']
    list_editable  = ['is_published']
    inlines        = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display  = ['text', 'quiz', 'type', 'points', 'order']
    list_filter   = ['quiz', 'type']
    search_fields = ['text']
    inlines       = [ChoiceInline]


@admin.register(UserAttempt)
class UserAttemptAdmin(admin.ModelAdmin):
    list_display  = ['user', 'quiz', 'score', 'max_score', 'time_taken', 'completed_at']
    list_filter   = ['quiz']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['user', 'quiz', 'score', 'max_score', 'time_taken',
                       'started_at', 'completed_at']
