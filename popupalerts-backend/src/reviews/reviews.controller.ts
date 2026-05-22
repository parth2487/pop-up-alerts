import { Controller, Get, Post, Body, Param, UseGuards, Req, ValidationPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Endpoint yang dilindungi: POST /reviews/widget/:widgetId
  @Post('widget/:widgetId')
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('widgetId') widgetId: string, 
    @Req() req: { user: User }, // Use the correctly typed request
    @Body(new ValidationPipe()) createReviewDto: CreateReviewDto
  ) {
    // --- THE FINAL FIX IS HERE ---
    // Access req.user.id, not req.user.userId
    return this.reviewsService.create(createReviewDto, widgetId, req.user.id);
    // -----------------------------
  }

  // Endpoint publik: GET /reviews/widget/:widgetId
  @Get('widget/:widgetId')
  findAll(@Param('widgetId') widgetId: string) {
    return this.reviewsService.findAllForWidget(widgetId);
  }
}
