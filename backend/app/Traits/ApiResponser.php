<?php

namespace App\Traits;

use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponser
{
    /**
     * Return a standardized API response with pagination.
     */
    public function respondWithPagination(
        LengthAwarePaginator $paginator,
        string $message = 'Data retrieved successfully',
        array $filters = []
    ): array
    {
        $data = $paginator->items();
        
        return [
            'status' => true,
            'message' => $message,
            'data' => $data,
            'meta' => [
                'filters' => $filters,
                'pagination' => [
                    'total' => $paginator->total(),
                    'currentPage' => $paginator->currentPage(),
                    'perPage' => $paginator->perPage(),
                    'lastPage' => $paginator->lastPage(),
                    'hasMore' => $paginator->currentPage() < $paginator->lastPage(),
                ],
            ],
        ];
    }
}
