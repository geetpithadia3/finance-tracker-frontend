import React, { useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";

export const FileUploadComponent = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv', '.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });
  
  return (
    <Card className="border-dashed">
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center p-8 space-y-4 text-center cursor-pointer",
            "transition-colors duration-200 outline-none",
            isDragActive ? "bg-primary/5" : "hover:bg-secondary/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="p-4 bg-primary/5 rounded-full">
            <FileUp className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              {isDragActive ? 'Drop it like it\'s hot! 🔥' : 'Feed Me Your Transactions!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drop your CSV here or click to browse (I don't bite!)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 