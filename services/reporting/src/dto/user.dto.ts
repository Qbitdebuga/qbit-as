export interface UserDto {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  roles?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 