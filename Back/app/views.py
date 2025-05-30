from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import FuncionarioSerializer, DisciplinaSerializer, LoginSerializer, SalaSerializer, ReservaAmbienteSerializer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.views import APIView
from .models import Funcionario, Sala, ReservaAmbiente, Disciplina
from .permissions import *
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status




class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

# class ListaProfessoresAPIView(ListAPIView):
#     serializer_class = FuncionarioSerializer

#     def get_queryset(self):
#         return Funcionario.objects.filter(categoria='P')
    
# class ListaSalasAPIView(ListAPIView):
#     serializer_class = SalaSerializer

#     def get_queryset(self):
#         return Sala.objects.all()
    
class FuncionarioListCreateAPIView(ListCreateAPIView):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsGestor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.categoria == 'P':  
            return Funcionario.objects.filter(id=user.id)
        elif user.categoria == 'G':
            return Funcionario.objects.all()
        else:
            return Funcionario.objects.none()

class FuncionarioRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer
    permission_classes = [IsGestor]
    lookup_field = 'pk'

class VerificarUsernameAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.query_params.get('username')
        existe = Funcionario.objects.filter(username=username).exists()
        return Response({'existe': existe})
    
class DisciplinaListCreateAPIView(ListCreateAPIView):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsGestor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.categoria == 'P':  
            return Disciplina.objects.filter(professor=user)
        elif user.categoria == 'G':
            return Disciplina.objects.all()
        else:
            return Disciplina.objects.none()
    
    
class DisciplinaRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = DisciplinaSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        user = self.request.user
        if user.categoria == 'P':
            return Disciplina.objects.filter(professor=user)
        return Disciplina.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsGestor()]
    
class SalaListCreateAPIView(ListCreateAPIView):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsGestor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.categoria == 'G':
            return Sala.objects.all()
        else:
            return Sala.objects.none()

class SalaRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return[permissions.IsAuthenticated()]
        return [IsGestor()]


class ReservaAmbienteListCreateAPIView(ListCreateAPIView):
    queryset = ReservaAmbiente.objects.all()
    serializer_class = ReservaAmbienteSerializer

    def get_queryset(self):
        user = self.request.user
        if user.categoria == 'P':
            return ReservaAmbiente.objects.filter(professor=user)
        return ReservaAmbiente.objects.all()

    def create(self, request, *args, **kwargs):
        data_inicio = request.data.get('dataInicio')
        data_termino = request.data.get('dataTermino')
        sala_id = request.data.get('salaReservada')
        periodo = request.data.get('periodo')

        conflito = ReservaAmbiente.objects.filter(
            salaReservada_id=sala_id,
            periodo=periodo,
            dataInicio__lte=data_termino,
            dataTermino__gte=data_inicio
        ).exists()

        if conflito:
            return Response(
                {"erro": "Esta sala já está reservada nesse período."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)


class ReservaAmbienteRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = ReservaAmbienteSerializer
    queryset = ReservaAmbiente.objects.all()


    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsGestor()]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        data_inicio = request.data.get('dataInicio')
        data_termino = request.data.get('dataTermino')
        sala_id = request.data.get('salaReservada')
        periodo = request.data.get('periodo')

        conflito = ReservaAmbiente.objects.filter(
            salaReservada_id=sala_id,
            periodo=periodo,
            dataInicio__lte=data_termino,
            dataTermino__gte=data_inicio
        ).exclude(id=instance.id).exists()

        if conflito:
            return Response(
                {"erro": "Esta sala já está reservada nesse período."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)