import { Button, Label, TextInput,FileInput } from 'flowbite-react';
import {useState} from "react";
import axios from "axios";

const api_gateway = process.env.REACT_APP_API_GATEWAY;

function App() {
    const [file, setFile] = useState(null);
    const [inputText, setFileInputText] = useState('');

    function handleTextChange(e) {
        setFileInputText(e.target.value);
    }
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
    };

    // Function to upload file to s3
    const uploadFile = async () => {

        let s3Key = file.name;

        //get upload url
        const axiosResponse = await  axios.get(api_gateway+'getUploadUrl?key='+s3Key,);
        let uploadUrl = axiosResponse['data']['url'];
        let bucketName = axiosResponse['data']['bucketName'];

        //upload to s3
        let res = await axios.put(uploadUrl,file);
        if(res['status']!==200){
            throw new Error('upload error');
        }

        //send  form
        res = await axios.post(api_gateway+'file', { input_text: inputText,input_file_path:bucketName+'/'+s3Key});
        if(res['status']!==200){
            throw new Error('upload error');
        }
        alert('提交成功');
        window.location.reload();
    };

  return (
    <div className="container pt-6">
        <form className="flex max-w-md flex-col gap-4">
            <div>
                <div className="mb-2 block">
                    <Label
                        htmlFor="text"
                        value="Text input"
                    />
                </div>
                <TextInput
                    onChange={handleTextChange}
                    value={inputText}
                    required
                    type="text"
                />
            </div>
            <div>
                <div className="mb-2 block">
                    <Label
                        htmlFor="file"
                        value="File input"
                    />
                </div>
                <FileInput
                    onChange={handleFileChange}
                    helperText=".txt"
                    accept="text/plain"
                    id="file"
                />
            </div>
            <Button type="button" onClick={uploadFile}>
                Submit
            </Button>
        </form>
    </div>
  );
}

export default App;
