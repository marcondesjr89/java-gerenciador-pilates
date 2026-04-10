export type ScheduleSlot = {
  id: string;
  instructorUserId: string;
  instructorName: string;
  requiredSpecialty: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableSpots: number;
};

export type ScheduleBlock = {
  id: string;
  instructorUserId: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  reason: string;
};

export type ScheduleBooking = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: string;
};

export type ScheduleWaitlistEntry = {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  status: string;
  promotedAt: string | null;
};
