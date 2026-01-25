import { useEffect } from "react";
import Layout from "../components/Layout";
import CalendarView from "../components/CalendarView";

const Calendar = () => {
  useEffect(() => {
    console.log("Calendar page rendered");
  }, []);

  return (
    <Layout>
      <CalendarView />
    </Layout>
  );
};

export default Calendar;
