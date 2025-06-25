export interface UserResponse {
  timeStamp: string;
  statusCode: number;
  status: string;
  message: string;
  data: {
    results: User[];
  };
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture:string|null;
  createdAt: string;
  profileMimeType:string;
  logins: string[];
  updatedAt: string;
  roles: string[];
  enabled: boolean;
  createAccountToken: string | null;
  userFiles: any[]; 
  nonLocked: boolean;
}
