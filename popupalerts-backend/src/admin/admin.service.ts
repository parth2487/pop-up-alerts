import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Subscription } from 'src/users/entities/subscription.entity';
import { Widget } from 'src/widgets/entities/widget.entity';
import { Lead } from 'src/leads/entities/lead.entity';
import { SubscriptionStatus } from 'src/users/entities/subscription.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Subscription) private subscriptionRepository: Repository<Subscription>,
        @InjectRepository(Widget) private widgetRepository: Repository<Widget>,
        @InjectRepository(Lead) private leadRepository: Repository<Lead>,
    ) {}

    async findAllUsers() {
        return this.userRepository.find();
    }

    // --- PERBAIKAN UTAMA DI SINI ---
    async updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });

        // Tambahkan pemeriksaan keamanan
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        user.role = updateUserRoleDto.role;
        return this.userRepository.save(user); // Sekarang 'user' dijamin bukan null
    }
    // -------------------------------

    async findAllSubscriptions() {
        return this.subscriptionRepository.find({ relations: ['user'] });
    }
    
    async getTotalUsers() {
        return { count: await this.userRepository.count() };
    }

    async getTotalActiveSubscriptions() {
        return { count: await this.subscriptionRepository.count({ where: { status: SubscriptionStatus.ACTIVE } }) };
    }

    async getTotalWidgets() {
        return { count: await this.widgetRepository.count() };
    }

    async getTotalLeads() {
        return { count: await this.leadRepository.count() };
    }
}

