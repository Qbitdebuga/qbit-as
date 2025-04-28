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
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiConsumes,
  ApiBody 
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { Expense, ExpenseStatus } from './entities/expense.entity.js';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'The expense has been successfully created.', type: Expense })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'Return all expenses.', type: [Expense] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ExpenseStatus })
  @ApiQuery({ name: 'vendorId', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'fromDate', required: false, type: Date })
  @ApiQuery({ name: 'toDate', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortDirection', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ExpenseStatus,
    @Query('vendorId') vendorId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('fromDate') fromDate?: Date,
    @Query('toDate') toDate?: Date,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ) {
    return this.expensesService.findAll({
      page,
      limit,
      status,
      vendorId,
      categoryId,
      fromDate,
      toDate,
      search,
      sortBy,
      sortDirection,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a expense by id' })
  @ApiResponse({ status: 200, description: 'Return the expense.', type: Expense })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a expense' })
  @ApiResponse({ status: 200, description: 'The expense has been successfully updated.', type: Expense })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a expense' })
  @ApiResponse({ status: 200, description: 'The expense has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update expense status' })
  @ApiResponse({ status: 200, description: 'The expense status has been successfully updated.', type: Expense })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ExpenseStatus),
        },
      },
    },
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ExpenseStatus,
  ) {
    return this.expensesService.updateStatus(id, status);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get expenses by vendor id' })
  @ApiResponse({ status: 200, description: 'Return the expenses by vendor.', type: [Expense] })
  @ApiParam({ name: 'vendorId', type: 'number' })
  findByVendor(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.expensesService.findByVendor(vendorId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get expenses by category id' })
  @ApiResponse({ status: 200, description: 'Return the expenses by category.', type: [Expense] })
  @ApiParam({ name: 'categoryId', type: 'number' })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.expensesService.findByCategory(categoryId);
  }

  @Post(':id/attachment')
  @ApiOperation({ summary: 'Add an attachment to an expense' })
  @ApiResponse({ status: 201, description: 'The attachment has been successfully added.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/expenses',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type. Only JPEG, PNG, GIF and PDF files are allowed.'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  addAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    return this.expensesService.addAttachment(id, {
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
    });
  }

  @Delete('attachment/:id')
  @ApiOperation({ summary: 'Remove an attachment' })
  @ApiResponse({ status: 200, description: 'The attachment has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Attachment not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  removeAttachment(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.removeAttachment(id);
  }
} 