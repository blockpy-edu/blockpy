import json
import time
from collections import OrderedDict

class StructuredEvent(object):
    def __init__(self, user, assignment, event, action, body):
        self.user = user
        self.assignment = assignment
        self.event = event
        self.action = action
        self.body = body
        self.time = time.time()

    def __str__(self):
        return json.dumps(OrderedDict([
            ('time', self.time),
            ('user', self.user),
            ('assignment', self.assignment),
            ('event', self.event),
            ('action', self.action),
            ('body', self.body),
        ]))
