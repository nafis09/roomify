import React, {useState} from 'react'
import {useOutletContext} from "react-router";
import { CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}


const Upload = () => {
        const [file, setFile] = useState<File | null>(null);
        const [isDragging, setIsDragging] = useState<boolean>(false)
        const [progress, setProgress] = useState<number>(0)

        const { isSignedIn } = useOutletContext<AuthContext>()

    return (
        <div className="upload">
            {!file ? (
                <div className={`dropzone ${isDragging ? 'dragging' : ''}`}>
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>

                        <p>
                            {isSignedIn ? (
                                "Click to upload or just drag and drop"
                            ): (
                                "Sign in or Sign up with Puter to upload"
                            )}
                        </p>

                        <p className="help">Maximum File Size 50MB</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                               <CheckCircle2 className="check" />
                            ): (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Upload
