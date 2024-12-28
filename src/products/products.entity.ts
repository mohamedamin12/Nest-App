import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { Review } from '../reviews/reviews.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/users/users.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: '150' })
  title: string;
  @Column({ type: 'float' })
  price: number;
  @Column()
  description: string;
  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @OneToMany(() => Review, (review) => review.product , {eager: true})
  reviews: Review[];
  @ManyToOne(() => User, (user) => user.products , {eager: true})
  user: User;
}
