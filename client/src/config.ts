/// <reference types="vite/client" />

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? ''

export const APP_VERSION: string =
  import.meta.env.VITE_APP_VERSION ?? '1.1.0'
