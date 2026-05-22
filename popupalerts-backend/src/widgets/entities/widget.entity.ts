// popupalerts-backend/src/widgets/entities/widget.entity.ts
import { Workspace } from 'src/workspaces/entities/workspace.entity';
// import { Lead } from 'src/leads/entities/lead.entity'; // <-- 1. Impor Lead
import { Review } from 'src/reviews/entities/review.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Lead } from 'src/leads/entities/lead.entity';

export enum WidgetType {
  INFORMATIONAL = 'informational',
  COUPON = 'coupon',
  LIVE_COUNTER = 'live_counter',
  EMAIL_COLLECTOR = 'email_collector',
  RECENT_CONVERSIONS = 'recent_conversions',
  CONVERSION_COUNTER = 'conversion_counter',
  COUNTDOWN_TIMER = 'countdown_timer',
  REVIEWS = 'reviews',
  SOCIAL_SHARE = 'social_share',
  FEEDBACK = 'feedback',
  VIDEO = 'video',
  COOKIE_NOTIFICATION = 'cookie_notification',
}

@Entity('widgets')
export class Widget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: WidgetType,
    default: WidgetType.INFORMATIONAL,
  })
  type: WidgetType;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>; // Untuk menyimpan teks, warna, dll.

  @Column({ type: 'integer', default: 0 })
  view_count: number;
  // ---------------------------------

  @Column({ type: 'jsonb', default: [] })
   opened_devices: string[];

  @Column({ type: 'integer', default: 0 })
  open_count: number; 

  @ManyToOne(() => Workspace, (workspace) => workspace.id, { onDelete: 'CASCADE' })
  workspace: Workspace;
// --- 3. TAMBAHKAN HUBUNGAN KEMBALI KE LEADS ---
  @OneToMany(() => Lead, (lead) => lead.widget)
  leads: Lead[];
  // ---------------------------------------------
  @OneToMany(() => Review, (review) => review.widget)
  reviews: Review[];

  @OneToMany(() => Feedback, (feedback) => feedback.widget)
  feedbacks: Feedback[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}