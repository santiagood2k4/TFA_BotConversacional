from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.http import HttpResponse

def home_view(request):
    """Vista de inicio que redirige al login si no está autenticado"""
    if request.user.is_authenticated:
        return redirect('game_view')
    else:
        return redirect('login')

def logout_view(request):
    """Vista personalizada de logout que maneja GET y POST"""
    logout(request)
    return redirect('login')

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('game/', include('game.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('logout/', logout_view, name='logout'),
]
