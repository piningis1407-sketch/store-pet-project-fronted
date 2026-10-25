interface ApiErrorBody {
    message?: unknown;
    error?: unknown;
    errors?: unknown;
}

function parseErrorBody(body: string): ApiErrorBody | null {
    try {
        const parsed: unknown = JSON.parse(body);

        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as ApiErrorBody;
        }
    } catch {
        // Сервер мог вернуть обычный текст вместо JSON.
    }

    return null;
}

export function getRussianApiError(
    body: string,
    status: number,
    path = '',
): string {
    const data = parseErrorBody(body);
    const message =
        typeof data?.message === 'string' ? data.message : '';

    const normalizedPath = path.toLowerCase();

    if (
        status === 401 &&
        (normalizedPath.includes('/api/auth/login') ||
            normalizedPath.includes('/api/auth/register'))
    ) {
        return normalizedPath.includes('/login')
            ? 'Неверный email или пароль.'
            : 'Не удалось выполнить регистрацию. Проверьте введённые данные.';
    }

    if (message.toLowerCase().includes('product not found')) {
        return 'Товар не найден. Возможно, он был удалён или ссылка устарела.';
    }

    if (message.toLowerCase().includes('category not found')) {
        return 'Категория не найдена или больше недоступна.';
    }

    if (
        message.toLowerCase().includes('email уже зарегистрирован') ||
        (
            normalizedPath.includes('/api/auth/register') &&
            message.toLowerCase().includes('email')
        )
    ) {
        return 'Этот email уже зарегистрирован.';
    }

    if (status === 409) {
        return message.trim()
            ? `Конфликт данных: ${message}`
            : 'Такие данные уже существуют. Проверьте введённые значения.';
    }

    if (status === 400) {
        return 'Проверьте правильность введённых данных.';
    }

    if (status === 401) {
        return 'Необходимо войти в аккаунт заново.';
    }

    if (status === 403) {
        return 'У вас недостаточно прав для выполнения этого действия.';
    }

    if (status === 404) {
        return 'Запрашиваемая информация не найдена.';
    }

    if (status === 415) {
        return 'Не удалось обработать данные запроса. Попробуйте ещё раз.';
    }

    if (status === 422) {
        return 'Проверьте заполнение полей формы.';
    }

    if (status === 429) {
        return 'Слишком много запросов. Попробуйте немного позже.';
    }

    if (status >= 500) {
        return 'На сервере произошла ошибка. Попробуйте позже.';
    }

    if (status >= 400) {
        return 'Не удалось выполнить запрос. Попробуйте ещё раз.';
    }

    return 'Не удалось выполнить запрос.';
}

export function getRussianErrorMessage(error: unknown): string {
    if (error instanceof TypeError) {
        return 'Не удалось связаться с сервером. Проверьте подключение и убедитесь, что backend запущен.';
    }

    if (error instanceof Error) {
        const message = error.message;

        if (
            message.includes('Failed to fetch') ||
            message.includes('NetworkError') ||
            message.includes('Load failed')
        ) {
            return 'Не удалось связаться с сервером. Проверьте подключение и убедитесь, что backend запущен.';
        }

        if (message.trim()) {
            return message;
        }
    }

    return 'Произошла непредвиденная ошибка. Попробуйте ещё раз.';
}