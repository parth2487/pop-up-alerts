
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  INCOMPLETE = 'incomplete',
}

export enum PlanType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  // Stripe fields — must be nullable for PayPal
  @Column({ type: 'varchar',nullable: true })
  stripe_customer_id: string | null;

  @Column({ type: 'varchar',nullable: true })
  stripe_subscription_id: string | null;

  // PayPal fields
  @Column({ type: 'varchar',nullable: true })
  paypal_subscription_id: string | null;

  @Column({ type: 'varchar',nullable: true })
  paypal_plan_id: string | null;

  @Column({ type: 'varchar',nullable: true })
  paypal_payer_email: string | null;

  // Subscription status
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  // Plan details
  @Column({
    type: 'enum',
    enum: PlanType,
    nullable: true,
  })
  plan_type: PlanType;

  // Pricing - How much the user pays
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // e.g., 9.99 for monthly, 99.99 for yearly

  @Column({ length: 3, default: 'USD' })
  currency: string; // USD, EUR, INR, etc.

  // Plan features/inclusions (what they get for their money)
  @Column({ type: 'jsonb', nullable: true })
  plan_features: {
    feature_name: string;
    description?: string;
    limit?: number | string;
  }[];

  // Alternative: Store features as text array
  @Column({ type: 'text', array: true, nullable: true })
  included_features: string[];

  // Billing period tracking
  @Column({ type: 'timestamp', nullable: true })
  current_period_start: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  current_period_end: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}