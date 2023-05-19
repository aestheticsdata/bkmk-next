export type Priority = "low" | "medium" | "high" | "highest" | null;

const priorities = {
  "low": 1,
  "medium": 2,
  "high": 3,
  "highest": 4,
} ;

const getPriorityNumber = (priority : Priority): number => priority ? priorities[priority] : 0;

export default getPriorityNumber;
