# -*- coding: UTF-8 -*-
# !/usr/bin/python3

# User api
from base64 import b64decode

from . import app
import os
from uuid import uuid4
from PIL import Image
import io
import functools
from flask import request, abort
from flask_jsontools import jsonapi
from flask_login import current_user, login_required
from flask_login import login_user
from flask_security.decorators import anonymous_user_required
from flask_security.decorators import roles_accepted
from flask_security.utils import verify_password
from jsonschema import validate, draft7_format_checker
from jsonschema.exceptions import ValidationError as JsonValidationError
from sqlalchemy import exc as sqlexc
from flask_security.utils import logout_user
from . import models, user_datastore, forms, avatars


def disabled(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        return abort(400)

    return wrapped


def limit_content_length(max_length):
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            cl = request.content_length
            if cl is not None and cl > max_length:
                abort(413)
            return f(*args, **kwargs)

        return wrapper

    return decorator


def save_avatar(image):
    #
    # Verify that image is valid
    #
    pil_image = Image.open(io.BytesIO(image))
    try:
        pil_image.verify()
    except Exception:
        return ""
    path = app.config['AVATARS_SAVE_PATH']
    filename = uuid4().hex + '_raw.png'
    try:
        image.save(os.path.join(path, filename))
    except AttributeError:
        image_on_disk = open(os.path.join(path, filename), "wb")
        image_on_disk.write(image)
        image_on_disk.close()
    return filename


# validators
UserLoginScheme = {
    "type": "object",
    "properties": {
        "login": {"type": "string"},
        "email": {
            "type": "string",
            "format": "email"
        },
        "password": {
            "type": "string"
        }
    },
    "oneOf": [
        {
            "required": [
                "email"
            ]
        },
        {
            "required": [
                "login"
            ]
        },
    ]
}

CreateUserProfile = {
    "type": "object",
    "properties": {
        "phone_number": {
            "type": "string",
            "pattern": "^(\+7|8)[- _]*\(?[- _]*(\d{3}[- _]*\)?([- _]*\d){7}|\d\d[- _]*\d\d[- _]*\)?([- _]*\d){6})$"
        },
        "roles": {
            "type": "array",
            "items": {"enum": ["appuser"]}
        },
        "login": {
            "type": "string"
        },
        "email": {
            "type": "string",
            "format": "email"
        },
        "first_name": {
            "type": "string"
        },
        "city": {
            "type": "string"
        },
        "password": {
            "type": "string"
        },
        "locale": {
            "type": "string",
            "items": {"enum": ["ru", "en"]}
        }
    },
    "required": [
        "roles",
        "login",
        "email",
        "first_name",
        "city",
        "password",
        "phone_number"
    ]
}

EditUserProfile = {
    "type": "object",
    "properties": {
        "first_name": {"type": "string"},
        "second_name": {"type": "string"},
        "middle_name": {"type": "string"},
        "avatar": {"type": "string"},
        "country": {"type": "string"},
        "city": {"type": "string"},
    }
}


# Login for api users
@app.route('/api/users/logout', methods=['GET'])
@login_required
@jsonapi
def appuser_logout():
    logout_user()
    return {"status_code": 200}


# Login for api users
@app.route('/api/users/login', methods=['POST'])
@anonymous_user_required
@jsonapi
def appuser_login():
    json_data = request.get_json()
    user: object = None
    try:
        validate(
            instance=json_data,
            schema=UserLoginScheme,
            format_checker=draft7_format_checker
        )
    except JsonValidationError as e:
        return {"status_code": 400, "message": e.message}, 400
    if 'login' in json_data:
        user: object = models.User.query.filter_by(login=json_data['login']).first()
    elif 'email' in json_data:
        user: object = models.User.query.filter_by(email=json_data['email']).first()
    if user is not None:
        if not verify_password(models.hash_password(json_data['password']), user.password):
            return {"status_code": 400, "message": u"Incorrect login or password"}, 400
        login_user(user)
        return {"status_code": 200, "message": u"Login success", "data": {"auth-token": user.get_auth_token()}}, 200
    else:
        return {"status_code": 404, "message": u"User not found"}, 404


# Register for api users
@app.route('/api/users/register', methods=['POST'])
@disabled
@anonymous_user_required
@jsonapi
def perform_register_for_mobile_users():
    json_data = request.get_json()
    try:
        validate(
            instance=json_data,
            schema=CreateUserProfile,
            format_checker=draft7_format_checker
        )
    except JsonValidationError as e:
        return {"status_code": 400, "message": e.message}, 400
    #
    # Check unique field for existence in database
    #
    if models.User.query.filter_by(login=json_data['login']).first():
        return {"status_code": 400, "message": "This login already registered"}, 400
    if models.User.query.filter_by(email=json_data['email']).first():
        return {"status_code": 400, "message": "This email already registered"}, 400
    if models.User.query.filter_by(phone_number=json_data['phone_number']).first():
        return {"status_code": 400, "message": "This phone_number already registered"}, 400
    json_data['password'] = models.hash_password(json_data['password'])
    try:
        user = user_datastore.create_user(**json_data, avatar="/avatars/avatar-icon.png")
    except sqlexc.SQLAlchemyError as e:
        return {"status_code": 500, "message": u"Database error: " + str(e)}, 500
    user_datastore.commit()
    #login_user(user)
    return {"status_code": 200, "message": u"You have successfully registered",
            "data": {"auth-token": user.get_auth_token()}}, 200


# Get user own data
@app.route('/api/profile', methods=['GET'])
@roles_accepted('subscriber')
@login_required
@jsonapi
def user_profile():
    try:
        user_info = models.User.query.filter_by(id=current_user.id).first()
    except sqlexc.SQLAlchemyError:
        return {"status_code": 500, "message": u"Database error"}, 500
    return {"status_code": 200, "message": u"Here you are!", "data": user_info}, 200


# Edit user profile
@app.route('/api/profile/edit', methods=['POST'])
@limit_content_length(4 * 1024 * 1024)
@roles_accepted('subscriber')
@login_required
@jsonapi
def edit_user_profile():
    json_data = request.get_json()
    try:
        validate(
            instance=json_data,
            schema=EditUserProfile,
            format_checker=draft7_format_checker
        )
    except JsonValidationError as e:
        return {"status_code": 400, "message": e.message}, 400
    image_url = ""
    if 'avatar' in json_data:
        try:
            avatar_data = b64decode(json_data["avatar"])
            image_url = save_avatar(avatar_data)
        except Exception:
            avatar_data = b''
    if image_url != "":
        image_url = "avatars/" + image_url

    try:
        if 'first_name' in json_data:
            current_user.first_name = json_data["first_name"]
        if 'second_name' in json_data:
            current_user.second_name = json_data["second_name"]
        if 'middle_name' in json_data:
            current_user.middle_name = json_data["middle_name"]
        if 'city' in json_data:
            current_user.city = json_data["city"]
        if image_url:
            current_user.avatar = image_url
        user_datastore.commit()
    except sqlexc.SQLAlchemyError:
        return {"status_code": 500, "message": u"Database error"}, 500
    return {"status_code": 200, "message": u"Profile successfully edited"}, 200


# Show last users
@app.route('/api/users/last', methods=['GET'])
@jsonapi
def get_users_last():
    profiles_list = []
    try:
        users_objects = models.User.get_last_guys()
        for el in users_objects:
                profiles_list.append(el.profile_info())
    except sqlexc.SQLAlchemyError as e:
        return {"status_code": 500, "message": u"Database error" + str(e)}, 500
    return {"status_code": 200, "message": u"Here you are!", "data": profiles_list}, 200

# Show users
@app.route('/api/users', methods=['GET'])
@app.route('/api/users/<int:page_>', methods=['GET'])
@roles_accepted('subscriber')
@login_required
@jsonapi
def get_users(page_=1):
    profiles_list = []
    items_per_page = request.args.get('limit', default=10, type=int)
    try:
        users_objects = models.User.query.filter_by(active=True)
        paginate = users_objects.paginate(
            int(page_), items_per_page, False, app.config['PAGINATION_MAX_ITEMS_PER_PAGE'])
        users = paginate.items
        total_pages = paginate.pages  # - count of pages
        next_page_num = paginate.next_num  # - number of next page
        has_next = paginate.has_next  # - True, if a next page exists
        for el in users:
            profiles_list.append(el.profile_info())
    except sqlexc.SQLAlchemyError as e:
        return {"status_code": 500, "message": u"Database error" + str(e)}, 500
    return {"status_code": 200, "message": u"Here you are!", "data": profiles_list,
            "meta": {"total_pages": total_pages, "has_next": has_next, "next_page_num": next_page_num}}, 200


# Get user into
@app.route('/api/users/user/<int:id_>', methods=['GET'])
@roles_accepted('subscriber')
@login_required
@jsonapi
def get_user_info(id_):
    try:
        user_info = models.User.query.filter_by(id=id_).first()
        if user_info is None:
            return {"status_code": 404, "message": u"Specified user doesn't exists"}, 404
    except sqlexc.SQLAlchemyError:
        return {"status_code": 500, "message": u"Database error"}, 500
    return {"status_code": 200, "message": u"Here you are!", "data": user_info.profile_info()}, 200


# Register
@app.route('/register', methods=['POST'])
@anonymous_user_required
@jsonapi
def perform_register():
    register_user_form = forms.RegisterForm()
    if register_user_form.validate_on_submit():
        data_for_db = register_user_form.data
        data_for_db['password'] = models.hash_password(data_for_db['password'])
        data_for_db.pop('password_confirm', None)
        try:
            user = user_datastore.create_user(**data_for_db)
        except sqlexc.SQLAlchemyError:
            return {"response": {"message": u"Database error"}}, 500

        try:
            default_role = user_datastore.find_role("subscriber")
            user_datastore.add_role_to_user(user, default_role)
            user_datastore.commit()
            #login_user(user)
            return {"response": {"status_code": 200, "message": u"You have successfully registered"}}, 200
        except sqlexc.SQLAlchemyError:
            return {"response": {"message": u"Database error"}}, 500
    else:
        return {"response": {"errors": register_user_form.errors}}, 400


@app.route('/api/profile/edit-profile', methods=['POST'])
@app.route('/profile/edit-profile', methods=['POST'])
@roles_accepted('admin', 'roles_accepted')
@login_required
@jsonapi
def edit_profile():
    edit_profile_form = forms.EditProfileInfo()
    if edit_profile_form.validate_on_submit():
        #
        # Update profile info
        #
        try:
            # if edit_profile_form.avatar.data != '':
            #    current_user.avatar = edit_profile_form.avatar.data
            if edit_profile_form.phone_number.data != '':
                current_user.phone_number = edit_profile_form.phone_number.data
            if edit_profile_form.last_name.data != '':
                current_user.second_name = edit_profile_form.last_name.data
            if edit_profile_form.middle_name.data != '':
                current_user.middle_name = edit_profile_form.middle_name.data
            if edit_profile_form.first_name.data != '':
                current_user.first_name = edit_profile_form.first_name.data
            user_datastore.commit()
        except sqlexc.SQLAlchemyError:
            return {"response": {"message": u"Database error"}}, 500
        return {"response": {"message": u"Profile successfully edited"}}, 200
    else:
        return {"response": {"errors": edit_profile_form.errors}}, 400


@app.route('/api/uploadavatar', methods=['POST'])
@app.route('/uploadavatar', methods=['POST'])
@login_required
@jsonapi
def upload():
    avatar_form = forms.UploadAvatarForm()
    if avatar_form.validate_on_submit():
        raw_filename = avatars.save_avatar(avatar_form.image.data)
        current_user.avatar = "avatars/" + raw_filename
        user_datastore.commit()
        return {"response": {"new_avatar": 'avatars/' + raw_filename}}, 200
    else:
        return {"response": {"errors": avatar_form.errors}}, 400


@app.route('/api/ticket/get_all', methods=['GET'])
@app.route('/profile/ticket/get_all', methods=['GET'])
@login_required
@jsonapi
def get_tickets():
    try:
        if current_user.tickets is None:
            return {"status_code": 404, "message": u"No tickets!"}, 404
    except sqlexc.SQLAlchemyError:
        return {"status_code": 500, "message": u"Database error"}, 500
    return {"status_code": 200, "message": u"Here you are!", "data": current_user.tickets }, 200


@app.route('/api/ticket/create', methods=['POST'])
@app.route('/profile/ticket/create', methods=['POST'])
@login_required
@jsonapi
def create_ticket():
    create_ticket_form = forms.CreateTicketForm()
    if create_ticket_form.validate_on_submit():
        # Create ticket for current user
        try:
            data_for_db = create_ticket_form.data
            # нам плевать че он там думает, мы же крутые
            data_for_db.pop('additional_info', None)
            current_user.create_ticket(**data_for_db)
            user_datastore.commit()
        except sqlexc.SQLAlchemyError:
            return {"response": {"message": u"Database error"}}, 500
        return {"response": {"message": u"Ticket created!"}}, 200
    else:
        return {"response": {"errors": create_ticket_form.errors}}, 400
