from django.urls import path
from simulator import views

urlpatterns = [
    path("", views.home, name="home"),
    path("authorize/", views.authorize, name="authorize"),
    path("callback/", views.callback, name="callback"),
    path("result/", views.result, name="result"),
]
