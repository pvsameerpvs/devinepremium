import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity("saved_addresses")
export class SavedAddress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.savedAddresses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", length: 80 })
  label!: string;

  @Column({ type: "varchar", length: 255 })
  location!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  building!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  apartment!: string | null;

  @Column({ type: "varchar", length: 120 })
  city!: string;

  @Column({ type: "text", nullable: true })
  mapLink!: string | null;

  @Column({ type: "varchar", length: 48, nullable: true })
  lat!: string | null;

  @Column({ type: "varchar", length: 48, nullable: true })
  lng!: string | null;

  @Column({ type: "boolean", default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
