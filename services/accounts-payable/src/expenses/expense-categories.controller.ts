import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategory } from './entities/expense-category.entity';

@ApiTags('expense-categories')
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense category' })
  @ApiResponse({
    status: 201,
    description: 'The expense category has been successfully created.',
    type: ExpenseCategory,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return this?.expenseCategoriesService.create(createExpenseCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expense categories' })
  @ApiResponse({
    status: 200,
    description: 'Return all expense categories.',
    type: [ExpenseCategory],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ) {
    return this?.expenseCategoriesService.findAll({
      page,
      limit,
      isActive,
      search,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active expense categories' })
  @ApiResponse({
    status: 200,
    description: 'Return all active expense categories.',
    type: [ExpenseCategory],
  })
  findActive() {
    return this?.expenseCategoriesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a expense category by id' })
  @ApiResponse({ status: 200, description: 'Return the expense category.', type: ExpenseCategory })
  @ApiResponse({ status: 404, description: 'Expense category not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this?.expenseCategoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a expense category' })
  @ApiResponse({
    status: 200,
    description: 'The expense category has been successfully updated.',
    type: ExpenseCategory,
  })
  @ApiResponse({ status: 404, description: 'Expense category not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto,
  ) {
    return this?.expenseCategoriesService.update(id, updateExpenseCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a expense category' })
  @ApiResponse({ status: 200, description: 'The expense category has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Expense category not found.' })
  @ApiResponse({
    status: 409,
    description: 'This category has expenses associated with it and cannot be deleted.',
  })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this?.expenseCategoriesService.remove(id);
  }
}
