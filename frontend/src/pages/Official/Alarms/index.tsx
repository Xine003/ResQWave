import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { createColumns } from "./components/Column";
import { DataTable } from "./components/DataTable";
import type { Alarm } from "./types";

// Mock data for demonstration
const mockAlarms: Alarm[] = [
  {
    id: "1",
    terminalId: "TERM-001",
    terminalName: "Terminal Alpha",
    alert: "High Water Level",
    status: "Active",
    severity: "Major",
    createdAt: "2024-12-16 10:30:00",
    updatedAt: "2024-12-16 11:45:00",
  },
  {
    id: "2",
    terminalId: "TERM-002",
    terminalName: "Terminal Beta",
    alert: "Low Battery",
    status: "Cleared",
    severity: "Minor",
    createdAt: "2024-12-15 14:20:00",
    updatedAt: "2024-12-16 08:15:00",
  },
  {
    id: "3",
    terminalId: "TERM-003",
    terminalName: "Terminal Gamma",
    alert: "Connection Lost",
    status: "Active",
    severity: "Major",
    createdAt: "2024-12-16 09:00:00",
    updatedAt: "2024-12-16 09:05:00",
  },
  {
    id: "4",
    terminalId: "TERM-004",
    terminalName: "Terminal Delta",
    alert: "Sensor Malfunction",
    status: "Cleared",
    severity: "Minor",
    createdAt: "2024-12-15 08:15:00",
    updatedAt: "2024-12-15 16:30:00",
  },
];

export function Alarms() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleMoreInfo = (alarm: Alarm) => {
    console.log("More info for alarm:", alarm);
    // TODO: Implement more info modal/sheet
  };

  const handleEdit = (alarm: Alarm) => {
    console.log("Edit alarm:", alarm);
    // TODO: Implement edit functionality
  };

  const handleArchive = (alarm: Alarm) => {
    console.log("Archive alarm:", alarm);
    // TODO: Implement archive functionality
  };

  const columns = useMemo(
    () =>
      createColumns({
        onMoreInfo: handleMoreInfo,
        onEdit: handleEdit,
        onArchive: handleArchive,
      }),
    [],
  );

  // Filter function for search
  const filterAlarms = (alarms: Alarm[]) => {
    if (!searchQuery.trim()) return alarms;

    return alarms.filter(
      (alarm) =>
        alarm.terminalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alarm.terminalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alarm.alert.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alarm.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alarm.severity.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const filteredAlarms = filterAlarms(mockAlarms);

  return (
    <div className="bg-[#171717] text-white p-4 sm:p-6 flex flex-col h-[calc(100vh-73px)]">
      <div className="w-full max-w-9xl mx-auto flex-1 flex flex-col min-h-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Alarms</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-[5px] border border-[#404040] bg-[#262626] text-white hover:bg-[#404040] hover:text-white"
              onClick={() => console.log("Search clicked")}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Filter Icon Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-[5px] border border-[#404040] bg-[#262626] text-white hover:bg-[#404040] hover:text-white"
              onClick={() => console.log("Filter clicked")}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <DataTable
            columns={columns}
            data={filteredAlarms}
            onRowClick={(row) => handleMoreInfo(row as Alarm)}
          />
        </div>
      </div>
    </div>
  );
}
