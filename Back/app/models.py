from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class Funcionario(AbstractUser):
    CATEGORIA_FUNCIONARIO = [
        ('G', 'Gestor'),
        ('P', 'Professor')
    ]
    categoria = models.CharField(max_length=1, choices=CATEGORIA_FUNCIONARIO, default='P')
    ni = models.IntegerField(null=True, blank=True, unique=True, error_messages={
        'unique': "Número de identificação já está cadastrado."
    })
    nome = models.CharField(max_length=50)
    email = models.CharField(max_length=100)
    telefone = models.CharField(max_length=14, validators=[ RegexValidator(regex=r'^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$', message="Telefone inválido. Ex: (11)91234-5678")]
)
    dataNascimento = models.DateField(null=True, blank=True)
    dataContratacao = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.username   


class Disciplina(models.Model):
    nome = models.CharField(max_length=20)
    curso = models.CharField(max_length=20)
    cargaHoraria = models.IntegerField()
    descricao = models.CharField(max_length=100)
    professor = models.ForeignKey(Funcionario,on_delete=models.CASCADE, limit_choices_to={'categoria': 'P'})
    
    def __str__(self):
        return self.nome
    
class Sala(models.Model):
    nome = models.CharField(max_length=20)

    def __str__(self):
        return self.nome

class ReservaAmbiente(models.Model):
    PERIODOS = [
        ('Manhã', 'Manhã'),
        ('Tarde', 'Tarde'),
        ('Noite', 'Noite')
    ]
    dataInicio = models.DateField()
    dataTermino = models.DateField()
    periodo = models.CharField(max_length=10, choices=PERIODOS, null=True)
    salaReservada = models.ForeignKey(Sala, on_delete=models.CASCADE)
    professor = models.ForeignKey(Funcionario, on_delete=models.CASCADE)
    disciplina = models.ForeignKey(Disciplina, on_delete=models.CASCADE)

    def __str__(self):
        return self.periodo


    


