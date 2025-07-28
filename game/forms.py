# game/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class CustomUserCreationForm(UserCreationForm):
    # Sobrescribimos o añadimos los campos con sus etiquetas y textos de ayuda en español

    username = forms.CharField(
        max_length=150,
        required=True,
        label='Nombre de Usuario', # Etiqueta en español
        help_text='Obligatorio. 150 caracteres o menos. Letras, dígitos y @/./+/-/_ solamente.' # Texto de ayuda en español
    )
    email = forms.EmailField(
        required=True,
        label='Correo Electrónico', # Etiqueta en español
        help_text='Introduce tu dirección de correo electrónico.'
    )
    first_name = forms.CharField(
        max_length=150,
        required=True,
        label='Nombre', # Etiqueta en español
        help_text='Introduce tu nombre.'
    )
    # Los campos de contraseña ('password' y 'password2') ya son manejados por UserCreationForm,
    # pero podemos sobrescribir sus etiquetas si queremos, aunque el help_text es más complejo
    # de traducir directamente sin usar i18n de Django o sobreescribir métodos.
    # Por ahora, nos enfocamos en username, email y first_name.

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'email', 'first_name',) + UserCreationForm.Meta.fields[1:]
        # Explicación de 'fields = ...':
        # UserCreationForm.Meta.fields por defecto es ('username', 'password', 'password2').
        # Al hacer UserCreationForm.Meta.fields[1:], obtenemos ('password', 'password2').
        # Luego concatenamos con nuestros campos específicos para mantener el orden deseado.


    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"]
        if commit:
            user.save()
        return user