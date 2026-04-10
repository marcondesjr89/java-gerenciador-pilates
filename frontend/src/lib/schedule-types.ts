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
