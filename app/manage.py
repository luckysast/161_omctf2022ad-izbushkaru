# manage.py

from flask_script import Manager
from webapp import app, models

manager = Manager(app)

if __name__ == "__main__":
    manager.run()
