from rest_framework import serializers
from .models import Funcionario, Disciplina, Sala, ReservaAmbiente
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator


# FUNCIONÁRIO
class FuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcionario
        fields = [
            'id', 'username', 'password', 'nome', 'ni', 'categoria',
            'email', 'telefone', 'dataNascimento', 'dataContratacao'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        ni = attrs.get('ni')
        password = attrs.get('password')

        # Validação do NI
        if ni is not None:
            qs = Funcionario.objects.filter(ni=ni)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"ni": "Número de identificação (NI) já está cadastrado."})

            if not isinstance(ni, int):
                raise serializers.ValidationError({"ni": "O número de identificação deve ser um número inteiro."})

        # Validação da senha
        if not self.instance and password:
            if len(password) < 6:
                raise serializers.ValidationError({"password": "A senha deve conter no mínimo 6 caracteres."})
        elif self.instance and password: 
            if len(password) < 6:
                raise serializers.ValidationError({"password": "A nova senha deve conter no mínimo 6 caracteres."})

        return attrs


    def create(self, validated_data):
        return Funcionario.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# DISCIPLINA
class DisciplinaSerializer(serializers.ModelSerializer):
    professor = serializers.PrimaryKeyRelatedField(queryset=Funcionario.objects.filter(categoria='P'))
    professor_nome = serializers.StringRelatedField(source='professor', read_only=True)
    nome = serializers.CharField(
        validators=[UniqueValidator(queryset=Disciplina.objects.all(), message="Já existe uma disciplina com este nome.")]
    )

    class Meta:
        model = Disciplina
        fields = ['id', 'nome', 'curso', 'cargaHoraria', 'descricao', 'professor', 'professor_nome']

    

# SALA
class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = ['id', 'nome']

    def validate_nome(self, value):
        qs = Sala.objects.filter(nome__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)  # exclui a própria sala no update
        if qs.exists():
            raise serializers.ValidationError("Já existe uma sala cadastrada com esse nome.")
        return value


# RESERVA DE AMBIENTE
class ReservaAmbienteSerializer(serializers.ModelSerializer):
    salaReservada = serializers.PrimaryKeyRelatedField(queryset=Sala.objects.all())
    professor = serializers.PrimaryKeyRelatedField(queryset=Funcionario.objects.filter(categoria='P'))
    disciplina = serializers.PrimaryKeyRelatedField(queryset=Disciplina.objects.all())
    salaReservada_nome = serializers.StringRelatedField(source='salaReservada', read_only=True)
    professor_nome = serializers.StringRelatedField(source='professor', read_only=True)
    disciplina_nome = serializers.StringRelatedField(source='disciplina', read_only=True)

    class Meta:
        model = ReservaAmbiente
        fields = [
            'id', 'dataInicio', 'dataTermino', 'periodo',
            'salaReservada', 'salaReservada_nome',
            'professor', 'professor_nome', 'disciplina', 'disciplina_nome',
        ]

    def validate(self, data):
        professor_id = self.initial_data.get('professor')
        disciplina_id = self.initial_data.get('disciplina')

        try:
            disciplina = Disciplina.objects.get(id=disciplina_id)
        except Disciplina.DoesNotExist:
            raise serializers.ValidationError("Disciplina não encontrada.")

        if str(disciplina.professor.id) != str(professor_id):
            raise serializers.ValidationError({
                "professor": "Este professor não leciona a disciplina selecionada."
            })
        return data


# LOGIN JWT
class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['usuario'] = {
            'username': self.user.username,
            'categoria': self.user.categoria
        }
        return data
