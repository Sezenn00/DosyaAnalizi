// upload-file-page.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-upload-file-page',
  templateUrl: './upload-file-page.component.html',
  styleUrls: ['./upload-file-page.component.scss']
})
export class UploadFilePageComponent {
  file: File | null = null;
  fileName: string = '';
  fileSize: string = '';
  tableData: { date: string, time: string, transfer: string, address: string, compiler?: string, data?: string }[] = [];
  filteredData: { date: string, time: string, transfer: string, address: string, compiler?: string, data?: string }[] = [];
  headers: string[] = ['Date', 'Time', 'Transfer', 'Address'];
  sortColumn: string = '';
  sortOrder: string = 'asc';
  filterText: string = '';
  showDialog: boolean = false;
  isUploading: boolean = false;
  uploadProgress: number = 0;

  //  Dosya seçim penceresini aç
  openFileDialog() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.simulateUpload(file);
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.simulateUpload(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  simulateUpload(file: File) {
    this.isUploading = true;
    this.uploadProgress = 0;
    this.fileName = file.name;
    this.fileSize = (file.size / 1024).toFixed(2) + ' KB'; // Dosya boyutu kilobayt cinsinden

    const uploadInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(uploadInterval);
        this.isUploading = false;
        this.handleFile(file);
      }
    }, 100);
  }

  handleFile(file: File) {
    this.file = file;
    this.readFile(file);
  }

  readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      this.parseFileContent(content);
    };
    reader.readAsText(file);
  }

  parseFileContent(content: string) {
    const lines = content.split('\n').filter(line => line.trim() !== '');

    if (lines.length > 0 && this.isHeaderLine(lines[0])) {
      this.headers = lines[0].split(/\s+/).map(header => header.trim());
      lines.shift(); // Remove the header line from data
    }

    this.tableData = lines.map(line => {
      const [date, time, transfer, address, compiler, data] = line.split(/\s+/).map(value => value.trim());
      return { date, time, transfer, address, compiler, data };
    });

    this.filteredData = [...this.tableData];
    this.applySortingAndFiltering();
  }

  isHeaderLine(line: string): boolean {
    const headerKeywords = ['Date', 'Time', 'Transfer', 'Address'];
    return headerKeywords.some(keyword => line.includes(keyword));
  }

  updateHeader(index: number) {
    const newHeader = window.prompt('Enter new header:', this.headers[index]);
    if (newHeader !== null) {
      this.headers[index] = newHeader.trim() === '' ? `Column ${index + 1}` : newHeader;
    }
  }

  sortTable(column: string) {
    if (this.headers.indexOf(column) === -1) return;

    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.applySortingAndFiltering();
  }

  filterTable() {
    this.applySortingAndFiltering();
  }

  applySortingAndFiltering() {
    let data = [...this.tableData];

    // Filtering
    if (this.filterText) {
      data = data.filter(row =>
        Object.values(row).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(this.filterText.toLowerCase())
        )
      );
    }

    // Sorting
    if (this.sortColumn && this.headers.indexOf(this.sortColumn) !== -1) {
      data.sort((a, b) => {
        const valueA = this.getColumnValue(a, this.sortColumn);
        const valueB = this.getColumnValue(b, this.sortColumn);

        if (this.sortColumn === 'Date') {
          // Handle undefined values for date columns
          const dateA = valueA ? new Date(valueA) : new Date(0);
          const dateB = valueB ? new Date(valueB) : new Date(0);

          return this.sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        } else {
          const valueAString = valueA ? valueA.toString().toLowerCase() : '';
          const valueBString = valueB ? valueB.toString().toLowerCase() : '';

          if (valueAString < valueBString) return this.sortOrder === 'asc' ? -1 : 1;
          if (valueAString > valueBString) return this.sortOrder === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    this.filteredData = data;
  }

  getColumnValue(row: { date: string, time: string, transfer: string, address: string }, column: string): string | undefined {
    const index = this.headers.indexOf(column);
    if (index === -1) return undefined;

    let value: string | undefined;
    switch (index) {
      case 0:
        value = this.normalizeDate(row.date);
        break;
      case 1:
        value = row.time;
        break;
      case 2:
        value = row.transfer;
        break;
      case 3:
        value = row.address;
        break;
    }
    return value;
  }

  normalizeDate(date: string): string {
    const parts = date.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return date;
  }

  promptSaveOptions() {
    this.showDialog = true;
  }

  onSave() {
    this.downloadFile();
    this.resetToUpload();
  }

  onCancel() {
    this.showDialog = false; // Close the dialog but stay on the current page
  }

  onIgnore() {
    this.file = null;
    this.resetToUpload();
  }

  downloadFile() {
    if (!this.file) return;

    const blob = new Blob([this.convertTableToCSV()], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'updated-file.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  convertTableToCSV(): string {
    const rows = [this.headers.map(header => `"${header}"`).join(','), ...this.tableData.map(row =>
      [row.date, row.time, row.transfer, row.address].map(cell => `"${cell}"`).join(',')
    )];
    return rows.join('\n');
  }

  resetToUpload() {
    this.file = null;
    this.tableData = [];
    this.filteredData = [];
    this.headers = ['Date', 'Time', 'Transfer', 'Address'];
    this.filterText = '';
    this.showDialog = false;
    this.isUploading = false;
    this.uploadProgress = 0;
  }

  // Path Kısaltma Fonksiyonları
  getFullPath(path: string): string {
    return path.length > 30 ? path : '';
  }

  getShortenedPath(path: string): string {
    const maxLength = 30;
    if (path.length > maxLength) {
      const start = path.substring(0, 10);
      const end = path.substring(path.length - 10, path.length);
      return `${start}...${end}`;
    } else {
      return path;
    }
  }
}