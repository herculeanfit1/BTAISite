type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  message: string;
  level: LogLevel;
  timestamp: string;
  data?: unknown;
}

// Set default log level based on environment
const DEFAULT_LOG_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

// Log level hierarchy for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private logLevel: LogLevel;
  private serverSideLogging: boolean;

  constructor(logLevel: LogLevel = DEFAULT_LOG_LEVEL) {
    this.logLevel = logLevel;
    this.serverSideLogging = typeof window === "undefined";
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): LogEntry {
    return {
      message,
      level,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  /**
   * Format a log entry for console output
   */
  private formatLogEntry(entry: LogEntry): string {
    const { level, timestamp, message } = entry;
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Send logs to a remote service in production
   */
  private async sendToRemoteService(entry: LogEntry): Promise<void> {
    // Only send logs to remote service in production and on server side
    if (process.env.NODE_ENV !== "production" || !this.serverSideLogging) {
      return;
    }

    try {
      // In a real implementation, send logs to a service like Datadog, Sentry, etc.
      // This is a placeholder for demonstration
      const endpoint = process.env.LOG_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Don't use logger here to avoid infinite recursion
      console.error("Failed to send log to remote service:", error);
    }
  }

  /**
   * Log a message if the level is greater than or equal to the configured log level
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    // Check if we should log this level
    if (LOG_LEVELS[level] < LOG_LEVELS[this.logLevel]) {
      return;
    }

    const entry = this.createLogEntry(level, message, data);
    const formattedMessage = this.formatLogEntry(entry);

    // Log to console
    switch (level) {
      case "debug":
        // eslint-disable-next-line no-console
        console.debug(formattedMessage, data ? data : "");
        break;
      case "info":
        // eslint-disable-next-line no-console
        console.info(formattedMessage, data ? data : "");
        break;
      case "warn":
        console.warn(formattedMessage, data ? data : "");
        break;
      case "error":
        console.error(formattedMessage, data ? data : "");
        break;
    }

    // Send to remote service
    this.sendToRemoteService(entry);
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }
}

// Create a singleton instance of the logger
export const logger = new Logger();
