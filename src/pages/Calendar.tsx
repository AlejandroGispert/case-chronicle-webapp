import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import CalendarView from "../components/CalendarView";

const Calendar = () => {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("caseId") ?? undefined;
  const caseTitle = searchParams.get("caseTitle") ?? undefined;

  return (
    <Layout>
      <CalendarView
        caseId={caseId}
        caseTitle={caseTitle ? decodeURIComponent(caseTitle) : undefined}
      />
    </Layout>
  );
};

export default Calendar;
