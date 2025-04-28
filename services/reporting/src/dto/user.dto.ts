export interface UserDto {
  id: string | null;
  email: string | null;
  name?: string | null;
  isAdmin: boolean | null;
  roles?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 