"use client";

import { transactionFormDefaultValues } from "@/lib/constants";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "./ui/input";

type FamilyGroup = {
  id: string;
  name: string;
};

type Props = {
  familyGroups: FamilyGroup[];
  onsubmit: (data: z.input<typeof transactionFormSchema>) => Promise<void>;
  showDynamicTitle?: boolean;
  defaultValues?: {
    accountScope: "personal" | "family";
    transactionType: "income" | "expense";
    groupId: string;
    amount: number;
    category: string;
    description: string;
    transactionDate: Date;
  };
};

const TransactionForm = ({
  familyGroups,
  onsubmit,
  showDynamicTitle = false,
  defaultValues,
}: Props) => {
  const form = useForm<z.input<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      ...transactionFormDefaultValues,
      ...defaultValues,
    },
  });

  const accountScope = useWatch({
    control: form.control,
    name: "accountScope",
  });
  const selectedGroupId = useWatch({
    control: form.control,
    name: "groupId",
  });

  useEffect(() => {
    if (accountScope !== "family") return;

    const currentGroupId = String(form.getValues("groupId") ?? "").trim();
    const hasCurrentGroup = familyGroups.some(
      (group) => group.id === currentGroupId,
    );

    if (hasCurrentGroup) return;

    form.setValue("groupId", familyGroups[0]?.id ?? "", {
      shouldValidate: true,
    });
  }, [accountScope, familyGroups, form]);

  const selectedFamilyName =
    familyGroups.find((group) => group.id === selectedGroupId)?.name ??
    familyGroups[0]?.name ??
    "No family available";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onsubmit)}>
        {showDynamicTitle ? (
          <h2 className="mb-6 text-3xl font-bold tracking-tight">
            {accountScope === "family" ? "Family Transaction" : "New Transaction"}
          </h2>
        ) : null}
        <fieldset
          disabled={form.formState.isSubmitting}
          className="grid grid-cols-2 gap-y-5 gap-x-2 items-start"
        >
          <FormField
            control={form.control}
            name="accountScope"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(newValue) => {
                        field.onChange(newValue);
                        if (newValue === "personal") {
                          form.setValue("groupId", "");
                        }
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem
                          value="family"
                          disabled={familyGroups.length === 0}
                        >
                          Family
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          {accountScope === "family" ? (
            <FormField
              control={form.control}
              name="groupId"
              render={() => {
                return (
                  <FormItem>
                    <FormLabel>Family</FormLabel>
                    <FormControl>
                      <Input value={selectedFamilyName} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          ) : null}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter category" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Transaction Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          data-empty={!field.value}
                          className={cn(
                            "w-full data-[empty=true]:text-muted-foreground justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value as string, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value as string)}
                          onSelect={field.onChange}
                          disabled={{ after: new Date() }}
                          data-set="calendar"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </fieldset>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="mt-5 flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit">Submit</Button>
        </fieldset>
      </form>
    </Form>
  );
};

export default TransactionForm;
