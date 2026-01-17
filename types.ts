export interface ResumeState {
  file: File | null;
  base64: string | null;
  fileName: string | null;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface TuningResult {
  markdown: string;
}
