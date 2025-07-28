# game/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.game_view, name='game_view'),
    path('state/', views.get_game_state, name='get_game_state'),
    path('process_choice/', views.process_choice, name='process_choice'),
    path('reset/', views.reset_game_view, name='reset_game'),  # Cambiado de reset_game/ a reset/
    path('afd_info/', views.get_afd_info, name='get_afd_info'),
    path('register/', views.register_view, name='register'),
]