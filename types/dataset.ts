export type DatasetStatus = 'pending' | 'training' | 'success' | 'error';

export interface DatasetRecord {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: string[];
  status: DatasetStatus;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadResult {
  dataset: DatasetRecord;
  message: string;
}

export interface CsvValidationResult {
  isValid: boolean;
  preview: string[][];
  headers: string[];
  rowCount: number;
}
