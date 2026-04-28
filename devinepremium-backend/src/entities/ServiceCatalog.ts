import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ServiceCategory } from "./ServiceCategory";
import {
  ServiceOption,
  ServicePricingConfig,
  ServicePricingMode,
} from "../types/domain";

@Entity("services")
export class ServiceCatalog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => ServiceCategory, (category) => category.services, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "categoryId" })
  category!: ServiceCategory | null;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 128, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "text", nullable: true })
  imageUrl!: string | null;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "int", default: 0 })
  sortOrder!: number;

  @Column({ type: "float", default: 0 })
  basePrice!: number;

  @Column({ type: "varchar", length: 64, nullable: true })
  priceUnit!: string | null;

  @Column({ type: "varchar", length: 32, default: "package" })
  pricingMode!: ServicePricingMode;

  @Column({ type: "simple-json" })
  pricingConfig!: ServicePricingConfig;

  @Column({ type: "simple-json" })
  options!: ServiceOption[];

  @Column({ type: "simple-json" })
  expectations!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
