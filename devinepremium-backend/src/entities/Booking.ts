import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  BookingAddress,
  BookingChangeRequest,
  BookingPricing,
  BookingSchedule,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "../types/domain";
import { Payment } from "./Payment";
import { BookingStatusHistory } from "./BookingStatusHistory";
import { StaffMember } from "./StaffMember";
import { User } from "./User";

@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 64, unique: true })
  bookingReference!: string;

  @Column({ type: "varchar", length: 128 })
  serviceId!: string;

  @Column({ type: "varchar", length: 128 })
  serviceSlug!: string;

  @Column({ type: "varchar", length: 255 })
  serviceTitle!: string;

  @Column({ type: "simple-json" })
  serviceOptions!: Record<string, unknown>;

  @Column({ type: "simple-json" })
  address!: BookingAddress;

  @Column({ type: "simple-json" })
  schedule!: BookingSchedule;

  @Column({ type: "simple-json" })
  pricing!: BookingPricing;

  @Column({ type: "varchar", length: 32, default: "pending" })
  status!: BookingStatus;

  @Column({ type: "varchar", length: 32, default: "cash" })
  paymentMethod!: PaymentMethod;

  @Column({ type: "varchar", length: 32, default: "cash_due" })
  paymentStatus!: PaymentStatus;

  @Column({ type: "varchar", length: 255 })
  contactName!: string;

  @Column({ type: "varchar", length: 255 })
  contactEmail!: string;

  @Column({ type: "varchar", length: 32, nullable: true })
  contactPhone!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "simple-json", nullable: true })
  customerRequest!: BookingChangeRequest | null;

  @Column({ type: "varchar", nullable: true })
  assignedStaffId!: string | null;

  @ManyToOne(() => StaffMember, (staffMember) => staffMember.bookings, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "assignedStaffId" })
  assignedStaff!: StaffMember | null;

  @Column({ type: "varchar", nullable: true })
  assignedAt!: string | null;

  @Column({ type: "float", default: 0 })
  subtotal!: number;

  @Column({ type: "float", default: 0 })
  discountAmount!: number;

  @Column({ type: "float", default: 0 })
  vatAmount!: number;

  @Column({ type: "float", default: 0 })
  totalAmount!: number;

  @Column({ type: "varchar", length: 8, default: "AED" })
  currency!: string;

  @Column({ type: "varchar", nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, (user) => user.bookings, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "userId" })
  user!: User | null;

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments!: Payment[];

  @OneToMany(() => BookingStatusHistory, (history) => history.booking)
  statusHistory!: BookingStatusHistory[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
