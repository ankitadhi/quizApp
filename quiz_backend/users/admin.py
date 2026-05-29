from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ['email', 'username', 'total_score', 'is_staff', 'created_at']
    list_filter   = ['is_staff', 'is_active']
    search_fields = ['email', 'username']
    ordering      = ['-total_score']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Quiz Profile', {'fields': ('bio', 'avatar', 'total_score')}),
    )
