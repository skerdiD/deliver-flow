import { z } from "zod";

export const idSchema = z.string().uuid();

export const emailSchema = z.string().email();

export const nonEmptyStringSchema = z.string().trim().min(1);