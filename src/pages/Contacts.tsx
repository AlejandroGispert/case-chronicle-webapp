import Layout from "../components/Layout";
import ContactsList from "../components/ContactsList";

const Contacts = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1">
            Contacts
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage contacts for each case
          </p>
        </div>

        <ContactsList />
      </div>
    </Layout>
  );
};

export default Contacts;
