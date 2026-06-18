import type { Doctor } from "./Doctor.ts";
import type { Reader } from "./Reader";

export type Lending = {
  _id: string;
  book: Doctor | string;
  reader: Reader | string;
  lentDate: string;
  dueDate: string;
  returned: boolean;
}
