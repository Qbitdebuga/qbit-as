import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  Matches, 
  IsOptional 
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string | null;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string | null;

  @ApiProperty({
    example: 'Password123!',
    description: 'The password of the user',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string | null;

  @ApiProperty({
    example: 'Password123!',
    description: 'Confirmation of the password',
  })
  @IsString({ message: 'Confirm password must be a string' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword!: string | null;

  @ApiProperty({
    example: ['user'],
    description: 'The roles of the user',
    required: false,
  })
  @IsOptional()
  roles?: string[];
} 