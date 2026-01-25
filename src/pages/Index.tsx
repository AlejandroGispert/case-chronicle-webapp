import Layout from "../components/Layout";
import DocumentsList from "../components/DocumentsList";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-1">Documents</h1>
          <p className="text-muted-foreground">
            View and manage all documents organized by case
          </p>
        </div>

        <DocumentsList />
      </div>
    </Layout>
  );
};

export default Index;
