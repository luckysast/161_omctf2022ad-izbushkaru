# -*- coding: UTF-8 -*-
# !/usr/bin/env python3

from flask import Flask, g
from flask.sessions import SecureCookieSessionInterface
from flask_avatars import Avatars
from flask_cors import CORS
from flask_login.login_manager import user_loaded_from_header
from flask_script import Manager
from flask_security import Security, SQLAlchemyUserDatastore
from flask_migrate import Migrate
from jinja2 import Environment

from .json_encoder import AlchemyEncoder
from .saferproxyfix import SaferProxyFix

__version__ = '1.0'
__author__ = 'Savva Mitrofanov'
__comment__ = 'Я железячник и ненавижу веб-разработку. Смиритесь с этим'

app = Flask(__name__.split('.')[0])

# Init Jinja
Jinja2 = Environment()

# Init CORS
CORS(app)

# Init json encoder
app.json_encoder = AlchemyEncoder

# Init manager
manager = Manager(app)
app.wsgi_app = SaferProxyFix(app.wsgi_app)

# Load app config from file
app.config.from_pyfile('config.py')

# Init app db
from . import models

# Init flask caching
models.cache.init_app(app)

migrate = Migrate()

models.db.init_app(app)
migrate.init_app(app, models.db)
with app.app_context():
    models.db.create_all()
    models.db.session.commit()

# Setup avatars
avatars = Avatars(app)

# Setup Flask-Security
user_datastore = SQLAlchemyUserDatastore(
    models.db,
    models.User,
    models.Role
)

with app.app_context():
    if models.Role.query.first() is None:
        user_datastore.create_role(name='admin')
        user_datastore.create_role(name='subscriber')
        user_datastore.commit()

    if models.User.query.first() is None:
        user_datastore.create_user(
            login="admin",
            roles=['admin'],
            email="admin@izbushka.ru",
            password=models.hash_password("admin"),
            phone_number="89000000000",
            avatar="/avatars/avatar-icon.png"
        )
        user_datastore.commit()


# Disable session cookie for api
@user_loaded_from_header.connect
def user_loaded_from_header(self, user=None):
    g.login_via_header = True


class CustomSessionInterface(SecureCookieSessionInterface):
    """Disable default cookie generation."""

    def should_set_cookie(self, *args, **kwargs):
        if g.get('login_via_header'):
            return False
        else:
            return True

    """Prevent creating session from API requests."""

    def save_session(self, *args, **kwargs):
        if g.get('login_via_header'):
            g.login_via_header = False
            return
        return super(CustomSessionInterface, self).save_session(*args,
                                                                **kwargs)


from . import forms

security = Security(
    app,
    user_datastore,
    login_form=forms.CustomLoginForm
)

app.session_interface = CustomSessionInterface()

from . import models

from . import views
from . import api

