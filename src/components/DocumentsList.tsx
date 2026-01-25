import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Mail, Upload } from "lucide-react";
import { emailModel } from "@/backend/models/emailModel";
import { caseController } from "@/backend/controllers/caseController";
import { documentController } from "@/backend/controllers/documentController";
import { Email, EmailAttachment } from "@/backend/models/types";
import { CaseDocument } from "@/backend/models/documentModel";
import { format } from "date-fns";

interface DocumentWithEmail {
  attachment: EmailAttachment;
  email: Email;
  caseTitle: string;
  caseNumber: string;
  source: "email";
}

interface DirectDocument {
  document: CaseDocument;
  caseTitle: string;
  caseNumber: string;
  source: "upload";
}

type DocumentItem = DocumentWithEmail | DirectDocument;

interface DocumentsByCase {
  caseId: string;
  caseTitle: string;
  caseNumber: string;
  documents: DocumentItem[];
}

const DocumentsList = () => {
  const [documentsByCase, setDocumentsByCase] = useState<DocumentsByCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch all cases
      const cases = await caseController.fetchAllCases();
      
      // Process documents grouped by case
      const documentsMap = new Map<string, DocumentsByCase>();
      
      // 1. Fetch documents from email attachments
      const allEmails = await emailModel.getAllEmails();
      
      for (const email of allEmails) {
        // Parse attachments
        const attachments: EmailAttachment[] = email.attachments
          ? (typeof email.attachments === "string"
              ? JSON.parse(email.attachments)
              : email.attachments)
          : [];
        
        // Only process emails with attachments and a case_id
        if (attachments.length > 0 && email.case_id) {
          const caseData = cases.find((c) => c.id === email.case_id);
          if (!caseData) continue;
          
          const caseId = email.case_id;
          
          if (!documentsMap.has(caseId)) {
            documentsMap.set(caseId, {
              caseId,
              caseTitle: caseData.title,
              caseNumber: caseData.number,
              documents: [],
            });
          }
          
          // Add each attachment as a document
          attachments.forEach((attachment) => {
            documentsMap.get(caseId)!.documents.push({
              attachment,
              email,
              caseTitle: caseData.title,
              caseNumber: caseData.number,
              source: "email",
            });
          });
        }
      }
      
      // 2. Fetch directly uploaded documents from storage
      for (const caseItem of cases) {
        try {
          const directDocuments = await documentController.fetchDocumentsByCase(caseItem.id);
          
          if (directDocuments.length > 0) {
            const caseId = caseItem.id;
            
            if (!documentsMap.has(caseId)) {
              documentsMap.set(caseId, {
                caseId,
                caseTitle: caseItem.title,
                caseNumber: caseItem.number,
                documents: [],
              });
            }
            
            // Add each direct document
            directDocuments.forEach((document) => {
              documentsMap.get(caseId)!.documents.push({
                document,
                caseTitle: caseItem.title,
                caseNumber: caseItem.number,
                source: "upload",
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching documents for case ${caseItem.id}:`, error);
        }
      }
      
      // Convert map to array and sort by case title
      const documentsArray = Array.from(documentsMap.values()).sort((a, b) =>
        a.caseTitle.localeCompare(b.caseTitle)
      );
      
      setDocumentsByCase(documentsArray);
      
      // Set the first case as selected if available
      if (documentsArray.length > 0 && !selectedCaseId) {
        setSelectedCaseId(documentsArray[0].caseId);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshKey]);

  // Expose refresh function via window for external calls
  useEffect(() => {
    (window as any).refreshDocumentsList = () => {
      setRefreshKey(prev => prev + 1);
    };
    return () => {
      delete (window as any).refreshDocumentsList;
    };
  }, []);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return <FileText className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-primary/20 rounded-full"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (documentsByCase.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Documents will appear here when emails with attachments are added to cases, or when documents are uploaded directly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={selectedCaseId || documentsByCase[0]?.caseId}
        onValueChange={setSelectedCaseId}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {documentsByCase.map((caseGroup) => (
            <TabsTrigger
              key={caseGroup.caseId}
              value={caseGroup.caseId}
              className="whitespace-nowrap"
            >
              {caseGroup.caseTitle}
              <Badge variant="secondary" className="ml-2">
                {caseGroup.documents.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {documentsByCase.map((caseGroup) => (
          <TabsContent key={caseGroup.caseId} value={caseGroup.caseId} className="mt-4">
            <div className="space-y-3">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{caseGroup.caseTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  Case #{caseGroup.caseNumber} • {caseGroup.documents.length} document
                  {caseGroup.documents.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid gap-3">
                {caseGroup.documents.map((doc, index) => {
                  const isEmailDoc = doc.source === "email";
                  
                  // Type-safe property access
                  let filename: string;
                  let url: string | undefined;
                  let size: number | undefined;
                  let uploadDate: string;
                  let docId: string;
                  
                  if (isEmailDoc) {
                    const emailDoc = doc as DocumentWithEmail;
                    filename = emailDoc.attachment.filename;
                    url = emailDoc.attachment.url;
                    size = emailDoc.attachment.size;
                    uploadDate = emailDoc.email.date;
                    docId = emailDoc.attachment.id;
                  } else {
                    const directDoc = doc as DirectDocument;
                    filename = directDoc.document.filename;
                    url = directDoc.document.url;
                    size = directDoc.document.size;
                    uploadDate = directDoc.document.uploaded_at;
                    docId = directDoc.document.id;
                  }

                  return (
                    <Card key={`${docId}-${index}`} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 mt-1">
                              {getFileIcon(filename)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium truncate">{filename}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {isEmailDoc ? (
                                    <>
                                      <Mail className="h-3 w-3 mr-1" />
                                      Email
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-3 w-3 mr-1" />
                                      Upload
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {isEmailDoc && (doc as DocumentWithEmail).email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {(doc as DocumentWithEmail).email.subject || "No subject"}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(uploadDate), "MMM d, yyyy")}
                                </span>
                                {size && (
                                  <span>{formatFileSize(size)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {url && (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DocumentsList;
