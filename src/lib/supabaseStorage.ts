import { supabase } from './supabaseClient';
import { DocumentFile } from '../types';

const EMPLOYEE_DOCUMENTS_BUCKET = 'employee-documents';
const getEmployeeFolder = (employeeId: string) => `employees/${employeeId}/`;

const inferMimeType = (fileName: string) => {
  const normalized = fileName.toLowerCase();
  if (normalized.endsWith('.pdf')) return 'application/pdf';
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.gif')) return 'image/gif';
  if (normalized.endsWith('.docx') || normalized.endsWith('.doc')) return 'application/msword';
  if (normalized.endsWith('.xlsx') || normalized.endsWith('.xls')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (normalized.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
};

export async function uploadEmployeeDocument(employeeId: string, docKey: string, file: File) {
  const fileName = file.name.replace(/\s+/g, '_');
  const storagePath = `${getEmployeeFolder(employeeId)}${docKey}-${Date.now()}-${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from(EMPLOYEE_DOCUMENTS_BUCKET)
    .upload(storagePath, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData, error: publicUrlError } = supabase.storage
    .from(EMPLOYEE_DOCUMENTS_BUCKET)
    .getPublicUrl(storagePath);

  if (publicUrlError) {
    throw publicUrlError;
  }

  if (!publicUrlData?.publicUrl) {
    throw new Error('Unable to generate public URL for uploaded file.');
  }

  return {
    storagePath,
    downloadUrl: publicUrlData.publicUrl,
    mimeType: file.type || inferMimeType(file.name)
  };
}

export async function deleteEmployeeDocument(storagePath: string) {
  const { error } = await supabase.storage
    .from(EMPLOYEE_DOCUMENTS_BUCKET)
    .remove([storagePath]);

  return error;
}

export async function listEmployeeDocumentFiles(employeeId: string): Promise<DocumentFile[]> {
  const prefix = getEmployeeFolder(employeeId);
  const { data, error } = await supabase.storage
    .from(EMPLOYEE_DOCUMENTS_BUCKET)
    .list(prefix, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  const files: DocumentFile[] = [];

  for (const item of data) {
    if (item.name.endsWith('/')) {
      continue;
    }

    const storagePath = `${prefix}${item.name}`;
    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from(EMPLOYEE_DOCUMENTS_BUCKET)
      .getPublicUrl(storagePath);

    if (publicUrlError || !publicUrlData?.publicUrl) {
      console.warn('Unable to generate public URL for', storagePath, publicUrlError);
      continue;
    }

    files.push({
      key: `storage-${item.name}`,
      label: item.name,
      name: item.name,
      type: inferMimeType(item.name),
      data: publicUrlData.publicUrl,
      downloadUrl: publicUrlData.publicUrl,
      storagePath,
      uploadedAt: item.updated_at || item.created_at || '',
      status: 'uploaded'
    });
  }

  return files;
}

type EmployeeDocumentRow = {
  id: string;
  employeeId: string;
  docKey: string;
  label: string;
  name: string;
  type: string;
  data: string;
  downloadUrl: string;
  storagePath: string;
  uploadedAt: string;
  status: 'uploaded' | 'verified';
};

const EMPLOYEE_DOCUMENTS_TABLE = 'employee_documents';

const getEmployeeDocumentId = (employeeId: string, docKey: string) => `${employeeId}-${docKey}`;

export async function fetchEmployeeDocuments(employeeId: string): Promise<DocumentFile[]> {
  const { data, error } = await supabase
    .from<EmployeeDocumentRow>(EMPLOYEE_DOCUMENTS_TABLE)
    .select('*')
    .eq('employeeId', employeeId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    key: item.docKey,
    label: item.label || item.name,
    name: item.name,
    type: item.type,
    data: item.data || item.downloadUrl || '',
    downloadUrl: item.downloadUrl || item.data || '',
    storagePath: item.storagePath || undefined,
    uploadedAt: item.uploadedAt || '',
    status: item.status || 'uploaded'
  }));
}

export async function persistEmployeeDocument(employeeId: string, document: DocumentFile) {
  const row = {
    id: getEmployeeDocumentId(employeeId, document.key),
    employeeId,
    docKey: document.key,
    label: document.label,
    name: document.name,
    type: document.type,
    data: document.data,
    downloadUrl: document.downloadUrl || document.data,
    storagePath: document.storagePath || '',
    uploadedAt: document.uploadedAt,
    status: document.status
  };

  const { error } = await supabase
    .from(EMPLOYEE_DOCUMENTS_TABLE)
    .upsert(row, { onConflict: 'id' });

  return error;
}

export async function removeEmployeeDocument(employeeId: string, docKey: string) {
  const id = getEmployeeDocumentId(employeeId, docKey);
  const { error } = await supabase
    .from(EMPLOYEE_DOCUMENTS_TABLE)
    .delete()
    .eq('id', id);

  return error;
}
