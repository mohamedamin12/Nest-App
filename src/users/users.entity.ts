import { Exclude } from 'class-transformer';
import { Product } from 'src/products/products.entity';
import { Review } from 'src/reviews/reviews.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { UserType } from 'src/utils/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'varchar', length: '150', nullable: true })
  username: string;
  
  @Column({ type: 'varchar', length: '250', unique: true })
  email: string;
  
  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true, default: null })
  profileImage: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  userType: UserType;

  @Column({ default: false })
  isAccountVerified: boolean;

  @Column({ nullable: true })
  verifictionToken: string;
  
  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
  
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
  
  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
