import os

'''
 Flask tunning
'''
JSON_SORT_KEYS = False
JSONIFY_PRETTYPRINT_REGULAR = False

'''
 System variables
'''
WTF_CSRF_CHECK_DEFAULT = False
WTF_CSRF_ENABLED = False
SQLALCHEMY_ECHO = False
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECURITY_REGISTERABLE = False
SECURITY_PASSWORD_HASH = 'bcrypt'
SECURITY_CONFIRMABLE = False
SECURITY_RECOVERABLE = False
SECURITY_USE_VERIFY_PASSWORD_CACHE = True
SECURITY_VERIFY_HASH_CACHE_MAX_SIZE = 1000
SECURITY_VERIFY_HASH_CACHE_TTL = 3600
SECURITY_SEND_REGISTER_EMAIL = False
SECURITY_POST_LOGIN_VIEW = '/profile'
PAGINATION_MAX_ITEMS_PER_PAGE = 100

'''
 Avatars
'''
AVATARS_SAVE_PATH = os.path.join(os.getcwd(), 'webapp', 'static', 'uploads', 'avatars')

'''
 Media save path
'''
MEDIA_SAVE_PATH = os.path.join(os.getcwd(), 'webapp', 'static', 'uploads', 'media')

'''
 Flask cache
'''
#CACHE_TYPE = 'redis'
#CACHE_REDIS_HOST = 'izbushka_redis_db'


'''
 User private variables
 You should set them in instance/config.py
'''
SECRET_KEY = 'nobodyCrackThisSite'
SECURITY_PASSWORD_SALT = 'IgKG8oxLr9AbIu1lOmjDlMEZ0e7mFu/6tFN1/TrASOYhlmZbvn8khTfJx5Z3Jvl+4y0SnyGtTq+V/Kr+'
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(os.getcwd(), 'webapp', 'app.db')
LANGUAGES = ['ru_RU', 'ru']
