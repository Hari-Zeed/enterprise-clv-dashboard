import { datasetRepository } from '@/repositories/dataset.repository';
import { logger } from '@/lib/logger';
import { ValidationError } from '@/lib/errors';
import type { PredictionInput } from '@/types/ml';

const REQUIRED_COLUMNS = ['customer_id', 'recency', 'frequency', 'monetary_value', 'tenure'];

export const datasetService = {
  validateCsvColumns(headers: string[]): void {
    const normalized = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const missing = REQUIRED_COLUMNS.filter((col) => !normalized.includes(col));
    if (missing.length > 0) {
      throw new ValidationError(`Missing required columns: ${missing.join(', ')}`);
    }
  },

  /**
   * Returns metadata about the CSV (headers, row count, preview rows).
   * Does NOT parse all rows — use parseAllRowsToPredictionInput for full data.
   */
  parseCsvMeta(csvText: string): {
    isValid: boolean;
    headers: string[];
    rowCount: number;
    preview: string[][];
  } {
    const lines = csvText.split('\n').filter((l) => l.trim());
    if (lines.length < 2) {
      throw new ValidationError('CSV must contain headers and at least one data row');
    }

    const rawHeaders = lines[0].split(',').map((h) => h.trim());
    const normalizedHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/\s+/g, '_'));
    datasetService.validateCsvColumns(normalizedHeaders);

    const dataRows = lines.slice(1);
    // Preview: first 6 lines (including header)
    const preview = lines.slice(0, 7).map((l) => l.split(',').map((c) => c.trim()));

    return {
      isValid: true,
      preview,
      headers: normalizedHeaders,
      rowCount: dataRows.length,
    };
  },

  /**
   * Parses ALL data rows in the CSV into PredictionInput records.
   * Skips rows with invalid/NaN numeric values.
   */
  parseAllRowsToPredictionInput(csvText: string): PredictionInput[] {
    const lines = csvText.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];

    const rawHeaders = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const dataLines = lines.slice(1);

    const records: PredictionInput[] = [];

    for (const line of dataLines) {
      const cells = line.split(',').map((c) => c.trim());
      const obj: Record<string, string> = {};
      rawHeaders.forEach((h, i) => {
        obj[h] = cells[i] ?? '';
      });

      const recency = parseFloat(obj['recency']);
      const frequency = parseFloat(obj['frequency']);
      const monetary_value = parseFloat(obj['monetary_value']);
      const tenure = parseFloat(obj['tenure']);

      // Skip rows with invalid numerics
      if (isNaN(recency) || isNaN(frequency) || isNaN(monetary_value) || isNaN(tenure)) {
        continue;
      }

      records.push({
        customer_id: obj['customer_id'] || undefined,
        recency,
        frequency,
        monetary_value,
        tenure,
      });
    }

    return records;
  },

  async uploadDataset(
    userId: string,
    fileName: string,
    fileSize: number,
    csvText: string
  ) {
    logger.info('DatasetService', `Processing upload: ${fileName}`, { userId });

    const { headers, rowCount } = datasetService.parseCsvMeta(csvText);

    const dataset = await datasetRepository.create({
      name: fileName.replace('.csv', ''),
      userId,
      fileName,
      fileSize,
      rowCount,
      columnCount: headers.length,
      csvData: csvText,
      columns: headers,
      dataTypes: headers.map(() => 'numeric'),
    });

    logger.info('DatasetService', `Dataset created: ${dataset.id}`, { rowCount });
    return dataset;
  },
};
