# -*- coding: UTF-8 -*-
# !/usr/bin/env python3

from flask import (g, redirect, render_template, request,
                   send_from_directory)
from flask_login import current_user, login_required
from flask_security.decorators import anonymous_user_required, roles_accepted

from . import app, forms, models


@app.login_manager.user_loader
def load_user(id_):
    return models.User.query.get(int(id_))


@app.before_request
def before_request():
    g.user = current_user
    ua = request.headers.get('User-Agent')
    if ua is not None:
        if 'apiuser' in ua:
            g.login_via_header = True


@app.route('/index')
@app.route('/')
def index():
    if g.user.is_authenticated:
        return redirect("/profile")
    else:
        last_registered_brothers=models.User.get_last_guys()
        # Render Welcome page
        return render_template(
            'index.html',
            super_chelicks=last_registered_brothers
        )


@app.route('/register', methods=['GET'])
@anonymous_user_required
def render_register():
    register_user_form = forms.RegisterForm()
    if request.method == 'GET':
        return render_template('security/register_user.html', register_user_form=register_user_form)


# Serve avatar name
@app.route('/avatars/<path:filename>', methods=['GET'])
def get_avatar(filename):
    return send_from_directory(app.config['AVATARS_SAVE_PATH'], filename)


@app.route('/reset', methods=['GET'])
def reset():
    return 'Функцию не завезли :D'


@app.route('/profile', methods=['GET'])
@login_required
@roles_accepted('subscriber', 'admin')
def profile():
    avatar_form = forms.UploadAvatarForm()
    edit_profile_form = forms.EditProfileInfo()
    make_ticket = forms.CreateTicketForm()

    if request.method == 'GET':
        if 'admin' in current_user.roles:
            all_users = models.User.get_all()
            all_subscribers = [x for x in all_users if 'subscriber' in x.roles]

            return render_template(
                'profile/profile.html',
                avatar_form=avatar_form,
                edit_profile_form=edit_profile_form,
                allsubscribers=all_subscribers,
                alltickets=models.Ticket.get_all_tickets(limit=100)
            )
        else:
            return render_template(
                'profile/profile.html',
                avatar_form=avatar_form,
                edit_profile_form=edit_profile_form,
                make_ticket=make_ticket
            )


"""
 Wrappers for errors
 render sexy pages for specific error codes
"""


@app.errorhandler(400)
def bad_request(e):
    return render_template('errors/400.html')


@app.errorhandler(404)
def not_found(e):
    return render_template('errors/404.html')


@app.errorhandler(405)
def bad_request(e):
    return render_template('errors/405.html')


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('errors/500.html')
