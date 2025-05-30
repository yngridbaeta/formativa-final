from django.contrib import admin
from .models import Funcionario, Disciplina, Sala, ReservaAmbiente
from django.contrib.auth.admin import UserAdmin

class UsuarioAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Adicionais', {'fields': ('categoria', 'ni', 'dataNascimento', 'dataContratacao')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("ABC", {'fields': ('categoria',)}),
    )

admin.site.register(Funcionario, UsuarioAdmin)
admin.site.register(Disciplina)
admin.site.register(Sala)
admin.site.register(ReservaAmbiente)