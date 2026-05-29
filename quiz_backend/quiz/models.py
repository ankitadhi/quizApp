from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Emoji or icon class')

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Quiz(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy',   'Easy'),
        ('medium', 'Medium'),
        ('hard',   'Hard'),
    ]

    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='quizzes')
    difficulty  = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    time_limit  = models.PositiveIntegerField(default=300, help_text='Time limit in seconds')
    max_score   = models.PositiveIntegerField(default=100)
    is_published = models.BooleanField(default=False)
    created_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_quizzes')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'difficulty']),
            models.Index(fields=['is_published']),
        ]

    def __str__(self):
        return self.title

    @property
    def question_count(self):
        return self.questions.count()


class Question(models.Model):
    QUESTION_TYPES = [
        ('mcq',        'Multiple Choice'),
        ('true_false', 'True / False'),
        ('multi',      'Multi Select'),    # multiple correct answers
    ]

    quiz        = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text        = models.TextField()
    type        = models.CharField(max_length=15, choices=QUESTION_TYPES, default='mcq')
    explanation = models.TextField(blank=True, help_text='Shown after the quiz is submitted')
    points      = models.PositiveIntegerField(default=10)
    order       = models.PositiveIntegerField(default=0, help_text='Display order')
    image       = models.ImageField(upload_to='questions/', blank=True, null=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'[{self.quiz.title}] {self.text[:60]}'


class Choice(models.Model):
    question   = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text       = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        marker = '✓' if self.is_correct else '✗'
        return f'{marker} {self.text[:60]}'


class UserAttempt(models.Model):
    """One completed quiz attempt by a user."""
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts')
    quiz        = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score       = models.PositiveIntegerField(default=0, db_index=True)
    max_score   = models.PositiveIntegerField(default=0)
    time_taken  = models.PositiveIntegerField(default=0, help_text='Seconds taken to complete')
    started_at  = models.DateTimeField()
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']
        indexes = [
            models.Index(fields=['user', 'quiz']),
            models.Index(fields=['score']),
        ]

    def __str__(self):
        return f'{self.user.username} → {self.quiz.title} ({self.score}/{self.max_score})'

    @property
    def percentage(self):
        if self.max_score == 0:
            return 0
        return round((self.score / self.max_score) * 100, 1)


class UserAnswer(models.Model):
    """Individual answer given by a user during an attempt."""
    attempt    = models.ForeignKey(UserAttempt, on_delete=models.CASCADE, related_name='answers')
    question   = models.ForeignKey(Question, on_delete=models.CASCADE)
    # For MCQ/TrueFalse: one choice. For multi-select: multiple choices.
    choices    = models.ManyToManyField(Choice, blank=True)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f'Answer to Q{self.question_id} ({"✓" if self.is_correct else "✗"})'
