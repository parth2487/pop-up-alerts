import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Widget } from './entities/widget.entity';
import { Repository } from 'typeorm';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Lead } from 'src/leads/entities/lead.entity';
import {
  Subscription,
  SubscriptionStatus,
} from 'src/users/entities/subscription.entity';
import * as crypto from 'crypto';

@Injectable()
export class WidgetsService {
  constructor(
    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  private async verifyWorkspaceOwner(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['user'],
    });

    if (!workspace || !workspace.user || workspace.user.id !== userId) {
      throw new UnauthorizedException('You do not own this workspace.');
    }
  }

  // ----------------------------
  // CREATE WIDGET WITH LIMIT CHECK
  // ----------------------------
  async create(
    createWidgetDto: CreateWidgetDto,
    workspaceId: string,
    userId: string,
  ): Promise<Widget> {
    await this.verifyWorkspaceOwner(workspaceId, userId);

    // 1️⃣ Count existing widgets in this workspace
    const widgetCount = await this.widgetRepository.count({
      where: { workspace: { id: workspaceId } },
    });

    // 2️⃣ Check if user has active subscription
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
    });

    const maxAllowed = subscription ? Number.MAX_SAFE_INTEGER : 1; // Free users: 1 widget per workspace

    if (widgetCount >= maxAllowed) {
      throw new BadRequestException(
        subscription
          ? `You have reached your widget limit.`
          : `Free plan users can create only 1 widget per workspace. Upgrade to create more.`,
      );
    }

    // 3️⃣ Create widget
    const newWidget = this.widgetRepository.create({
      ...createWidgetDto,
      workspace: { id: workspaceId },
    });

    return this.widgetRepository.save(newWidget);
  }

  async findAllForWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<{ widgets: Widget[]; isSubscribed: boolean }> {
    await this.verifyWorkspaceOwner(workspaceId, userId);

    const widgets = await this.widgetRepository.find({
      where: { workspace: { id: workspaceId } },
      order: { created_at: 'DESC' },
    });

    // Check subscription status
    const subscription = await this.subscriptionRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
    });

    return { widgets, isSubscribed: !!subscription }; // frontend can use this to allow unlimited widgets
  }

  async findOnePublic(
    id: string,
  ): Promise<{ type: string; settings: any; view_count: number }> {
    const widget = await this.widgetRepository.findOne({ where: { id } });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    return {
      type: widget.type,
      settings: widget.settings,
      view_count: widget.view_count,
    };
  }

  async findOneDetails(widgetId: string, userId: string) {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
      relations: ['workspace', 'workspace.user'],
    });
    if (
      !widget ||
      !widget.workspace ||
      !widget.workspace.user ||
      widget.workspace.user.id !== userId
    ) {
      throw new UnauthorizedException();
    }
    return {
      id: widget.id,
      name: widget.name,
      workspaceId: widget.workspace.id,
    };
  }

  async incrementViewCount(id: string) {
    await this.widgetRepository.increment({ id }, 'view_count', 1);
  }

  async submitLead(widgetId: string, data: any): Promise<Lead> {
    const widget = await this.widgetRepository.findOneBy({ id: widgetId });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    const newLead = this.leadRepository.create({
      widget: { id: widgetId },
      data,
    });
    return this.leadRepository.save(newLead);
  }

  async findRecentLeadsForWidget(widgetId: string) {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
    });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    const sourceId = widget.settings.sourceWidgetId || widgetId;
    const rawLeads = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.data', 'data')
      .where('lead.widgetId = :widgetId', { widgetId: sourceId })
      .orderBy('lead.created_at', 'DESC')
      .take(10)
      .getRawMany();
    return rawLeads;
  }

  async getLeadCountForWidget(widgetId: string) {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
    });
    if (!widget) throw new NotFoundException('Widget not found');
    const sourceId = widget.settings.sourceWidgetId || widgetId;
    const count = await this.leadRepository.count({
      where: { widget: { id: sourceId } },
    });
    return { count };
  }

  async incrementOpen(
    widgetId: string,
    deviceId: string,
    fingerprint: string,
    ip: string,
  ) {
    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId },
    });
    if (!widget) throw new NotFoundException('Widget not found');

    // Safe fallback values
    const safeFingerprint = fingerprint || null;
    const safeIp = ip || null;
    const safeLocalId = deviceId || null;

    let uniqueKey: string;

    if (safeIp && safeFingerprint) {
      uniqueKey = crypto
        .createHash('sha256')
        .update(safeIp + safeFingerprint)
        .digest('hex');
    } else if (safeIp) {
      uniqueKey = crypto.createHash('sha256').update(safeIp).digest('hex');
    } else if (safeFingerprint) {
      uniqueKey = crypto
        .createHash('sha256')
        .update(safeFingerprint)
        .digest('hex');
    } else {
      uniqueKey = safeLocalId || crypto.randomUUID();
    }

    // Track multiple devices in opened_devices array
    let openedDevices: string[] = widget.settings.opened_devices || [];

    if (!openedDevices.includes(uniqueKey)) {
      openedDevices.push(uniqueKey);
      widget.settings.opened_devices = openedDevices;
      widget.open_count += 1;
      await this.widgetRepository.save(widget);
    }

    return {
      widget_id: widget.id,
      device_hash: uniqueKey,
      view_count: widget.view_count,
      open_count: widget.open_count,
    };
  }

  async getTotalOpenCount(workspaceId: string) {
    const total = await this.widgetRepository
      .createQueryBuilder('widget')
      .select('SUM(widget.open_count)', 'total')
      .where('widget.workspaceId = :workspaceId', { workspaceId })
      .getRawOne();

    return { total_open_count: Number(total.total) || 0 };
  }
}
