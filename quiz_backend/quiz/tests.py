from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from .models import Category, Quiz, Question, Choice

User = get_user_model()


class QuizAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='StrongPass123!'
        )

        # Create quiz data
        self.category = Category.objects.create(name='Science', slug='science')
        self.quiz = Quiz.objects.create(
            title='Basic Science',
            category=self.category,
            difficulty='easy',
            time_limit=300,
            max_score=30,
            is_published=True,
        )
        self.q1 = Question.objects.create(quiz=self.quiz, text='2+2=?', points=10, order=1)
        self.c1_correct = Choice.objects.create(question=self.q1, text='4', is_correct=True)
        self.c1_wrong   = Choice.objects.create(question=self.q1, text='5', is_correct=False)

        self.q2 = Question.objects.create(quiz=self.quiz, text='Sky color?', points=10, order=2)
        self.c2_correct = Choice.objects.create(question=self.q2, text='Blue', is_correct=True)
        self.c2_wrong   = Choice.objects.create(question=self.q2, text='Red',  is_correct=False)

        self.q3 = Question.objects.create(quiz=self.quiz, text='H2O is?', points=10, order=3)
        self.c3_correct = Choice.objects.create(question=self.q3, text='Water', is_correct=True)
        self.c3_wrong   = Choice.objects.create(question=self.q3, text='Acid',  is_correct=False)

    def _login(self):
        self.client.force_authenticate(user=self.user)

    def test_quiz_list_public(self):
        """Anyone can list published quizzes."""
        res = self.client.get('/api/quizzes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 1)

    def test_quiz_detail_no_correct_answers(self):
        """Quiz detail must NOT expose is_correct to anonymous users."""
        res = self.client.get(f'/api/quizzes/{self.quiz.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for question in res.data['questions']:
            for choice in question['choices']:
                self.assertNotIn('is_correct', choice, 'is_correct must not be exposed before submission')

    def test_submit_all_correct(self):
        """Submitting all correct answers gives full score."""
        self._login()
        payload = {
            'started_at': timezone.now().isoformat(),
            'answers': [
                {'question_id': self.q1.id, 'choice_ids': [self.c1_correct.id]},
                {'question_id': self.q2.id, 'choice_ids': [self.c2_correct.id]},
                {'question_id': self.q3.id, 'choice_ids': [self.c3_correct.id]},
            ]
        }
        res = self.client.post(f'/api/quizzes/{self.quiz.id}/submit/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['score'], 30)
        self.assertEqual(res.data['percentage'], 100.0)

    def test_submit_all_wrong(self):
        """Submitting all wrong answers gives zero score."""
        self._login()
        payload = {
            'started_at': timezone.now().isoformat(),
            'answers': [
                {'question_id': self.q1.id, 'choice_ids': [self.c1_wrong.id]},
                {'question_id': self.q2.id, 'choice_ids': [self.c2_wrong.id]},
                {'question_id': self.q3.id, 'choice_ids': [self.c3_wrong.id]},
            ]
        }
        res = self.client.post(f'/api/quizzes/{self.quiz.id}/submit/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['score'], 0)

    def test_submit_requires_auth(self):
        """Unauthenticated users cannot submit a quiz."""
        payload = {
            'started_at': timezone.now().isoformat(),
            'answers': []
        }
        res = self.client.post(f'/api/quizzes/{self.quiz.id}/submit/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_total_score_updated(self):
        """After submission, the user's total_score is incremented."""
        self._login()
        initial_score = self.user.total_score
        payload = {
            'started_at': timezone.now().isoformat(),
            'answers': [
                {'question_id': self.q1.id, 'choice_ids': [self.c1_correct.id]},
            ]
        }
        self.client.post(f'/api/quizzes/{self.quiz.id}/submit/', payload, format='json')
        self.user.refresh_from_db()
        self.assertEqual(self.user.total_score, initial_score + 10)
