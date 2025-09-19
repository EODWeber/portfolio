import { describe, expect, test, vi, beforeEach } from "vitest";

import { submitContact, type ContactFormState } from "@/app/contact/actions";
import { contactSchema } from "@/app/contact/schema";

const insertMock = vi.fn(async () => ({ error: null }));
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({
    from: fromMock,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/analytics/log-event", () => ({
  logEvent: vi.fn(async () => { })
}));

describe("contact form", () => {
  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
  });

  test("schema rejects invalid email", () => {
    const result = contactSchema.safeParse({
      name: "Jeff",
      email: "invalid",
      message: "This message is long enough to validate.",
    });
    expect(result.success).toBe(false);
  });

  test("submitContact returns error state for invalid payload", async () => {
    const formData = new FormData();
    formData.set("name", "J");
    formData.set("email", "bad@domain");
    formData.set("message", "too short");

    const state = (await submitContact({} as ContactFormState, formData)) ?? {};
    expect(state.success).toBe(false);
    expect(state.error).toBeDefined();
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("submitContact inserts into Supabase when valid", async () => {
    const formData = new FormData();
    formData.set("name", "Jeff Blank");
    formData.set("email", "jeff@example.com");
    formData.set("company", "Example Co");
    formData.set("message", "We would like to hire you for a leadership role.");

    const state = await submitContact({} as ContactFormState, formData);
    expect(state.success).toBe(true);
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith("contact_requests");
  });
});
