import phonenumbers
from flask import g
from flask_security.forms import LoginForm
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import StringField, PasswordField, ValidationError, EmailField
from wtforms.validators import DataRequired, InputRequired, EqualTo, Email, Length, Optional
from flask_security.forms import LoginForm
from future.utils import iteritems

from . import models


# validators
class LoginValidator(object):
    def __init__(self, message=None):
        if not message:
            message = u'Такое имя пользователя уже существует!'
        self.message = message

    def __call__(self, form, field):
        login_not_unique = models.User.query.filter_by(login=field.data).first() is not None

        if login_not_unique:
            raise ValidationError(self.message)


class EmailValidator(object):
    def __init__(self, message=None):
        if not message:
            message = u'Такой email адрес уже задействован!'
        self.message = message

    def __call__(self, form, field):
        email_not_unique = models.User.query.filter_by(email=field.data).first() is not None

        if email_not_unique:
            raise ValidationError(self.message)


class PhoneValidator(object):
    def __init__(self, message=None, message2=None):
        if not message:
            message = u'Учетная запись с таким номером уже существует!'
        if not message2:
            message2 = u'Неверный номер телефона!'
        self.message = message
        self.message2 = message2

    def __call__(self, form, field):
        phone_not_unique = models.User.query.filter_by(
            phone_number=field.data
        ).first() is not None

        if g.user.is_anonymous:
            phone_owned_by_user = False
        else:
            phone_owned_by_user = g.user.phone_number == field.data

        if phone_not_unique and not phone_owned_by_user:
            raise ValidationError(self.message)
        if len(field.data) > 12 or len(field.data) < 5:
            raise ValidationError(self.message2)
        try:
            input_number = phonenumbers.parse(field.data)
            if not (phonenumbers.is_valid_number(input_number)):
                raise ValidationError(self.message2)
        except ValidationError:
            input_number = phonenumbers.parse("+7" + field.data)
            if not (phonenumbers.is_valid_number(input_number)):
                raise ValidationError(self.message2)
        except phonenumbers.NumberParseException:
            raise ValidationError(self.message2)


class RegisterForm(FlaskForm):
    last_name = StringField('Фамилия', [InputRequired()])
    first_name = StringField('Имя', [InputRequired()])
    middle_name = StringField('Отчество', [InputRequired()])
    login = StringField(u'Имя пользователя', [InputRequired(), Length(min=6, max=15), LoginValidator()])
    email = EmailField(u'Email', [DataRequired(), Email(), EmailValidator()])
    phone_number = StringField(u'Номер телефона', [InputRequired()])
    password = PasswordField(
        u'Пароль',
        [InputRequired(), Length(min=8),
         EqualTo('password_confirm', message=u'Пароли должны совпадать!')])
    password_confirm = PasswordField(u'Потверждение пароля', [InputRequired()])


class EditProfileInfo(FlaskForm):
    # avatar = HiddenField('Avatar URL', [Optional()])
    phone_number = StringField(u'Номер телефона', [Optional()])
    last_name = StringField(u'Фамилия', [Optional(), Length(max=45)])
    first_name = StringField(u'Имя', [Optional(), Length(max=45)])
    middle_name = StringField(u'Отчество', [Optional(), Length(max=45)])


class ExtendedLoginForm(LoginForm):
    email = StringField('Email', [InputRequired(), Length(max=40)])
    password = PasswordField('Пароль', [InputRequired()])


class CreateTicketForm(FlaskForm):
    description = StringField('Содержание', [InputRequired(), Length(max=1000)])
    additional_info = StringField('Дополнительные сведения', [InputRequired(), Length(max=1000)])


class UploadAvatarForm(FlaskForm):
    image = FileField(u'Upload avatar (<=6M)', validators=[
        FileRequired(),
        FileAllowed(['jpg', 'png', 'jpeg'], u'The file format should be .jpg or .png.')
    ])


class CustomLoginForm(LoginForm):
    def validate(self):
        self.password.data = models.hash_password(self.password.data)
        response = super(CustomLoginForm, self).validate()

        return response
