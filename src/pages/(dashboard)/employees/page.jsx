import { useSearchParams } from "react-router-dom";
import { PageLayout } from "../../../components/layouts/page-layout";
import { PageTransition } from "../../../components/ui/page-transition";
// import { useEmployees } from "../../../hooks/use-employees";
import { EmployeeStats } from "./components/employee-stats";
import { EmployeeList } from "./components/employee-list";
import { AddEmployeeForm } from "./components/add-employee-form";
import { UserPlus } from "@/components/icons";
import { Button } from "../../../components/ui/button";
import { SidebarPageTransition } from "../../../components/ui/sidebar-page-transition";

export default function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") || "list";

  const setView = (v) => {
    setSearchParams({ view: v });
  };

  return (
    <PageLayout
      title="Employee Management"
      subtitle={view === "list" ? "Monitor and manage your organization's employees." : "Onboard a new member to your team."}
      showBackButton={view === "add"}
      actions={
        view === "list" && (
          <Button
            className="h-9 md:h-10 bg-slate-900 text-white hover:bg-slate-800 rounded-xl active:scale-95 transition-all"
            onClick={() => setView("add")}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )
      }
    >
      <div className="flex-1 flex flex-col gap-6">
        <SidebarPageTransition transitionKey={view}>
          {view === "list" && (
            <div className="space-y-6">
              <EmployeeStats />
              <EmployeeList />
            </div>
          )}
          {view === "add" && (
            <AddEmployeeForm
              onCancel={() => setView("list")}
            />
          )}
        </SidebarPageTransition>
      </div>
    </PageLayout>
  );
}
