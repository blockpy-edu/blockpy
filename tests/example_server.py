from flask import Flask
from flask import render_template, request, send_from_directory, jsonify
from pprint import pprint

app = Flask(__name__, template_folder='./')
app.config['DEBUG'] = True

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('./', path)
    
@app.route('/submit_grade', methods=["GET", "POST"])
@app.route('/submit_grade/', methods=["GET", "POST"])
def submit_grade():
    pprint(request.values)
    return jsonify({"success": True, "message": "It uploaded!"})


@app.route('/')
def index():
    return render_template('blockpy_new.html')

if __name__ == "__main__":
    app.run(port=8000)