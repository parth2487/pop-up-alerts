import { Controller, Get, Post, Body, Param, UseGuards, Req, ValidationPipe } from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { AuthGuard } from '@nestjs/passport';
import { LeadSubmitDto } from 'src/leads/dto/lead-submit.dto';
import { FeedbackService } from 'src/feedback/feedback.service';
import { CreateFeedbackDto } from 'src/feedback/dto/create-feedback.dto';
import { LeadsService } from 'src/leads/leads.service';
import { User } from 'src/users/entities/user.entity';

// Controller untuk endpoint yang bisa diakses PUBLIK dan endpoint WIDGET-SPESIFIK
@Controller('widgets')
export class WidgetsController {
  constructor(
    private readonly widgetsService: WidgetsService,
    private readonly feedbackService: FeedbackService,
    private readonly leadsService: LeadsService,
  ) {}

  @Get(':id/public')
  findOnePublic(@Param('id') id: string) {
    return this.widgetsService.findOnePublic(id);
  }

  @Post(':id/view')
  incrementView(@Param('id') id: string) {
    return this.widgetsService.incrementViewCount(id);
  }
  
  @Post(':widgetId/submit')
  submitLead(@Param('widgetId') widgetId: string, @Body() body: LeadSubmitDto) {
    return this.leadsService.create(body, widgetId);
  }

  @Get(':widgetId/recent-leads')
  findRecentLeads(@Param('widgetId') widgetId: string) {
    return this.widgetsService.findRecentLeadsForWidget(widgetId);
  }

  @Get(':widgetId/lead-count')
  getLeadCount(@Param('widgetId') widgetId: string) {
    return this.widgetsService.getLeadCountForWidget(widgetId);
  }



  
  @Post(':widgetId/feedback')
  submitFeedback(@Param('widgetId') widgetId: string, @Body() body: CreateFeedbackDto) {
    return this.feedbackService.create(body, widgetId);
  }

  @Get(':widgetId/details')
  @UseGuards(AuthGuard('jwt'))
  findOneDetails(@Param('widgetId') widgetId: string, @Req() req: { user: User }) {
    return this.widgetsService.findOneDetails(widgetId, req.user.id);
  }

  @Post(':id/open')
incrementOpen(
  @Param('id') id: string,
  @Body('deviceId') deviceId: string,
  @Body('fingerprint') fingerprint: string,
  @Body('ip') ip: string
) {
  return this.widgetsService.incrementOpen(id,deviceId, fingerprint, ip);
}
}


// Controller terpisah untuk endpoint yang BERKONTEKS PADA WORKSPACE
@Controller('workspaces/:workspaceId/widgets')
export class WorkspaceWidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('workspaceId') workspaceId: string,
    @Req() req: { user: User },
    @Body() createWidgetDto: CreateWidgetDto,
  ) {
    return this.widgetsService.create(createWidgetDto, workspaceId, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Param('workspaceId') workspaceId: string, @Req() req: { user: User }) {
    // Akses properti 'id', bukan 'userId'
    return this.widgetsService.findAllForWorkspace(workspaceId, req.user.id);
  }

  @Get('open-count/total')
  async getTotalOpenCount(
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.widgetsService.getTotalOpenCount(workspaceId);
  }

}

