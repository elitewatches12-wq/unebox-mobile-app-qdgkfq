
import { useState, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DocumentProcessingResult {
  documentId: string;
  success: boolean;
  analysis?: {
    titre: string;
    categorie: string;
    type_document: string;
    emetteur: string;
    date_document: string | null;
    date_limite: string | null;
    montant: number | null;
    resume: string;
    rappel: {
      action: string;
      date: string;
      message: string;
    } | null;
    chemin_classement: string;
    extracted_text: string;
  };
  error?: string;
}

export function useDocumentProcessor() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadAndProcess = useCallback(
    async (file: {
      uri: string;
      name: string;
      type: string;
      size?: number;
    }): Promise<DocumentProcessingResult | null> => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      try {
        setProcessing(true);
        setProgress(0);
        setError(null);

        console.log('[DocumentProcessor] Starting upload for:', file.name);

        // Step 1: Upload file to Supabase Storage (25%)
        setProgress(25);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Fetch the file from URI
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, blob, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('[DocumentProcessor] Upload error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log('[DocumentProcessor] File uploaded:', uploadData.path);

        // Step 2: Get signed URL (private bucket)
        setProgress(35);
        const { data: urlData, error: urlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (urlError || !urlData) {
          console.error('[DocumentProcessor] Error getting signed URL:', urlError);
          throw new Error('Failed to get file URL');
        }

        console.log('[DocumentProcessor] Got signed URL');

        // Step 3: Create document record (45%)
        setProgress(45);
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            title: file.name,
            file_url: filePath, // Store the path, not the signed URL
            file_type: file.type,
            file_size: file.size || null,
            processing_status: 'pending',
          })
          .select()
          .single();

        if (docError) {
          console.error('[DocumentProcessor] Document creation error:', docError);
          throw new Error(`Failed to create document: ${docError.message}`);
        }

        console.log('[DocumentProcessor] Document created:', docData.id);

        // Step 4: Process document with AI (60%)
        setProgress(60);

        // Get the session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        // Call the Edge Function with document info
        const { data: processData, error: processError } = await supabase.functions.invoke(
          'process-document',
          {
            body: {
              documentId: docData.id,
              fileUrl: urlData.signedUrl,
              fileType: file.type,
            },
          }
        );

        if (processError) {
          console.error('[DocumentProcessor] Processing error:', processError);
          
          // Update document status to failed
          await supabase
            .from('documents')
            .update({
              processing_status: 'failed',
              processing_error: processError.message,
            })
            .eq('id', docData.id);

          throw new Error(`Processing failed: ${processError.message}`);
        }

        console.log('[DocumentProcessor] Document processed successfully');

        // Step 5: Complete (100%)
        setProgress(100);

        return {
          documentId: docData.id,
          success: true,
          analysis: processData.analysis,
        };
      } catch (err: any) {
        console.error('[DocumentProcessor] Error:', err);
        setError(err.message || 'Unknown error');
        return {
          documentId: '',
          success: false,
          error: err.message || 'Unknown error',
        };
      } finally {
        setProcessing(false);
      }
    },
    [user]
  );

  const retryProcessing = useCallback(
    async (documentId: string): Promise<boolean> => {
      if (!user) {
        console.error('[DocumentProcessor] No user for retry');
        return false;
      }

      try {
        console.log('[DocumentProcessor] Retrying processing for:', documentId);

        // Get document info
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (docError || !doc) {
          console.error('[DocumentProcessor] Error fetching document:', docError);
          return false;
        }

        // Update status to pending
        await supabase
          .from('documents')
          .update({
            processing_status: 'pending',
            processing_error: null,
          })
          .eq('id', documentId);

        // Get signed URL for the file
        const { data: urlData, error: urlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(doc.file_url, 3600);

        if (urlError || !urlData) {
          console.error('[DocumentProcessor] Error getting signed URL:', urlError);
          return false;
        }

        // Get the session token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('[DocumentProcessor] No active session');
          return false;
        }

        // Call the Edge Function
        const { error: processError } = await supabase.functions.invoke(
          'process-document',
          {
            body: {
              documentId: doc.id,
              fileUrl: urlData.signedUrl,
              fileType: doc.file_type,
            },
          }
        );

        if (processError) {
          console.error('[DocumentProcessor] Retry processing error:', processError);
          return false;
        }

        console.log('[DocumentProcessor] Retry successful');
        return true;
      } catch (err) {
        console.error('[DocumentProcessor] Retry exception:', err);
        return false;
      }
    },
    [user]
  );

  const reset = useCallback(() => {
    setProcessing(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadAndProcess,
    retryProcessing,
    processing,
    progress,
    error,
    reset,
  };
}
