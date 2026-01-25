import { supabase } from "@/integrations/supabase/client";

export interface CaseDocument {
  id: string;
  case_id: string;
  filename: string;
  type: string;
  url: string;
  size?: number;
  uploaded_at: string;
  user_id: string;
}

export interface CreateDocumentInput {
  case_id: string;
  filename: string;
  type: string;
  url: string;
  size?: number;
  user_id: string;
}

// Bucket name - make sure this matches your Supabase Storage bucket name
// Common names: "case_documents" (plural) or "case_document" (singular)
const BUCKET_NAME = "case_document";

export const documentModel = {
  // Upload a document to Supabase Storage and create a record
  async uploadDocument(
    file: File,
    caseId: string,
    userId: string,
  ): Promise<CaseDocument | null> {
    try {
      // Upload file to Supabase Storage
      const fileName = `${userId}/${caseId}/${Date.now()}-${file.name}`;
      const bucketName = BUCKET_NAME;

      // Try to upload directly - this will fail if bucket doesn't exist or user lacks permissions
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading document:", uploadError);
        
        // Check if it's a bucket not found error
        if (uploadError.message?.includes("Bucket not found") || 
            uploadError.message?.includes("not found") ||
            uploadError.statusCode === 404) {
          throw new Error(
            `Bucket "${bucketName}" not found. Please create it in Supabase Dashboard:\n` +
            `1. Go to Storage in your Supabase Dashboard\n` +
            `2. Click "New bucket"\n` +
            `3. Name: "${bucketName}"\n` +
            `4. Enable "Public bucket"\n` +
            `5. Set file size limit (e.g., 50MB)\n` +
            `6. Click "Create bucket"`
          );
        }
        
        // Check if it's a permissions/RLS error
        if (uploadError.message?.includes("policy") || 
            uploadError.message?.includes("permission") ||
            uploadError.message?.includes("row-level security")) {
          throw new Error(
            `Upload failed due to permissions: ${uploadError.message}. ` +
            `Please check your bucket's RLS policies in Supabase Dashboard.`
          );
        }
        
        throw new Error(
          `Upload failed: ${uploadError.message}. Check bucket permissions and RLS policies.`,
        );
      }

      // Get the public URL for the uploaded document
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        console.error("Failed to get public URL for document");
        return null;
      }

      // Create document record (we'll store this in a JSON column or create a documents table)
      // For now, we'll return the document metadata
      const document: CaseDocument = {
        id: fileName,
        case_id: caseId,
        filename: file.name,
        type: file.type,
        url: urlData.publicUrl,
        size: file.size,
        uploaded_at: new Date().toISOString(),
        user_id: userId,
      };

      return document;
    } catch (error) {
      console.error("Error in uploadDocument:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  },

  // Get documents for a specific case
  async getDocumentsByCase(caseId: string): Promise<CaseDocument[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        console.error("No authenticated user found");
        return [];
      }

      // List files in the case's folder
      const folderPath = `${user.user.id}/${caseId}/`;
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Error fetching documents:", error.message);
        return [];
      }

      if (!files || files.length === 0) {
        return [];
      }

      // Convert storage files to CaseDocument format
      const documents: CaseDocument[] = await Promise.all(
        files.map(async (file) => {
          const filePath = `${folderPath}${file.name}`;
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

          return {
            id: filePath,
            case_id: caseId,
            filename: file.name.replace(/^\d+-/, ""), // Remove timestamp prefix
            type: file.metadata?.mimetype || "application/octet-stream",
            url: urlData?.publicUrl || "",
            size: file.metadata?.size || 0,
            uploaded_at: file.created_at || new Date().toISOString(),
            user_id: user.user.id,
          };
        }),
      );

      return documents;
    } catch (error) {
      console.error("Error in getDocumentsByCase:", error);
      return [];
    }
  },

  // Delete a document from Supabase Storage
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        console.error("No authenticated user found");
        return false;
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([documentId]);

      if (error) {
        console.error("Error deleting document:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteDocument:", error);
      return false;
    }
  },
};
