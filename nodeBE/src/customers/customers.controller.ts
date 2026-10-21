
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

// INFO: Custom imports
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    @ApiOperation({ summary: 'List all customers' })
    findAll() {
        return this.customersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a customer by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.customersService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a customer' })
    create(@Body() dto: CreateCustomerDto) {
        return this.customersService.create(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a customer' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateCustomerDto,
    ) {
        return this.customersService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a customer' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.customersService.remove(id);
    }
}
