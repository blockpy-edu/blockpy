import os
import json

students = [
    ('Spring 2017', 'data_analysis/s17-students/'),
    ('Fall 2017', 'data_analysis/f17-students/'),
    ('Spring 2018', 'data_analysis/s18-students/')
]
for semester, path in students:
    data = []
    for file in os.listdir(path):
        if file.endswith('-post.json'):
            with open(os.path.join(path, file)) as inp:
                d = json.load(inp)
                for r in d:
                    r['semester'] = semester
                data += d
    with open('data_analysis/post-'+semester+'.json', 'w') as out:
        json.dump(data, out, indent=2)