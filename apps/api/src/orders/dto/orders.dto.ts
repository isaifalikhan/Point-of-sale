import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  variantName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonNames?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderPaymentDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsIn(['CASH', 'CARD', 'WALLET'])
  method!: 'CASH' | 'CARD' | 'WALLET';
}

export class CreateOrderDto {
  @IsIn(['DINE_IN', 'TAKEAWAY', 'DELIVERY'])
  type!: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsString()
  branchId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPaymentDto)
  payments?: CreateOrderPaymentDto[];
}


export class UpdateOrderStatusDto {
  @IsIn(['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'])
  status!: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
}
