"use client";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { ChevronLeft, ChevronRight } from "@/components/icons";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      showWeekNumber={true} // Screenshot mein week numbers hain
      className={cn("p-4 bg-white rounded-2xl shadow-sm w-fit", className)} // Card container style
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden", // Card container

        // Header: Solid Blue-600 Block (Design from Image, Color from Current)
        caption: "flex justify-center py-4 relative items-center w-full bg-blue-600",
        caption_label: "text-base font-bold text-white flex items-center gap-2 z-10 tracking-wide",
        caption_dropdowns: "flex gap-2 items-center z-10",

        // Dropdowns (White text)
        dropdown: "bg-transparent text-white font-bold text-base border-none cursor-pointer hover:bg-white/10 rounded px-1 py-0.5 appearance-none focus:outline-none focus:ring-0 [&>option]:text-slate-900",
        dropdown_month: "text-white font-bold",
        dropdown_year: "text-white font-bold",
        dropdown_icon: "hidden",

        // Navigation (White Circles with Blue Text)
        nav: "flex items-center justify-between absolute w-full px-4 z-0",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-white text-blue-600 rounded-full p-0 hover:bg-slate-50 hover:text-blue-700 shadow-md transition-all flex items-center justify-center"
        ),
        nav_button_previous: "absolute left-3",
        nav_button_next: "absolute right-3",

        table: "w-full border-collapse space-y-1 pb-4 px-2", // Added padding bottom/x to table wrapper
        head_row: "flex mt-4 mb-2 justify-center gap-1",
        head_cell: "text-blue-600 rounded-md w-9 font-bold text-[0.8rem] capitalize", // Blue headers

        row: "flex w-full mt-1 justify-center gap-1 group",

        // Week Numbers
        weeknumber: "text-[10px] text-slate-300 font-medium flex items-center justify-center h-8 w-8 my-auto",

        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-blue-50/50 [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium aria-selected:opacity-100 rounded-full hover:bg-slate-100 hover:text-blue-600 transition-all text-slate-600"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",

        // Selected Date: Blue-600 (Current Preference)
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white shadow-lg shadow-blue-200 z-10",

        day_today: "bg-slate-50 text-slate-900 font-bold border border-slate-200",
        day_outside: "text-slate-300 opacity-50",
        day_disabled: "text-slate-300 opacity-50 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-slate-900 rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };