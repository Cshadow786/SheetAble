from flask import Flask, request, send_file, after_this_request
import os   # for file deletion
import subprocess   # running shell comands from pythoon
import tempfile     # creating temporary directories
from pdf2image import convert_from_path     # convering PDFs to imagies
from werkzeug.utils import secure_filename      # sanitize filenames for security

app = Flask(__name__)

@app.route("/createthumbnail", methods=['POST'])    # when "POST" request is sent the index function is executed
def index():
    f = request.files['file']   # retrives the file named "file"
    name = request.form['name']     # gets the name "name from the data
    pdf_path = f"{name}.pdf"        # Defines the path for PDF and PNG
    image_path = f"{name}.png"
    f.save(pdf_path)    # Saves the uploaded file to disk with the filename of the pdf path

    createThumbnail(pdf_path, image_path)   # Calls the helper function to generate a thumbnail for the saved PDF

    @after_this_request
    def cleanup(response):  # cleans the PDF and PNG from the disk to free space and prevent leaks as well as catch file not found errors
        for path in [pdf_path, image_path]:
            try:
                os.remove(path)
            except FileNotFoundError:
                pass
        return response

    return send_file(image_path, download_name='thumbnail.png', mimetype='image/png')


def createThumbnail(pdf_path, image_path):      # resizes the PDF image for stardarized reference
    scale_factor = 2.5
    pages = convert_from_path(pdf_path, single_file=True, size=(152 * scale_factor, 214 * scale_factor))
    pages[0].save(image_path, 'PNG')


@app.route("/uploadabc", methods=['POST'])  # Defines a rout for uploadsbc that accepts POST requests
def upload_abc():       # upload_abc() will be run when the endpoint receives a POST
    file = request.files['file']        # retrieves the uploaded file under the form field file, prevents malicious paths, extracts base file name
    filename = secure_filename(file.filename)
    base_name = os.path.splitext(filename)[0]

    with tempfile.TemporaryDirectory() as tempdir:      # Temp directory
        abc_path = os.path.join(tempdir, f"{base_name}.abc")
        svg_path = os.path.join(tempdir, f"{base_name}.svg")
        pdf_path = os.path.join(tempdir, f"{base_name}.pdf")

        file.save(abc_path) # saves the .abc file to the temp directory

        try:
            subprocess.run(['abcm2ps', abc_path, '-O', svg_path], check=True)   # runs these shell comands abc-> svg
            subprocess.run(['inkscape', '-D', svg_path, '-o', pdf_path], check=True) # svg -> pdf
        except subprocess.CalledProcessError as e:
            return f"Conversion failed: {e}", 500

        return send_file(pdf_path, download_name=f'{base_name}.pdf', mimetype='application/pdf')
