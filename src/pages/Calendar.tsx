import Layout from "../components/Layout";
import CalendarView from "../components/CalendarView";
import { useSelectedCase } from "@/contexts/SelectedCaseContext";

const Calendar = () => {
  const { selectedCaseId, selectedCase } = useSelectedCase();

  return (
    <Layout>
      <CalendarView
        caseId={selectedCaseId ?? undefined}
        caseTitle={selectedCase?.title}
      />
    </Layout>
  );
};

export default Calendar;
