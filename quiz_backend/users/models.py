from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — always define this before the first migration.
    Extends Django's AbstractUser so we keep all built-in auth fields
    (username, email, password, is_staff, etc.) and add our own.
    """
    email      = models.EmailField(unique=True)
    avatar     = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio        = models.TextField(blank=True, default='')
    total_score = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the login field instead of username
    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username']   # still required for createsuperuser

    class Meta:
        ordering = ['-total_score']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    def add_score(self, points: int) -> None:
        """Atomically add points to the user's total score."""
        from django.db.models import F
        User.objects.filter(pk=self.pk).update(total_score=F('total_score') + points)
        self.refresh_from_db(fields=['total_score'])
