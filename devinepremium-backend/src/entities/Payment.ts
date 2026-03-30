import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PaymentMethod, PaymentStatus } from "../types/domain";
import { Booking } from "./Booking";
import { User } from "./User";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  bookingId!: string;

  @ManyToOne(() => Booking, (booking) => booking.payments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "bookingId" })
  booking!: Booking;

  @Column({ type: "varchar", nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "userId" })
  user!: User | null;

  @Column({ type: "varchar", length: 255 })
  payerEmail!: string;

  @Column({ type: "varchar", length: 32 })
  method!: PaymentMethod;

  @Column({ type: "varchar", length: 64 })
  provider!: string;

  @Column({ type: "varchar", length: 32 })
  status!: PaymentStatus;

  @Column({ type: "float", default: 0 })
  amount!: number;

  @Column({ type: "varchar", length: 8, default: "AED" })
  currency!: string;

  @Column({ type: "varchar", length: 96, unique: true })
  checkoutReference!: string;

  @Column({ type: "simple-json", nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: "varchar", nullable: true })
  paidAt!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
