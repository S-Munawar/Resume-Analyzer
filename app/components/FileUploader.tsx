import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {formatSize} from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({onFileSelect}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;
    setSelectedFile(file);
    onFileSelect?.(file);
  }, [onFileSelect]);
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect?.(null);
  };
  
  const maxFileSize = 20 * 1024 * 1024; // 20 MB
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, multiple: false, maxSize: maxFileSize, accept: {'application/pdf': ['.pdf']}});

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
            { selectedFile ?(
                <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                    <img src="/images/pdf.png" alt="PDF" className="size-10"/>
                    <div className="flex items-center space-x-3">
                        <div>
                            <p className="font-medium text-sm truncate text-gray-700 max-w-xs">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">{formatSize(selectedFile.size)}</p>
                        </div>
                    </div>
                    <button className='p-2 cursor-pointer' onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                    }}>
                        <img src="/icons/cross.svg" alt="Remove" className="w-4 h-4"/>
                    </button>
                </div>
            ) :  (
                <div>
                    <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                        <img src="/icons/info.svg" alt="Upload" className="size-20"/>
                    </div>
                    <p className="text-lg text-gray-500">
                        <span className="font-semibold">
                            Click to upload
                        </span> or drag and drop
                    </p>
                    <p className="text-lg text-gray-500">PDF (max {formatSize(maxFileSize)})</p>
                </div>
            )}
        </div>
        
      </div>
    </div>
  )
}

export default FileUploader;