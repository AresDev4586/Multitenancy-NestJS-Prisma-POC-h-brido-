import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    create(@Body() body: { name: string; price: number }) {
        return this.productsService.createProduct(body.name, body.price);
    }

    @Get()
    list() {
        return this.productsService.listProducts();
    }
}