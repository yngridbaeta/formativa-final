from django.urls import path
from .views import *

urlpatterns = [
    path('login/', LoginView.as_view()),

    path('sala/', SalaListCreateAPIView.as_view()),
    path('sala/<int:pk>', SalaRetrieveUpdateDestroyAPIView.as_view()),

    path('ambiente/', ReservaAmbienteListCreateAPIView.as_view()),
    path('ambiente/<int:pk>', ReservaAmbienteRetrieveUpdateDestroyAPIView.as_view()),

    path('disciplina/', DisciplinaListCreateAPIView.as_view()),
    path('disciplina/<int:pk>', DisciplinaRetrieveUpdateDestroyAPIView.as_view()),

    path('funcionario/', FuncionarioListCreateAPIView.as_view()),
    path('funcionario/<int:pk>', FuncionarioRetrieveUpdateDestroyAPIView.as_view()),
    path('usuarios/', VerificarUsernameAPIView.as_view()),

    

]
