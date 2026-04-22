import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTableDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(1)
  capacity!: number;

  @IsString()
  branchId!: string;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;
}

export class UpdateTableStatusDto {
  @IsIn(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'BILL_PENDING'])
  status!: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILL_PENDING';
}

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;
}

