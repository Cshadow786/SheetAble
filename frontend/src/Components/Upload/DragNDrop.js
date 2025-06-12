import React from "react";

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";

// Import the plugin code
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

// Redux Imports
import PropTypes from "prop-types"; // type checks component props
import { connect } from "react-redux"; // imports "connect from react-redux to connect component to redux
import { uploadSheet } from "../../Redux/Actions/dataActions";  // imports an action creator uploadsheet from your redux actions

registerPlugin(FilePondPluginFileValidateType); //registers the file type validation plugin with filepong globally

function DragNDrop({ giveModalData }) {
  //const [files, setFiles] = useState(undefined)

  const uploadFinish = (fileItems) => { //how to handle files after they are added/removed
  const file = fileItems[0].file;
  const fileName = file.name.toLowerCase();  // grabs file and standardizes name

  if (fileName.endsWith(".abc")) {  // checks if abc file type
    // Handle .abc file (send to backend for conversion)
    console.log("Detected ABC file. Sending for conversion...");  // logs the file type is noticed

    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/convert-abc", {  // sends the abc file to convert-abc
      method: "POST",
      body: formData,
    })
      .then((res) => res.blob())  // Converts response into a binary large object representing the abc turned into PDF file
      .then((pdfBlob) => {
        const pdfFile = new File([pdfBlob], file.name.replace(".abc", ".pdf"), {  // renames the file end to .PDF
          type: "application/pdf",
        });
        giveModalData(pdfFile); // Passes converted PDF to parent
      })
      .catch((err) => console.error("ABC conversion failed", err));  // catches error
  } else {
    // Already a PDF, normal process
    giveModalData(file);
  }
};


  const removeFile = () => {  // removes file from handler
    giveModalData(undefined);
  };

  return (
    <div className="upload-container">
      <FilePond
        onupdatefiles={(files) => {
          uploadFinish(files);  // makes sures to remove file when done
        }}
        onremovefile={removeFile}  // prevents more the one file at once
        allowMultiple={false}
        server={{
          process: (
            fieldName,
            file,
            metadata,
            load,
            error,
            progress,
            abort,
            transfer,
            options
          ) => {
            load();
          },
        }}
        maxFiles={1}
        name="files"
        labelIdle='Drag & Drop your file or <span class="filepond--label-action">Browse</span>'
        credits={false}
        allowFileTypeValidation={true}
        acceptedFileTypes={["application/pdf", "text/plain", "text/*", "application/abc"]}  // limits the file type of acceptable files
      />
    </div>
  );
}

DragNDrop.propTypes = {
  uploadSheet: PropTypes.func.isRequired,
};

const mapActionsToProps = {
  uploadSheet,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapActionsToProps)(DragNDrop);
