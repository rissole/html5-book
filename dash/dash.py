import re

class DashParseException(Exception):
    pass

def parse(str):
    tree = list()
    level_stack = list()
    lines = str.split('\n')
    for num in xrange(len(lines)):
        line = lines[num]
        line = line.strip()
        if not line:
            continue
        match = re.match(r'^(\-*) (.*)', line)
        level = len(match.group(1)) if match else 0
        title = match.group(2) if match else line
        node = {'data': title, 'children': list()}

        # no stack -> start our level 0
        if not level_stack:
            if level != 0:
                raise DashParseException('Expected level 0 node at line %d, got level %d' % (num+1, level))
            tree.append(node)
            level_stack.append(node)
        else:
            if level > len(level_stack) - 1:
                # that's ok, we push a new level
                if level == len(level_stack):
                    level_stack[-1]['children'].append(node)
                    level_stack.append(node)
                # this is not ok: e.g. level 0 to 2
                else:
                    raise DashParseException('Expected at most level %d at line %d, got level %d' % (len(level_stack), num+1, level))
            elif level == len(level_stack) - 1:
                if len(level_stack) >= 2:
                    level_stack[-2]['children'].append(node)
                else:
                    tree.append(node)
                level_stack[-1] = node
            elif level < len(level_stack) - 1:
                level_stack = level_stack[:level+1]
                if len(level_stack) >= 2:
                    level_stack[-2]['children'].append(node)
                else:
                    tree.append(node)
                level_stack[-1] = node

    return tree

def serialize(tree):
    str = ''
    for node in tree:
        str += _serialize_node(node, 0) + '\n'
    return str.rstrip()

def _serialize_node(node, _level):
    str = ('%s %s\n' % ('-' * _level, node['data'])).lstrip()
    for child in node['children']:
        str += _serialize_node(child, _level+1)
    return str
