
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { Widget } from 'src/widgets/entities/widget.entity';
import { Lead } from 'src/leads/entities/lead.entity';
import { Subscription } from 'src/users/entities/subscription.entity';
import { SubscriptionStatus } from 'src/users/entities/subscription.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,

    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,

    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,

    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  // ----------------------------------------------------
  //  CREATE WORKSPACE (WITH SUBSCRIPTION LIMIT CHECK)
  // ----------------------------------------------------
  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string): Promise<Workspace> {
    
    // 1️⃣ Check existing workspaces
    const workspaceCount = await this.workspaceRepository.count({
      where: { user: { id: userId } },
    });

    // 2️⃣ Check if user has active subscription
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
    });
    console.log("use id ,",userId)
    console.log("Heyy subscription",subscription)
    console.log("SubscriptionStatus.ACTIVE ",SubscriptionStatus.ACTIVE)

    const maxAllowed = subscription ? 10 : 1;

    if (workspaceCount >= maxAllowed) {
      throw new BadRequestException(
        subscription
          ? `You have reached your limit of 10 workspaces.` 
          : `Upgrade your plan to create more workspaces.`
      );
    }

    // 3️⃣ Create workspace
    const newWorkspace = this.workspaceRepository.create({
      ...createWorkspaceDto,
      user: { id: userId },
    });

    return this.workspaceRepository.save(newWorkspace);
  }


  async findAllForUser(userId: string): Promise<{ workspaces: Workspace[]; isSubscribed: boolean }> {
  // Fetch workspaces
  const workspaces = await this.workspaceRepository.find({
    where: { user: { id: userId } },
    order: { created_at: 'DESC' },
  });

  // Check if user has active subscription
  const subscription = await this.subscriptionRepository.findOne({
    where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
  });

  const isSubscribed = !!subscription;

  return { workspaces, isSubscribed };
}

  // ----------------------------------------------------
  //  GET WORKSPACE STATS
  // ----------------------------------------------------
  async getStatsForWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<{ totalViews: number; totalLeads: number }> {

    // Verify ownership
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['user'],
    });

    if (!workspace || workspace.user.id !== userId) {
      throw new UnauthorizedException('You do not own this workspace.');
    }

    // Total views
    const viewsResult = await this.widgetRepository
      .createQueryBuilder('widget')
      .select('SUM(widget.view_count)', 'totalViews')
      .where('widget.workspaceId = :workspaceId', { workspaceId })
      .getRawOne();

    // Total leads
    const totalLeads = await this.leadRepository
      .createQueryBuilder('lead')
      .innerJoin('lead.widget', 'widget')
      .where('widget.workspaceId = :workspaceId', { workspaceId })
      .getCount();

    return {
      totalViews: parseInt(viewsResult.totalViews, 10) || 0,
      totalLeads: totalLeads || 0,
    };
  }

async findAllPublicWorkspaceDomains(): Promise<{ domain: string }[]> {
  // Fetch only the domain column for all workspaces
  const workspaces = await this.workspaceRepository
    .createQueryBuilder('workspace')
    .select(['workspace.domain'])
    .orderBy('workspace.created_at', 'DESC')
    .getMany();

  // Trim and remove duplicates
  const uniqueDomains = Array.from(
    new Set(workspaces.map(w => w.domain.trim()))
  );

  return uniqueDomains.map(domain => ({ domain }));
}


}
