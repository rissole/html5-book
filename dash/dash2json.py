#! /usr/bin/python

import dash
import json
import sys

if __name__ == '__main__':
    with open(sys.argv[1], 'r') as f:
        str = f.read()

    print json.dumps(dash.parse(str))
