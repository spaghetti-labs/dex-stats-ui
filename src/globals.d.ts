declare module "*.svg" {
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare const API_CONFIG: {
  httpUrl: string
  wsUrl: string
  apiKeyHeader: string
  extraHeaders?: Record<string, string>
}
