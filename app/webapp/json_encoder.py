# -*- coding: UTF-8 -*-
# !/usr/bin/env python3

from flask_script._compat import text_type
from sqlalchemy.ext.declarative import DeclarativeMeta
from flask import json
from speaklater import _LazyString
import datetime


class AlchemyEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, _LazyString):
            return text_type(o)
        if isinstance(o.__class__, DeclarativeMeta):
            data = {}
            fields = o.__json__() if hasattr(o, '__json__') else dir(o)
            for field in [f for f in fields if not f.startswith('_') and f not in ['metadata', 'query', 'query_class']]:
                value = o.__getattribute__(field)
                try:
                    json.dumps(value)
                    if isinstance(value, datetime.datetime):
                        data[field] = value.timestamp()
                    else:
                        data[field] = value
                except TypeError:
                    data[field] = None
            return data
        return json.JSONEncoder.default(self, o)
