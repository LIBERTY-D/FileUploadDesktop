export type FileData = {
  fileId: string;
  mimeType: string;
  fileName: string;
  fileContent: Uint8Array; // or number[] if preferred
  flaggedToDelete: boolean;
  fileSize: number;
  createdAt: string; // or Date if you're parsing to JS Date objects
  updatedAt: string; // or Date
};


export type ApiResponse = {
  timeStamp: string;
  statusCode: number;
  status: string;
  message: string;
  data: {
    results: FileData[];
  };
};