import React, { useState } from 'react';
import './Uploader.css'; 
import addVideo from '../../assets/icons/addimage.svg';

const ImageUploader =  () => {
  const [fileName,setFileName] = useState('');
  const [file,setFile] = useState(null);
  const handleChange = ({target:{files}}) => {
    if (files[0]) {
      setFileName(files[0].name);
      setFile(files[0]);
    }
  };
  let preview;
  if (file) {
    preview = <img src={URL.createObjectURL(file)} alt={fileName} />;
  } else {
    preview = <img src={addVideo} alt="Upload Video"  />;
  }

  return (
    <div>
      <form className="formBox" onClick= {()=>document.querySelector('input').click()}>
        <input type="file" accept=".jpeg jpg .png" onChange={handleChange} hidden />
        {preview}
      </form>
    </div>
  )
};
export default ImageUploader