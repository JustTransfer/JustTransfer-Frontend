function getEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined || value.trim() === "") {
        throw new Error(`Environment variable ${name} is not set or empty`);
    }
    return value;
}

export const apiUrl = getEnv("REACT_APP_API_URL");
export const frontendUrl = getEnv("REACT_APP_FRONTEND_URL");