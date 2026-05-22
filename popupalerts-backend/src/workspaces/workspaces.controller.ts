import { Controller, Get, Post, Body, UseGuards, Req, Param, ValidationPipe } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  // Perubahan: Menghapus 'new ValidationPipe()' dari sini
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Req() req: { user: User }) {
    return this.workspacesService.create(createWorkspaceDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req: { user: User }) {
    return this.workspacesService.findAllForUser(req.user.id);
  }

  @Get(':workspaceId/stats')
  @UseGuards(AuthGuard('jwt'))
  getStats(@Param('workspaceId') workspaceId: string, @Req() req: { user: User }) {
      return this.workspacesService.getStatsForWorkspace(workspaceId, req.user.id);
  }

  @Get('public/domains')
  findAllPublicWorkspaceDomains() {
    return this.workspacesService.findAllPublicWorkspaceDomains();
  }
}

