"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientActionResult } from "@/features/admin/clients/actions";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/features/admin/clients/client-validation";

type ClientFormProps = {
  mode: "create" | "edit";
  defaultValues?: ClientFormValues;
  submitAction: (values: ClientFormValues) => Promise<ClientActionResult>;
};

export function ClientForm({
  mode,
  defaultValues,
  submitAction,
}: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      email: "",
      company: "",
      status: "active",
    },
  });

  function onSubmit(values: ClientFormValues) {
    startTransition(async () => {
      const result = await submitAction(values);

      if (!result.success) {
        form.setError("root", {
          message: result.message,
        });

        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            if (message) {
              form.setError(field as keyof ClientFormValues, { message });
            }
          });
        }

        return;
      }

      if (mode === "edit" && result.clientId) {
        router.push(`/admin/clients/${result.clientId}`);
        router.refresh();
        return;
      }

      router.push("/admin/clients");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-[72rem] rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Add Client" : "Edit Client"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Save the client details you need before assigning projects."
            : "Update the client details shown across the Owner workspace."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            {form.formState.errors.root?.message ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {form.formState.errors.root.message}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sarah Johnson"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use the main contact person for this client.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-x-7 gap-y-7 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="client@example.com"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This should match their login email later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nova Agency"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional, useful for agencies and businesses.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={isPending}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Active clients appear in normal project delivery views.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {mode === "create"
                      ? "Creating client..."
                      : "Saving client..."}
                  </>
                ) : (
                  "Save Client"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
