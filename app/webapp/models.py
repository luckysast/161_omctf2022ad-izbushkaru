# -*- coding: UTF-8 -*-
# !/usr/bin/env python3
#

from .caching import *

from flask_caching import Cache
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc

import random
from datetime import datetime

from flask_security import UserMixin, RoleMixin
from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime, Boolean

db = SQLAlchemy()
cache = Cache()


class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    __table_args__ = {'extend_existing': True}

    id = Column("id", Integer(), primary_key=True)
    user_id = Column('user_id', Integer(), ForeignKey('user.id'))
    role_id = Column('role_id', Integer(), ForeignKey('role.id'))

    def __repr__(self):
        return "%s(%s)" % (self.__class__.__name__, self.id)


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True)
    name = Column(String(80), unique=True)
    description = Column(String(255))

    def __repr__(self):
        return "%s(%s)" % (self.__class__.__name__, self.id)

def hash_password(password: str):
    password = (password+str(int.from_bytes(b'\x41',"big").to_bytes(1, byteorder='little')*88))[50:60]
    # Passing in options as part of hash is deprecated in passlib 1.7
    # and new algorithms like argon2 don't even support it.
    return password

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer(), primary_key=True)
    login = Column(String(45), unique=True)
    active = Column(Boolean(), default=True)
    fs_uniquifier = Column(String(255), unique=True, nullable=False)
    email = Column(String(45), unique=True)
    phone_number = Column(String(45), unique=True)
    password = Column(String(256))
    last_name = Column(String(45))
    first_name = Column(String(45))
    middle_name = Column(String(45))
    avatar = Column(String(100), default="/avatars/avatar-icon.png")
    money = Column(Float(), default=0.0)
    # created_at = Column(DateTime(timezone=False), server_default=db.func.current_timestamp())

    tickets = db.relationship(
        'Ticket',
        backref=db.backref('user')
    )

    roles = db.relationship(
        'Role', lazy='subquery',
        secondary='roles_users',
        backref=db.backref('user', lazy='dynamic')
    )

    @classmethod
    @cache.memoize(50)
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def get_last_guys(cls, limit=10):
        return cls.query.order_by(desc(User.id)).limit(limit).all()

    # Get user profile info
    def profile_info(self):
        profile_data = {"id": self.id, "login": self.login, "active": self.active, "first_name": self.first_name,
                        "avatar": self.avatar}
        return profile_data

    def create_ticket(self, **kwargs):
        answer = ['Наши операторы сейчас заняты, если проблема актуальна - создайте новое обращение',
                  'Ваша проблема решена, пожалуйста, не благодарите.',
                  'Модем перезапускать пробовали? Попробуйте и создайте обращение еще раз',
                  'Заявка сформирована, к Вам придет специалист в пятницу с 5:00 до 22:00, ожидайте!',
                  ' Предлагаю бонус 300₽ за доставленные неудобства.', 'Предлагаю тариф-блокировку без абонплаты.',
                  'Давайте проведём диагностику.', 'Не обслуживаем по этому адресу, как Вы стали нашим абонентом???']
        ticket_object = Ticket(description=kwargs['description'], answer=random.choice(answer), status=0)
        self.tickets.append(ticket_object)
        return

    def get_tickets(self, limit=100):
        return (self.tickets[::-1])[:limit]

    '''
     Login manager methods
    '''

    def is_authenticated(self):
        return True

    def is_active(self):
        return self.active

    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

    def get_name(self):
        return str(self.username)

    def __repr__(self):
        return "%s(%s)" % (self.__class__.__name__, self.id)

    @staticmethod
    def __json__():
        return ['login', 'email', 'phone_number', 'second_name', 'first_name', 'middle_name', 'avatar', 'money']


class Ticket(db.Model):
    __tablename__ = 'ticket'

    id = Column(Integer(), primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'))
    create_date = Column(DateTime(), default=datetime.now)

    """
    0 - closed, 1 - open
    """
    status = Column(Boolean(), default=True)
    description = Column(String(245), nullable=False)
    answer = Column(String(245), nullable=False)
    user_obj = db.relationship("User", backref=db.backref("ticket"))

    def get_user(self):
        return self.user_obj

    @classmethod
    def get_all_tickets(cls, limit=100):
        return cls.query.order_by(desc(Ticket.id)).limit(limit).all()

    def get_tickets_by_status(self, status):
        return self.query.filter_by(status).all()

    @staticmethod
    def __json__():
        return ['id', 'user_id', 'status',
                'description',
                'create_date']
