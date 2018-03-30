import pbs
import os
import sys

data_dir = 'data_analysis/{}-students/'.format(sys.argv[1])
all_files = os.listdir(data_dir)
path_suffix = '-post.json'

if len(sys.argv) >= 3 and sys.argv[2] == "-clear":
    for filename in all_files:
        post_filepath = filename[:-5] + path_suffix
        if filename.endswith(path_suffix):
            path = data_dir + filename
            print("Clearing out", path)
            os.remove(path)

# Make new files
with open('data_analysis/output.txt', 'a') as out:
    for filename in all_files:
        post_filepath = filename[:-5] + path_suffix
        if not filename.endswith(path_suffix) and post_filepath not in all_files:
            path = data_dir + filename
            print(path)
            pbs.Command('node')('server.js', path, '--max_old_space_size=4096', _out=out, _err_to_out=True)