<?php

namespace App\Exceptions;

class PostHogIntegrationException extends \RuntimeException
{
    /** Upstream diagnostics (PostHog status/body) — exposed to the client in local env only. */
    public readonly array $context;

    public function __construct(string $message = '', array $context = [], ?\Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);

        $this->context = $context;
    }
}
