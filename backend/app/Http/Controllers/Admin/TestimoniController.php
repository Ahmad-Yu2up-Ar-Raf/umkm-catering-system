<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TestimoniVisibilityEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Testimoni\StoreTestimoniRequest;
use App\Http\Requests\Admin\Testimoni\UpdateTestimoniRequest;
use App\Http\Resources\TestimoniResource;
use App\Models\Testimoni;
use App\Services\ExcelExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TestimoniController extends Controller
{
    private function buildListQuery(Request $request): array
    {
        $search = $request->input('search');
        $visibility = $this->normalizeVisibilityFilter($request->input('visibility'));
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $query = Testimoni::query()->with('paket:id,nama_paket,thumbnail,harga_per_porsi');

        if ($search) {
            $query->search($search);
        }

        if ($visibility !== []) {
            $query->whereIn('visibility', $visibility);
        }

        $allowedSorts = ['nama', 'acara', 'lokasi', 'tanggal_acara', 'visibility', 'rating', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $allowedSorts) ? $sortBy : 'created_at';
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? $sortDir : 'desc';

        $query->orderBy($sortBy, $sortDir);

        $filters = array_filter([
            'search' => $search,
            'visibility' => $visibility,
            'sort_by' => $sortBy,
            'sort_dir' => $sortDir,
        ], fn ($value) => ! is_null($value) && $value !== '' && $value !== []);

        return [$query, $filters];
    }

    /**
     * Display a paginated listing of the resource (admin).
     */
    public function index(Request $request)
    {
        [$query, $filters] = $this->buildListQuery($request);

        $page = $request->integer('page', 1);
        $perPage = $request->integer('perPage', 10);

        $paginate = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json($this->respondWithPagination(
            $paginate->through(fn (Testimoni $item) => new TestimoniResource($item)),
            'Data retrieved successfully',
            $filters
        ));
    }

    public function export(Request $request): StreamedResponse
    {
        [$query] = $this->buildListQuery($request);

        $headers = ['Nama Pelanggan', 'Detail Pesanan', 'Acara', 'Lokasi', 'Paket', 'Rating', 'Visibilitas', 'Tanggal Acara', 'Dibuat'];
        $widths = [20, 32, 18, 18, 20, 10, 12, 14, 18];

        $rows = (function () use ($query) {
            foreach ($query->cursor() as $t) {
                yield [
                    ExcelExportService::text($t->nama),
                    ExcelExportService::text($t->pesanan),
                    ExcelExportService::text($t->acara),
                    ExcelExportService::text($t->lokasi),
                    ExcelExportService::text($t->paket?->nama_paket),
                    ExcelExportService::text($t->rating !== null ? $t->rating.'/5' : null),
                    ExcelExportService::statusLabel($t->visibility),
                    ExcelExportService::date($t->tanggal_acara),
                    ExcelExportService::datetime($t->created_at),
                ];
            }
        })();

        return ExcelExportService::stream(
            ExcelExportService::filename('testimoni'), $headers, $rows, $widths,
            'LAPORAN DATA TESTIMONI', ExcelExportService::subtitle()
        );
    }

    /**
     * Store a newly created resource in storage (admin).
     */
    public function store(StoreTestimoniRequest $request)
    {
        $testimoni = Testimoni::query()->create($request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Testimoni created successfully',
            'data' => new TestimoniResource($testimoni->load('paket:id,nama_paket,thumbnail,harga_per_porsi')),
        ], 201);
    }

    /**
     * Display the specified resource (admin).
     */
    public function show(Testimoni $testimoni)
    {
        return response()->json([
            'status' => true,
            'message' => 'Data retrieved successfully',
            'data' => new TestimoniResource($testimoni->load('paket:id,nama_paket,thumbnail,harga_per_porsi')),
        ]);
    }

    public function update(UpdateTestimoniRequest $request, Testimoni $testimoni)
    {
        $testimoni->update($request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Testimoni updated successfully',
            'data' => new TestimoniResource($testimoni->load('paket:id,nama_paket,thumbnail,harga_per_porsi')),
        ]);
    }

    public function destroy(Testimoni $testimoni)
    {
        Log::info('DELETE ROUTE HIT', ['id' => $testimoni->id]);

        try {
            $deleted = $testimoni->delete();
            Log::info('DB DELETION SUCCESSFUL', ['id' => $testimoni->id, 'result' => (bool) $deleted]);
        } catch (\Throwable $e) {
            Log::error('DB DELETION FAILED', [
                'testimoni_id' => $testimoni->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Gagal menghapus testimoni dari database: '.$e->getMessage(),
                'data' => null,
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => 'Testimoni deleted successfully',
            'data' => null,
        ]);
    }

    /**
     * Bulk update — single whitelisted field for many testimoni IDs.
     * Currently only `visibility` is whitelisted (bulk visibility action).
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', \Illuminate\Validation\Rule::exists('testimoni', 'id')],
            'field' => ['required', 'string', \Illuminate\Validation\Rule::in(['visibility'])],
            'value' => ['required', 'string'],
        ]);

        $ids = $request->input('ids');
        $field = $request->input('field');
        $value = $request->input('value');

        $allowed = array_map(fn ($case) => $case->value, TestimoniVisibilityEnum::cases());
        if (! in_array($value, $allowed, true)) {
            return response()->json(['status' => false, 'message' => 'Invalid visibility value'], 422);
        }

        \App\Models\Testimoni::whereIn('id', $ids)->update([$field => $value]);

        return response()->json(['status' => true, 'message' => count($ids).' testimoni berhasil diperbarui'], 200);
    }

    /**
     * Bulk delete — hard delete.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', \Illuminate\Validation\Rule::exists('testimoni', 'id')],
        ]);

        $ids = $request->input('ids');

        \App\Models\Testimoni::whereIn('id', $ids)->delete();

        return response()->json(['status' => true, 'message' => count($ids).' testimoni berhasil dihapus'], 200);
    }

    /**
     * Normalize the visibility filter into a whitelisted array.
     * Accepts `visibility=public` or repeated `visibility[]=public&visibility[]=private`.
     * Invalid values are silently dropped (never 500 on bad input).
     */
    private function normalizeVisibilityFilter(mixed $input): array
    {
        if (is_string($input)) {
            $input = [$input];
        }

        if (! is_array($input)) {
            return [];
        }

        $allowed = array_map(fn ($case) => $case->value, TestimoniVisibilityEnum::cases());

        return array_values(array_unique(array_filter(
            $input,
            fn ($value) => is_string($value) && in_array($value, $allowed, true)
        )));
    }
}
