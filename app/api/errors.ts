export interface ApiErrorBody {
  code: string;
  title: string;
  description: string;
  rawErrorMessage?: string | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly title: string;
  readonly description: string;

  constructor(status: number, body: Partial<ApiErrorBody> | null) {
    const description = body?.description ?? "Не удалось получить данные";
    super(description);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code ?? "UNKNOWN_ERROR";
    this.title = body?.title ?? "Ошибка";
    this.description = description;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}
