//app.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';
import { appDir } from '@tauri-apps/api/path';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  files: any[] = [];
  selectedFilePath: string | null = null;

  ngOnInit() {
    this.setupTauriDragDropListener();
  }

  /**
   * Set up Tauri drag-and-drop event listener
   */
  setupTauriDragDropListener() {
    listen('tauri://drag-drop', async (event: any) => {
      alert("File dropped");
      this.selectedFilePath = event.payload[0];
      alert(this.selectedFilePath);

      // Verify the file using Tauri's invoke function
      const result = await invoke('verify_single_file', { filePath: this.selectedFilePath });
      alert(result);

      // Handle the file if selectedFilePath is not null
      if (this.selectedFilePath) {
        this.handleTauriFileDrop(this.selectedFilePath);
      }
    });
  }

  /**
   * Handle file drop from Tauri
   * @param filePath (File path)
   */
  async handleTauriFileDrop(filePath: string) {
    const file = { name: filePath, progress: 0, size: 0 };
    this.files.push(file);
    this.uploadFilesSimulator(0);
  }

  /**
   * Prevent file copying outside the drag and drop area
   */
  @HostListener('document:drop', ['$event'])
  preventDropOutside(event: DragEvent) {
    if (!event.target || !(event.target as HTMLElement).classList.contains('dropzone')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * on file drop handler
   */
  onFileDropped($event: any[]) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any[]) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    this.uploadFilesSimulator(0);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals: number) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Download and open file
   * @param fileName (File name)
   * @param content (File content)
   */
  async downloadAndOpenFile(fileName: string, content: string) {
    const filePath = await appDir() + fileName;
    await writeTextFile(filePath, content);
    const fileContent = await readTextFile(filePath);
    alert('File downloaded and opened: ' + fileContent);
  }
}