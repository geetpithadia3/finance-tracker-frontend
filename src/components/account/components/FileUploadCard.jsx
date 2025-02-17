import { Card, CardContent } from "@/components/ui/card";
import { FileUp } from 'lucide-react';
import Dropzone from 'shadcn-dropzone';

export const FileUploadCard = ({ onFileUpload }) => {
  return (
    <Card className="border-dashed">
      <CardContent className="p-0">
        <Dropzone
          onDrop={(acceptedFiles) => onFileUpload(acceptedFiles[0])}
          className="cursor-pointer"
        >
          {({ isDragAccept }) => (
            <div className={`flex flex-col items-center justify-center p-8 space-y-4 text-center
              ${isDragAccept ? 'bg-primary/5' : 'hover:bg-secondary/50'} transition-colors duration-200`}>
              <div className="p-4 bg-primary/5 rounded-full">
                <FileUp className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {isDragAccept ? 'Drop it like it\'s hot! 🔥' : 'Feed Me Your Transactions!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Drop your CSV here or click to browse (I don't bite!)
                </p>
              </div>
            </div>
          )}
        </Dropzone>
      </CardContent>
    </Card>
  );
}; 